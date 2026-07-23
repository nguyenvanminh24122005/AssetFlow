using System.ComponentModel.DataAnnotations;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.DTOs.Assets;

public class UpdateAssetDto
{
    [Required(ErrorMessage = "Mã tài sản là bắt buộc.")]
    [MaxLength(50, ErrorMessage = "Mã tài sản không được vượt quá 50 ký tự.")]
    public string AssetCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên tài sản là bắt buộc.")]
    [MaxLength(200, ErrorMessage = "Tên tài sản không được vượt quá 200 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "Serial Number không được vượt quá 100 ký tự.")]
    public string? SerialNumber { get; set; }

    [MaxLength(100, ErrorMessage = "Tên hãng không được vượt quá 100 ký tự.")]
    public string? Brand { get; set; }

    [MaxLength(100, ErrorMessage = "Model không được vượt quá 100 ký tự.")]
    public string? Model { get; set; }

    public DateTime? PurchaseDate { get; set; }

    [Range(
        typeof(decimal),
        "0",
        "9999999999999999",
        ErrorMessage = "Giá mua không được nhỏ hơn 0."
    )]
    public decimal? PurchasePrice { get; set; }

    public DateTime? WarrantyExpirationDate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Danh mục tài sản không hợp lệ.")]
    public int CategoryId { get; set; }

    [EnumDataType(
        typeof(AssetStatus),
        ErrorMessage = "Trạng thái tài sản không hợp lệ."
    )]
    public AssetStatus Status { get; set; }

    [MaxLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự.")]
    public string? Description { get; set; }
}