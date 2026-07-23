using AssetFlow.Api.Data;
using AssetFlow.Api.DTOs.Assets;
using AssetFlow.Api.Entities;
using AssetFlow.Api.Enums;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.Api.Services.Implementations;

public class AssetService : IAssetService
{
    private readonly AssetFlowDbContext _dbContext;

    public AssetService(AssetFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AssetResponseDto>> GetAllAsync(
        string? keyword,
        int? categoryId,
        AssetStatus? status
    )
    {
        var query = _dbContext.Assets
            .AsNoTracking()
            .Include(asset => asset.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();

            query = query.Where(asset =>
                asset.AssetCode.Contains(normalizedKeyword) ||
                asset.Name.Contains(normalizedKeyword) ||
                (asset.SerialNumber != null &&
                 asset.SerialNumber.Contains(normalizedKeyword)) ||
                (asset.Brand != null &&
                 asset.Brand.Contains(normalizedKeyword)) ||
                (asset.Model != null &&
                 asset.Model.Contains(normalizedKeyword))
            );
        }

        if (categoryId.HasValue)
        {
            query = query.Where(asset =>
                asset.CategoryId == categoryId.Value
            );
        }

        if (status.HasValue)
        {
            query = query.Where(asset =>
                asset.Status == status.Value
            );
        }

        return await query
            .OrderByDescending(asset => asset.CreatedAt)
            .Select(asset => new AssetResponseDto
            {
                Id = asset.Id,
                AssetCode = asset.AssetCode,
                Name = asset.Name,
                SerialNumber = asset.SerialNumber,
                Brand = asset.Brand,
                Model = asset.Model,
                PurchaseDate = asset.PurchaseDate,
                PurchasePrice = asset.PurchasePrice,
                WarrantyExpirationDate =
                    asset.WarrantyExpirationDate,
                StatusValue = (int)asset.Status,
                Status = asset.Status.ToString(),
                CategoryId = asset.CategoryId,
                CategoryCode = asset.Category.Code,
                CategoryName = asset.Category.Name,
                Description = asset.Description,
                CreatedAt = asset.CreatedAt,
                UpdatedAt = asset.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<AssetResponseDto?> GetByIdAsync(int id)
    {
        return await _dbContext.Assets
            .AsNoTracking()
            .Where(asset => asset.Id == id)
            .Select(asset => new AssetResponseDto
            {
                Id = asset.Id,
                AssetCode = asset.AssetCode,
                Name = asset.Name,
                SerialNumber = asset.SerialNumber,
                Brand = asset.Brand,
                Model = asset.Model,
                PurchaseDate = asset.PurchaseDate,
                PurchasePrice = asset.PurchasePrice,
                WarrantyExpirationDate =
                    asset.WarrantyExpirationDate,
                StatusValue = (int)asset.Status,
                Status = asset.Status.ToString(),
                CategoryId = asset.CategoryId,
                CategoryCode = asset.Category.Code,
                CategoryName = asset.Category.Name,
                Description = asset.Description,
                CreatedAt = asset.CreatedAt,
                UpdatedAt = asset.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AssetResponseDto> CreateAsync(
        CreateAssetDto request
    )
    {
        ValidateDates(
            request.PurchaseDate,
            request.WarrantyExpirationDate
        );

        var normalizedAssetCode = request.AssetCode
            .Trim()
            .ToUpperInvariant();

        var normalizedSerialNumber =
            NormalizeOptionalValue(request.SerialNumber, true);

        var category = await _dbContext.AssetCategories
            .FirstOrDefaultAsync(item =>
                item.Id == request.CategoryId
            );

        if (category is null)
        {
            throw new InvalidOperationException(
                "Danh mục tài sản không tồn tại."
            );
        }

        if (!category.IsActive)
        {
            throw new InvalidOperationException(
                "Không thể thêm thiết bị vào danh mục đã ngừng hoạt động."
            );
        }

        var assetCodeExists = await _dbContext.Assets
            .AnyAsync(asset =>
                asset.AssetCode == normalizedAssetCode
            );

        if (assetCodeExists)
        {
            throw new InvalidOperationException(
                "Mã tài sản đã tồn tại."
            );
        }

        if (normalizedSerialNumber is not null)
        {
            var serialExists = await _dbContext.Assets
                .AnyAsync(asset =>
                    asset.SerialNumber == normalizedSerialNumber
                );

            if (serialExists)
            {
                throw new InvalidOperationException(
                    "Serial Number đã tồn tại."
                );
            }
        }

        var asset = new Asset
        {
            AssetCode = normalizedAssetCode,
            Name = request.Name.Trim(),
            SerialNumber = normalizedSerialNumber,
            Brand = NormalizeOptionalValue(request.Brand),
            Model = NormalizeOptionalValue(request.Model),
            PurchaseDate = request.PurchaseDate,
            PurchasePrice = request.PurchasePrice,
            WarrantyExpirationDate =
                request.WarrantyExpirationDate,
            Status = AssetStatus.Available,
            CategoryId = category.Id,
            Category = category,
            Description =
                NormalizeOptionalValue(request.Description),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Assets.Add(asset);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(asset);
    }

    public async Task<AssetResponseDto?> UpdateAsync(
        int id,
        UpdateAssetDto request
    )
    {
        ValidateDates(
            request.PurchaseDate,
            request.WarrantyExpirationDate
        );

        var asset = await _dbContext.Assets
            .Include(item => item.Category)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (asset is null)
        {
            return null;
        }

        var category = await _dbContext.AssetCategories
            .FirstOrDefaultAsync(item =>
                item.Id == request.CategoryId
            );

        if (category is null)
        {
            throw new InvalidOperationException(
                "Danh mục tài sản không tồn tại."
            );
        }

        if (!category.IsActive)
        {
            throw new InvalidOperationException(
                "Không thể chuyển thiết bị vào danh mục đã ngừng hoạt động."
            );
        }

        var normalizedAssetCode = request.AssetCode
            .Trim()
            .ToUpperInvariant();

        var normalizedSerialNumber =
            NormalizeOptionalValue(request.SerialNumber, true);

        var assetCodeExists = await _dbContext.Assets
            .AnyAsync(item =>
                item.AssetCode == normalizedAssetCode &&
                item.Id != id
            );

        if (assetCodeExists)
        {
            throw new InvalidOperationException(
                "Mã tài sản đã được sử dụng bởi thiết bị khác."
            );
        }

        if (normalizedSerialNumber is not null)
        {
            var serialExists = await _dbContext.Assets
                .AnyAsync(item =>
                    item.SerialNumber == normalizedSerialNumber &&
                    item.Id != id
                );

            if (serialExists)
            {
                throw new InvalidOperationException(
                    "Serial Number đã được sử dụng bởi thiết bị khác."
                );
            }
        }

        asset.AssetCode = normalizedAssetCode;
        asset.Name = request.Name.Trim();
        asset.SerialNumber = normalizedSerialNumber;
        asset.Brand = NormalizeOptionalValue(request.Brand);
        asset.Model = NormalizeOptionalValue(request.Model);
        asset.PurchaseDate = request.PurchaseDate;
        asset.PurchasePrice = request.PurchasePrice;
        asset.WarrantyExpirationDate =
            request.WarrantyExpirationDate;
        asset.CategoryId = category.Id;
        asset.Category = category;
        asset.Status = request.Status;
        asset.Description =
            NormalizeOptionalValue(request.Description);
        asset.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(asset);
    }

    public async Task<bool> LiquidateAsync(int id)
    {
        var asset = await _dbContext.Assets
            .FirstOrDefaultAsync(item => item.Id == id);

        if (asset is null)
        {
            return false;
        }

        if (asset.Status == AssetStatus.InUse)
        {
            throw new InvalidOperationException(
                "Không thể thanh lý thiết bị đang được sử dụng."
            );
        }

        if (asset.Status == AssetStatus.PendingHandover)
        {
            throw new InvalidOperationException(
                "Không thể thanh lý thiết bị đang chờ bàn giao."
            );
        }

        if (asset.Status == AssetStatus.Liquidated)
        {
            throw new InvalidOperationException(
                "Thiết bị đã được thanh lý trước đó."
            );
        }

        asset.Status = AssetStatus.Liquidated;
        asset.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return true;
    }

    private static void ValidateDates(
        DateTime? purchaseDate,
        DateTime? warrantyExpirationDate
    )
    {
        if (
            warrantyExpirationDate.HasValue &&
            !purchaseDate.HasValue
        )
        {
            throw new InvalidOperationException(
                "Phải nhập ngày mua khi có ngày hết hạn bảo hành."
            );
        }

        if (
            purchaseDate.HasValue &&
            warrantyExpirationDate.HasValue &&
            warrantyExpirationDate.Value.Date <=
            purchaseDate.Value.Date
        )
        {
            throw new InvalidOperationException(
                "Ngày hết hạn bảo hành phải sau ngày mua."
            );
        }
    }

    private static string? NormalizeOptionalValue(
        string? value,
        bool convertToUppercase = false
    )
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalizedValue = value.Trim();

        return convertToUppercase
            ? normalizedValue.ToUpperInvariant()
            : normalizedValue;
    }

    private static AssetResponseDto MapToResponse(
        Asset asset
    )
    {
        return new AssetResponseDto
        {
            Id = asset.Id,
            AssetCode = asset.AssetCode,
            Name = asset.Name,
            SerialNumber = asset.SerialNumber,
            Brand = asset.Brand,
            Model = asset.Model,
            PurchaseDate = asset.PurchaseDate,
            PurchasePrice = asset.PurchasePrice,
            WarrantyExpirationDate =
                asset.WarrantyExpirationDate,
            StatusValue = (int)asset.Status,
            Status = asset.Status.ToString(),
            CategoryId = asset.CategoryId,
            CategoryCode = asset.Category.Code,
            CategoryName = asset.Category.Name,
            Description = asset.Description,
            CreatedAt = asset.CreatedAt,
            UpdatedAt = asset.UpdatedAt
        };
    }
}