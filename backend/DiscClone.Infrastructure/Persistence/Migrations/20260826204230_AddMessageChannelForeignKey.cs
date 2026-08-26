using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiscClone.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageChannelForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_messages_channels_channel_id",
                table: "messages",
                column: "channel_id",
                principalTable: "channels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_messages_channels_channel_id",
                table: "messages");
        }
    }
}
