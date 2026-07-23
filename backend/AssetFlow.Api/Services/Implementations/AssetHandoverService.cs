using AssetFlow.Api.Data;
using AssetFlow.Api.DTOs.Handovers;
using AssetFlow.Api.Entities;
using AssetFlow.Api.Enums;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.Api.Services.Implementations;

public class AssetHandoverService : IAssetHandoverService
{
    private readonly AssetFlowDbContext _dbContext;

    public AssetHandoverService(AssetFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AssetHandoverResponseDto>> GetAllAsync(
        string? keyword,
        int? employeeId,
        HandoverStatus? status
    )
    {
        var query = _dbContext.AssetHandovers
            .AsNoTracking()
            .Include(handover => handover.Employee)
            .Include(handover => handover.Items)
                .ThenInclude(item => item.Asset)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();

            query = query.Where(handover =>
                handover.HandoverCode.Contains(normalizedKeyword) ||
                handover.Employee.EmployeeCode.Contains(normalizedKeyword) ||
                handover.Employee.FullName.Contains(normalizedKeyword)
            );
        }

        if (employeeId.HasValue)
        {
            query = query.Where(handover =>
                handover.EmployeeId == employeeId.Value
            );
        }

        if (status.HasValue)
        {
            query = query.Where(handover =>
                handover.Status == status.Value
            );
        }

        var handovers = await query
            .OrderByDescending(handover => handover.CreatedAt)
            .ToListAsync();

        return handovers
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<AssetHandoverResponseDto?> GetByIdAsync(int id)
    {
        var handover = await GetHandoverEntityAsync(id);

        return handover is null
            ? null
            : MapToResponse(handover);
    }

    public async Task<AssetHandoverResponseDto> CreateAsync(
        CreateAssetHandoverDto request
    )
    {
        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException(
                "Phiếu bàn giao phải có ít nhất một tài sản."
            );
        }

        var normalizedCode = request.HandoverCode
            .Trim()
            .ToUpperInvariant();

        var codeExists = await _dbContext.AssetHandovers
            .AnyAsync(handover =>
                handover.HandoverCode == normalizedCode
            );

        if (codeExists)
        {
            throw new InvalidOperationException(
                "Mã phiếu bàn giao đã tồn tại."
            );
        }

        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(item =>
                item.Id == request.EmployeeId
            );

        if (employee is null)
        {
            throw new InvalidOperationException(
                "Nhân viên nhận tài sản không tồn tại."
            );
        }

        if (!employee.IsActive)
        {
            throw new InvalidOperationException(
                "Không thể bàn giao tài sản cho nhân viên đã ngừng hoạt động."
            );
        }

        var assetIds = request.Items
            .Select(item => item.AssetId)
            .ToList();

        if (assetIds.Count != assetIds.Distinct().Count())
        {
            throw new InvalidOperationException(
                "Một tài sản không được xuất hiện nhiều lần trong cùng phiếu."
            );
        }

        var assets = await _dbContext.Assets
            .Where(asset => assetIds.Contains(asset.Id))
            .ToListAsync();

        if (assets.Count != assetIds.Count)
        {
            throw new InvalidOperationException(
                "Có tài sản được chọn không tồn tại."
            );
        }

        var unavailableAssets = assets
            .Where(asset => asset.Status != AssetStatus.Available)
            .Select(asset => asset.AssetCode)
            .ToList();

        if (unavailableAssets.Count > 0)
        {
            throw new InvalidOperationException(
                "Các tài sản sau không ở trạng thái sẵn sàng: " +
                string.Join(", ", unavailableAssets)
            );
        }

        var itemRequests = request.Items
            .ToDictionary(item => item.AssetId);

        var handover = new AssetHandover
        {
            HandoverCode = normalizedCode,
            EmployeeId = employee.Id,
            Employee = employee,
            HandoverDate = request.HandoverDate,
            Status = HandoverStatus.Draft,
            Note = NormalizeOptionalValue(request.Note),
            CreatedAt = DateTime.UtcNow
        };

        foreach (var asset in assets)
        {
            var itemRequest = itemRequests[asset.Id];

            handover.Items.Add(new AssetHandoverItem
            {
                AssetId = asset.Id,
                Asset = asset,
                ConditionAtHandover =
                    itemRequest.ConditionAtHandover,
                HandoverNote =
                    NormalizeOptionalValue(
                        itemRequest.HandoverNote
                    )
            });

            // Giữ chỗ thiết bị trong lúc phiếu đang Draft.
            asset.Status = AssetStatus.PendingHandover;
            asset.UpdatedAt = DateTime.UtcNow;
        }

        _dbContext.AssetHandovers.Add(handover);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(handover);
    }

