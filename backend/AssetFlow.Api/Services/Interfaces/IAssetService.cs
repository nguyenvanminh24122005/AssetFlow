using AssetFlow.Api.DTOs.Assets;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.Services.Interfaces;

public interface IAssetService
{
    Task<IReadOnlyList<AssetResponseDto>> GetAllAsync(
        string? keyword,
        int? categoryId,
        AssetStatus? status
    );

    Task<AssetResponseDto?> GetByIdAsync(int id);

    Task<AssetResponseDto> CreateAsync(
        CreateAssetDto request
    );

    Task<AssetResponseDto?> UpdateAsync(
        int id,
        UpdateAssetDto request
    );

    Task<bool> LiquidateAsync(int id);
}