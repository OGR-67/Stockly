using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stockly.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenamePrinterIpAddressToQueueName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IpAddress",
                table: "Printers",
                newName: "QueueName");

            // Update column type from VARCHAR(45) to VARCHAR(255)
            migrationBuilder.AlterColumn<string>(
                name: "QueueName",
                table: "Printers",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldType: "character varying(45)",
                oldMaxLength: 45);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert column type from VARCHAR(255) to VARCHAR(45)
            migrationBuilder.AlterColumn<string>(
                name: "QueueName",
                table: "Printers",
                type: "character varying(45)",
                maxLength: 45,
                nullable: false,
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.RenameColumn(
                name: "QueueName",
                table: "Printers",
                newName: "IpAddress");
        }
    }
}
