using AssetFlow.Api.Data;
using AssetFlow.Api.DTOs.Categories;
using AssetFlow.Api.Entities;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.Api.Services.Implementations;

public class AssetCategoryService : IAssetCategoryService
{
    private readonly AssetFlowDbContext _dbContext;

    public AssetCategoryService(AssetFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AssetCategoryResponseDto>> GetAllAsync(
        string? keyword,
        bool? isActive
    )
    {
        var query = _dbContext.AssetCategories
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();

            query = query.Where(category =>
                category.Code.Contains(normalizedKeyword) ||
                category.Name.Contains(normalizedKeyword)
            );
        }

        if (isActive.HasValue)
        {
            query = query.Where(category =>
                category.IsActive == isActive.Value
            );
        }

        return await query
            .OrderByDescending(category => category.CreatedAt)
            .Select(category => new AssetCategoryResponseDto
            {
                Id = category.Id,
                Code = category.Code,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                AssetCount = category.Assets.Count
            })
            .ToListAsync();
    }

    public async Task<AssetCategoryResponseDto?> GetByIdAsync(int id)
    {
        return await _dbContext.AssetCategories
            .AsNoTracking()
            .Where(category => category.Id == id)
            .Select(category => new AssetCategoryResponseDto
            {
                Id = category.Id,
                Code = category.Code,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                AssetCount = category.Assets.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AssetCategoryResponseDto> CreateAsync(
        CreateAssetCategoryDto request
    )
    {
        var normalizedCode = request.Code
            .Trim()
            .ToUpperInvariant();

        var codeExists = await _dbContext.AssetCategories
            .AnyAsync(category => category.Code == normalizedCode);

        if (codeExists)
        {
            throw new InvalidOperationException(
                "Mã danh mục đã tồn tại."
            );
        }

        var category = new AssetCategory
        {
            Code = normalizedCode,
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.AssetCategories.Add(category);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<AssetCategoryResponseDto?> UpdateAsync(
        int id,
        UpdateAssetCategoryDto request
    )
    {
        var category = await _dbContext.AssetCategories
            .FirstOrDefaultAsync(item => item.Id == id);

        if (category is null)
        {
            return null;
        }

        var normalizedCode = request.Code
            .Trim()
            .ToUpperInvariant();

        var codeExists = await _dbContext.AssetCategories
            .AnyAsync(item =>
                item.Code == normalizedCode &&
                item.Id != id
            );

        if (codeExists)
        {
            throw new InvalidOperationException(
                "Mã danh mục đã được sử dụng bởi danh mục khác."
            );
        }

        category.Code = normalizedCode;
        category.Name = request.Name.Trim();
        category.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();
        category.IsActive = request.IsActive;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(category);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var category = await _dbContext.AssetCategories
            .FirstOrDefaultAsync(item => item.Id == id);

        if (category is null)
        {
            return false;
        }

        category.IsActive = false;

        await _dbContext.SaveChangesAsync();

        return true;
    }

    private static AssetCategoryResponseDto MapToResponse(
        AssetCategory category
    )
    {
        return new AssetCategoryResponseDto
        {
            Id = category.Id,
            Code = category.Code,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            AssetCount = category.Assets?.Count ?? 0
        };
    }
}