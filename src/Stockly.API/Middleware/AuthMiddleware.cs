namespace Stockly.API.Middleware;

public class AuthMiddleware(RequestDelegate next)
{
    private const string CookieName = "stockly_session";
    private const string LoginPath = "/api/auth/login";

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments(LoginPath))
        {
            await next(context);
            return;
        }

        var sessionToken = context.Request.Cookies[CookieName];
        var expectedToken = context.RequestServices
            .GetRequiredService<IConfiguration>()["Auth:ApiKey"];

        if (string.IsNullOrEmpty(sessionToken) || sessionToken != expectedToken)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        await next(context);
    }
}
