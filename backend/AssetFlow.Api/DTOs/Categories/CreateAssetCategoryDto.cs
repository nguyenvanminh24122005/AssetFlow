using System.ComponentModel.DataAnnotations;

namespace AssetFlow.Api.DTOs.Categories;

public class CreateAssetCategoryDto
{
    [Required(ErrorMessage = "Mã danh mục là bắt buộc.")]
    [MaxLength(30, ErrorMessage = "Mã danh mục không được vượt quá 30 ký tự.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên danh mục là bắt buộc.")]
    [MaxLength(100, ErrorMessage = "Tên danh mục không được vượt quá 100 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Mô tả không được vượt quá 500 ký tự.")]
    public string? Description { get; set; }
}