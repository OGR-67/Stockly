using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stockly.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDeleteStockUnitsOnProductDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockUnits_Products_ProductId",
                table: "StockUnits");

            migrationBuilder.AddForeignKey(
                name: "FK_StockUnits_Products_ProductId",
                table: "StockUnits",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockUnits_Products_ProductId",
                table: "StockUnits");

            migrationBuilder.AddForeignKey(
                name: "FK_StockUnits_Products_ProductId",
                table: "StockUnits",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
