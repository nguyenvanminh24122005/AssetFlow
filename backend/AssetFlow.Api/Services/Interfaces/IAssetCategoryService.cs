using AssetFlow.Api.DTOs.Categories;

namespace AssetFlow.Api.Services.Interfaces;

public interface IAssetCategoryService
{
    Task<IReadOnlyList<AssetCategoryResponseDto>> GetAllAsync(
        string? keyword,
        bool? isActive
    );

    Task<AssetCategoryResponseDto?> GetByIdAsync(int id);

    Task<AssetCategoryResponseDto> CreateAsync(
        CreateAssetCategoryDto request
    );

    Task<AssetCategoryResponseDto?> UpdateAsync(
        int id,
        UpdateAssetCategoryDto request
    );

    Task<bool> DeactivateAsync(int id);
}