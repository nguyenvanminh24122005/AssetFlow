using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AssetFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAssetHandovers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssetHandovers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HandoverCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    HandoverDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetHandovers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetHandovers_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssetHandoverItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssetHandoverId = table.Column<int>(type: "int", nullable: false),
                    AssetId = table.Column<int>(type: "int", nullable: false),
                    ConditionAtHandover = table.Column<int>(type: "int", nullable: false),
                    HandoverNote = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ReturnedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ConditionAtReturn = table.Column<int>(type: "int", nullable: true),
                    ReturnNote = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetHandoverItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetHandoverItems_AssetHandovers_AssetHandoverId",
                        column: x => x.AssetHandoverId,
                        principalTable: "AssetHandovers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssetHandoverItems_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssetHandoverItems_AssetHandoverId_AssetId",
                table: "AssetHandoverItems",
                columns: new[] { "AssetHandoverId", "AssetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetHandoverItems_AssetId",
                table: "AssetHandoverItems",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetHandovers_EmployeeId",
                table: "AssetHandovers",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetHandovers_HandoverCode",
                table: "AssetHandovers",
                column: "HandoverCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetHandovers_Status",
                table: "AssetHandovers",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssetHandoverItems");

            migrationBuilder.DropTable(
                name: "AssetHandovers");
        }
    }
}
