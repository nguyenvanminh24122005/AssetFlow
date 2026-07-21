using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.Entities;

public class Asset
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string AssetCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [MaxLength(100)]
    public string? Brand { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    public DateTime? PurchaseDate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PurchasePrice { get; set; }

    public DateTime? WarrantyExpirationDate { get; set; }

    public AssetStatus Status { get; set; } = AssetStatus.Available;

    public int CategoryId { get; set; }

    public AssetCategory Category { get; set; } = null!;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}