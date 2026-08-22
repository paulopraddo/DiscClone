FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY DiscClone.Domain/DiscClone.Domain.csproj DiscClone.Domain/
COPY DiscClone.Application/DiscClone.Application.csproj DiscClone.Application/
COPY DiscClone.Infrastructure/DiscClone.Infrastructure.csproj DiscClone.Infrastructure/
COPY DiscClone.API/DiscClone.API.csproj DiscClone.API/
RUN dotnet restore DiscClone.API/DiscClone.API.csproj

COPY . .
RUN dotnet publish DiscClone.API/DiscClone.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "DiscClone.API.dll"]