    public async Task<AssetHandoverResponseDto?> ConfirmAsync(int id)
    {
        var handover = await GetHandoverEntityAsync(id);

        if (handover is null)
        {
            return null;
        }

        if (handover.Status != HandoverStatus.Draft)
        {
            throw new InvalidOperationException(
                "Chỉ có thể xác nhận phiếu đang ở trạng thái Draft."
            );
        }

        if (handover.Items.Count == 0)
        {
            throw new InvalidOperationException(
                "Phiếu bàn giao không có tài sản."
            );
        }

        foreach (var item in handover.Items)
        {
            if (item.Asset.Status != AssetStatus.PendingHandover)
            {
                throw new InvalidOperationException(
                    $"Tài sản {item.Asset.AssetCode} không còn ở trạng thái chờ bàn giao."
                );
            }

            item.Asset.Status = AssetStatus.InUse;
            item.Asset.UpdatedAt = DateTime.UtcNow;
        }

        handover.Status = HandoverStatus.Completed;
        handover.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(handover);
    }

    public async Task<AssetHandoverResponseDto?> ReturnAssetAsync(
        int handoverId,
        int itemId,
        ReturnAssetDto request
    )
    {
        var handover = await GetHandoverEntityAsync(handoverId);

        if (handover is null)
        {
            return null;
        }

        if (
            handover.Status != HandoverStatus.Completed &&
            handover.Status != HandoverStatus.PartiallyReturned
        )
        {
            throw new InvalidOperationException(
                "Phiếu hiện tại không cho phép trả tài sản."
            );
        }

        var item = handover.Items
            .FirstOrDefault(item => item.Id == itemId);

        if (item is null)
        {
            throw new InvalidOperationException(
                "Không tìm thấy tài sản trong phiếu bàn giao."
            );
        }

        if (item.ReturnedAt.HasValue)
        {
            throw new InvalidOperationException(
                "Tài sản này đã được trả trước đó."
            );
        }

        item.ReturnedAt = DateTime.UtcNow;
        item.ConditionAtReturn = request.ConditionAtReturn;
        item.ReturnNote =
            NormalizeOptionalValue(request.ReturnNote);

        item.Asset.Status =
            request.ConditionAtReturn == AssetCondition.Damaged
                ? AssetStatus.Damaged
                : AssetStatus.Available;

        item.Asset.UpdatedAt = DateTime.UtcNow;

        var allReturned = handover.Items
            .All(handoverItem =>
                handoverItem.ReturnedAt.HasValue
            );

        handover.Status = allReturned
            ? HandoverStatus.Returned
            : HandoverStatus.PartiallyReturned;

        handover.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(handover);
    }

    public async Task<AssetHandoverResponseDto?> CancelAsync(int id)
    {
        var handover = await GetHandoverEntityAsync(id);

        if (handover is null)
        {
            return null;
        }

        if (handover.Status != HandoverStatus.Draft)
        {
            throw new InvalidOperationException(
                "Chỉ có thể hủy phiếu đang ở trạng thái Draft."
            );
        }

        foreach (var item in handover.Items)
        {
            if (item.Asset.Status == AssetStatus.PendingHandover)
            {
                item.Asset.Status = AssetStatus.Available;
                item.Asset.UpdatedAt = DateTime.UtcNow;
            }
        }

        handover.Status = HandoverStatus.Cancelled;
        handover.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(handover);
    }

    private async Task<AssetHandover?> GetHandoverEntityAsync(
        int id
    )
    {
        return await _dbContext.AssetHandovers
            .Include(handover => handover.Employee)
            .Include(handover => handover.Items)
                .ThenInclude(item => item.Asset)
            .FirstOrDefaultAsync(handover =>
                handover.Id == id
            );
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static AssetHandoverResponseDto MapToResponse(
        AssetHandover handover
    )
    {
        return new AssetHandoverResponseDto
        {
            Id = handover.Id,
            HandoverCode = handover.HandoverCode,
            EmployeeId = handover.EmployeeId,
            EmployeeCode = handover.Employee.EmployeeCode,
            EmployeeName = handover.Employee.FullName,
            Department = handover.Employee.Department,
            HandoverDate = handover.HandoverDate,
            StatusValue = (int)handover.Status,
            Status = handover.Status.ToString(),
            Note = handover.Note,
            CreatedAt = handover.CreatedAt,
            UpdatedAt = handover.UpdatedAt,
            TotalAssets = handover.Items.Count,
            ReturnedAssets = handover.Items.Count(item =>
                item.ReturnedAt.HasValue
            ),
            Items = handover.Items
                .OrderBy(item => item.Id)
                .Select(item =>
                    new AssetHandoverItemResponseDto
                    {
                        Id = item.Id,
                        AssetId = item.AssetId,
                        AssetCode = item.Asset.AssetCode,
                        AssetName = item.Asset.Name,
                        SerialNumber = item.Asset.SerialNumber,
                        ConditionAtHandoverValue =
                            (int)item.ConditionAtHandover,
                        ConditionAtHandover =
                            item.ConditionAtHandover.ToString(),
                        HandoverNote = item.HandoverNote,
                        ReturnedAt = item.ReturnedAt,
                        ConditionAtReturnValue =
                            item.ConditionAtReturn.HasValue
                                ? (int)item.ConditionAtReturn.Value
                                : null,
                        ConditionAtReturn =
                            item.ConditionAtReturn?.ToString(),
                        ReturnNote = item.ReturnNote,
                        IsReturned = item.ReturnedAt.HasValue
                    }
                )
                .ToList()
        };
    }
}