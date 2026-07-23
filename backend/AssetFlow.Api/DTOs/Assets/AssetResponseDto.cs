namespace AssetFlow.Api.DTOs.Assets;

public class AssetResponseDto
{
    public int Id { get; set; }

    public string AssetCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? SerialNumber { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public decimal? PurchasePrice { get; set; }

    public DateTime? WarrantyExpirationDate { get; set; }

    public int StatusValue { get; set; }

    public string Status { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public string CategoryCode { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}