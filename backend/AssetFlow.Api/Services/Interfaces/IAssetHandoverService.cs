using AssetFlow.Api.DTOs.Handovers;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.Services.Interfaces;

public interface IAssetHandoverService
{
    Task<IReadOnlyList<AssetHandoverResponseDto>> GetAllAsync(
        string? keyword,
        int? employeeId,
        HandoverStatus? status
    );

    Task<AssetHandoverResponseDto?> GetByIdAsync(int id);

    Task<AssetHandoverResponseDto> CreateAsync(
        CreateAssetHandoverDto request
    );

    Task<AssetHandoverResponseDto?> ConfirmAsync(int id);

    Task<AssetHandoverResponseDto?> ReturnAssetAsync(
        int handoverId,
        int itemId,
        ReturnAssetDto request
    );

    Task<AssetHandoverResponseDto?> CancelAsync(int id);
}