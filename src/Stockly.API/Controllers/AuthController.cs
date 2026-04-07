using Microsoft.AspNetCore.Mvc;

namespace Stockly.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration configuration) : ControllerBase
{
    private const string CookieName = "stockly_session";

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var expectedKey = configuration["Auth:ApiKey"];

        if (string.IsNullOrEmpty(expectedKey) || request.ApiKey != expectedKey)
            return Unauthorized(new { detail = "Clé API invalide." });

        Response.Cookies.Append(CookieName, expectedKey, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            MaxAge = TimeSpan.FromDays(3650),
        });

        return Ok();
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieName);
        return Ok();
    }
}

public record LoginRequest(string ApiKey);
