using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiscClone.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerificationToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_email_verified",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "verification_code",
                table: "users",
                type: "character varying(6)",
                maxLength: 6,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "verification_code_expires_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            // Contas criadas antes da verificação de e-mail existir já são de pessoas reais
            // usando o app — não faz sentido bloquear o login delas retroativamente.
            migrationBuilder.Sql("UPDATE users SET is_email_verified = true;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_email_verified",
                table: "users");

            migrationBuilder.DropColumn(
                name: "verification_code",
                table: "users");

            migrationBuilder.DropColumn(
                name: "verification_code_expires_at",
                table: "users");
        }
    }
}
