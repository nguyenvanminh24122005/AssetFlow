namespace AssetFlow.Api.DTOs.Categories;

public class AssetCategoryResponseDto
{
    public int Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int AssetCount { get; set; }
}