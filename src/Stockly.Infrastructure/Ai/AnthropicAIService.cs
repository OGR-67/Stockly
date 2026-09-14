using System.Text.Json;
using Anthropic.Exceptions;
using Anthropic.Models.Messages;
using Anthropic.Services;
using Stockly.Application.DTOs.Ai;
using Stockly.Application.Exceptions;
using Stockly.Application.Interfaces.Repositories;
using Stockly.Application.Interfaces.Services;

namespace Stockly.Infrastructure.Ai;

/// <summary>
/// Implémentation d'<see cref="IAIService"/> qui appelle l'API Messages d'Anthropic avec vision
/// pour extraire les articles d'un ticket de caisse ou reconnaître les produits d'une étagère.
/// Dépend de <see cref="IMessageService"/> (et non du client complet) pour rester mockable en test.
/// </summary>
public class AnthropicAIService(
    IMessageService messages,
    IProductRepository productRepository,
    IStorageLocationRepository locationRepository,
    IStockUnitRepository stockUnitRepository,
    ISettingsRepository settingsRepository) : IAIService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private async Task<string> GetModelAsync()
    {
        var settings = await settingsRepository.GetAsync();
        return settings.AiModel;
    }

    public async Task<IReadOnlyList<ReceiptItem>> ParseReceiptAsync(Stream imageStream, string imageContentType, CancellationToken cancellationToken = default)
    {
        var products = await productRepository.GetAllWithDetailsAsync();
        var locations = await locationRepository.GetAllAsync();

        var catalog = JsonSerializer.Serialize(new
        {
            products = products.Select(p => new { id = p.Id, name = p.Name }),
            locations = locations.Select(l => new { id = l.Id, name = l.Name, type = l.Type.ToString(), description = l.Description }),
        });

        var systemPrompt = $"""
            Tu analyses la photo d'un ticket de caisse pour une application de gestion de stock alimentaire.
            Référentiel existant (JSON) : {catalog}
            Pour chaque article du ticket, déduis un nom de produit, une quantité, un emplacement de
            rangement suggéré et une date de péremption suggérée (format yyyy-MM-dd) selon ta
            connaissance du produit — n'utilise pas forcément une valeur par défaut, décide selon le
            produit réel. Si l'article correspond à un produit du référentiel, renseigne son id exact
            dans matchedProductId ; si un emplacement du référentiel convient, renseigne son id exact
            dans suggestedLocationId — appuie-toi sur la description de chaque emplacement quand elle
            existe (ex: "étagères buanderie : stock longue durée, PQ, conserves") pour choisir le
            bon emplacement plutôt que de te fier uniquement au nom ou au type. Laisse les champs
            vides (null) si tu n'es pas sûr.
            """;

        var response = await CreateMessageAsync(systemPrompt, "Analyse ce ticket de caisse et liste les articles achetés.", imageStream, imageContentType, ReceiptOutputSchema, cancellationToken);

        return MapReceiptResponse(ExtractText(response));
    }

    /// <summary>
    /// Logique pure de mapping JSON -> DTO, séparée de l'appel réseau pour rester testable sans
    /// avoir à reconstruire un <see cref="Message"/> Anthropic complet (dont la forme dépend de la
    /// version du SDK).
    /// </summary>
    internal static IReadOnlyList<ReceiptItem> MapReceiptResponse(string text)
    {
        var parsed = DeserializeResponse<ReceiptResponseDto>(text);
        if (parsed.Items is null)
            throw new AiServiceException("La réponse d'Anthropic ne contient pas de champ 'items' exploitable.");

        return parsed.Items.Select(i => new ReceiptItem(
            i.ProductName,
            i.Quantity,
            TryParseGuid(i.SuggestedLocationId),
            TryParseDate(i.SuggestedExpiration),
            TryParseGuid(i.MatchedProductId)
        )).ToList();
    }

    public async Task<IReadOnlyList<ShelfItem>> RecognizeShelfAsync(Stream imageStream, string imageContentType, Guid locationId, CancellationToken cancellationToken = default)
    {
        var products = await productRepository.GetAllWithDetailsAsync();
        var currentStock = await stockUnitRepository.GetByLocationWithDetailsAsync(locationId);

        var catalog = JsonSerializer.Serialize(new
        {
            products = products.Select(p => new { id = p.Id, name = p.Name }),
            currentStock = currentStock.Select(u => new { productId = u.ProductId, productName = u.Product?.Name }),
        });

        var systemPrompt = $"""
            Tu analyses la photo d'un emplacement de stockage (frigo, placard...) pour une application
            de gestion de stock alimentaire, afin d'en déduire les produits visibles.
            Référentiel existant (JSON) : {catalog}
            Pour chaque produit visible sur la photo, déduis son nom. Si le produit correspond à un
            produit du référentiel, renseigne son id exact dans matchedProductId, sinon laisse-le vide.
            """;

        var response = await CreateMessageAsync(systemPrompt, "Liste les produits visibles sur cette photo.", imageStream, imageContentType, ShelfOutputSchema, cancellationToken);

        return MapShelfResponse(ExtractText(response));
    }

    internal static IReadOnlyList<ShelfItem> MapShelfResponse(string text)
    {
        var parsed = DeserializeResponse<ShelfResponseDto>(text);
        if (parsed.Items is null)
            throw new AiServiceException("La réponse d'Anthropic ne contient pas de champ 'items' exploitable.");

        return parsed.Items.Select(i => new ShelfItem(i.ProductName, TryParseGuid(i.MatchedProductId))).ToList();
    }

    public async Task<AiConnectionTestResult> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await messages.Create(new MessageCreateParams
            {
                Model = await GetModelAsync(),
                MaxTokens = 8,
                Messages = [new() { Role = Role.User, Content = "Réponds uniquement par OK." }],
            }, cancellationToken);

            return new AiConnectionTestResult(true, null);
        }
        catch (AnthropicRateLimitException)
        {
            return new AiConnectionTestResult(false, "L'API Anthropic est temporairement limitée en débit (rate limit).");
        }
        catch (AnthropicUnauthorizedException)
        {
            return new AiConnectionTestResult(false, "Clé API Anthropic invalide ou manquante.");
        }
        catch (AnthropicApiException ex)
        {
            return new AiConnectionTestResult(false, $"Échec de l'appel à l'API Anthropic : {ex.Message}");
        }
    }

    private async Task<Message> CreateMessageAsync(string systemPrompt, string userText, Stream imageStream, string imageContentType, Dictionary<string, JsonElement> outputSchema, CancellationToken cancellationToken)
    {
        var fileData = await ToBase64Async(imageStream, cancellationToken);
        var fileBlock = BuildFileBlock(fileData, imageContentType);

        try
        {
            return await messages.Create(new MessageCreateParams
            {
                Model = await GetModelAsync(),
                MaxTokens = 4096,
                System = systemPrompt,
                Messages =
                [
                    new()
                    {
                        Role = Role.User,
                        Content = new List<ContentBlockParam>
                        {
                            fileBlock,
                            new TextBlockParam { Text = userText },
                        },
                    },
                ],
                OutputConfig = new OutputConfig
                {
                    Format = new JsonOutputFormat { Schema = outputSchema },
                },
            }, cancellationToken);
        }
        catch (AnthropicRateLimitException ex)
        {
            throw new AiServiceException("L'API Anthropic est temporairement limitée en débit (rate limit).", ex);
        }
        catch (AnthropicUnauthorizedException ex)
        {
            throw new AiServiceException("Clé API Anthropic invalide ou manquante.", ex);
        }
        catch (AnthropicApiException ex)
        {
            throw new AiServiceException($"Échec de l'appel à l'API Anthropic : {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Les bons de commande arrivent parfois en PDF plutôt qu'en photo — Anthropic supporte les
    /// deux nativement (bloc image ou bloc document), pas besoin de convertir.
    /// </summary>
    private static ContentBlockParam BuildFileBlock(string base64Data, string? contentType) =>
        contentType?.Trim().ToLowerInvariant() == "application/pdf"
            ? new DocumentBlockParam { Source = new Base64PdfSource { Data = base64Data } }
            : new ImageBlockParam { Source = new Base64ImageSource { Data = base64Data, MediaType = ResolveMediaType(contentType) } };

    /// <summary>
    /// Anthropic rejette une image si le type MIME déclaré ne correspond pas au contenu réel — on
    /// ne peut donc pas se contenter de toujours déclarer JPEG. Repli sur JPEG pour un type
    /// inconnu/absent plutôt que d'échouer : la plupart des captures mobiles sont déjà du JPEG.
    /// </summary>
    internal static MediaType ResolveMediaType(string? contentType) => contentType?.Trim().ToLowerInvariant() switch
    {
        "image/png" => MediaType.ImagePng,
        "image/gif" => MediaType.ImageGif,
        "image/webp" => MediaType.ImageWebP,
        "image/heic" or "image/heif" => throw new AiServiceException(
            "Format HEIC/HEIF non supporté par l'IA — reprenez la photo directement depuis l'appareil (et non depuis la pellicule/un fichier partagé) ou convertissez-la en JPEG avant l'envoi."),
        _ => MediaType.ImageJpeg,
    };

    private static async Task<string> ToBase64Async(Stream imageStream, CancellationToken cancellationToken)
    {
        using var memoryStream = new MemoryStream();
        await imageStream.CopyToAsync(memoryStream, cancellationToken);
        return Convert.ToBase64String(memoryStream.ToArray());
    }

    private static string ExtractText(Message response) =>
        response.Content
            .Select(b => b.Value)
            .OfType<TextBlock>()
            .Select(b => b.Text)
            .FirstOrDefault()
            ?? throw new AiServiceException("La réponse d'Anthropic ne contient aucun bloc texte exploitable.");

    private static T DeserializeResponse<T>(string text)
    {
        try
        {
            return JsonSerializer.Deserialize<T>(text, JsonOptions)
                ?? throw new AiServiceException("La réponse d'Anthropic n'a pas pu être interprétée.");
        }
        catch (JsonException ex)
        {
            throw new AiServiceException("La réponse d'Anthropic n'est pas un JSON valide.", ex);
        }
    }

    private static Guid? TryParseGuid(string? value) =>
        Guid.TryParse(value, out var guid) ? guid : null;

    private static DateOnly? TryParseDate(string? value) =>
        DateOnly.TryParse(value, out var date) ? date : null;

    private static readonly Dictionary<string, JsonElement> ReceiptOutputSchema = new()
    {
        ["type"] = JsonSerializer.SerializeToElement("object"),
        ["properties"] = JsonSerializer.SerializeToElement(new
        {
            items = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    properties = new
                    {
                        productName = new { type = "string" },
                        quantity = new { type = "integer" },
                        matchedProductId = new { type = new[] { "string", "null" } },
                        suggestedLocationId = new { type = new[] { "string", "null" } },
                        suggestedExpiration = new { type = new[] { "string", "null" }, description = "Format yyyy-MM-dd" },
                    },
                    // additionalProperties: false exige que toutes les propriétés soient listées ici
                    // (Anthropic structured outputs) — les champs optionnels restent nullable via leur type.
                    required = new[] { "productName", "quantity", "matchedProductId", "suggestedLocationId", "suggestedExpiration" },
                    additionalProperties = false,
                },
            },
        }),
        ["required"] = JsonSerializer.SerializeToElement(new[] { "items" }),
        ["additionalProperties"] = JsonSerializer.SerializeToElement(false),
    };

    private static readonly Dictionary<string, JsonElement> ShelfOutputSchema = new()
    {
        ["type"] = JsonSerializer.SerializeToElement("object"),
        ["properties"] = JsonSerializer.SerializeToElement(new
        {
            items = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    properties = new
                    {
                        productName = new { type = "string" },
                        matchedProductId = new { type = new[] { "string", "null" } },
                    },
                    required = new[] { "productName", "matchedProductId" },
                    additionalProperties = false,
                },
            },
        }),
        ["required"] = JsonSerializer.SerializeToElement(new[] { "items" }),
        ["additionalProperties"] = JsonSerializer.SerializeToElement(false),
    };

    private record ReceiptResponseDto(List<ReceiptItemDto> Items);

    private record ReceiptItemDto(
        string ProductName,
        int Quantity,
        string? MatchedProductId,
        string? SuggestedLocationId,
        string? SuggestedExpiration
    );

    private record ShelfResponseDto(List<ShelfItemDto> Items);

    private record ShelfItemDto(string ProductName, string? MatchedProductId);
}
