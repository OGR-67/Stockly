using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stockly.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToStorageLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "StorageLocations",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "StorageLocations");
        }
    }
}
