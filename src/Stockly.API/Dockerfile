FROM mcr.microsoft.com/dotnet/sdk:10.0.101 AS build
WORKDIR /source
COPY . .
RUN dotnet publish src/Stockly.API/Stockly.API.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y libpq5 krb5-locales && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Stockly.API.dll"]
