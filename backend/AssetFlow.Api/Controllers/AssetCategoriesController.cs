using AssetFlow.Api.DTOs.Categories;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Api.Controllers;

[ApiController]
[Route("api/asset-categories")]
public class AssetCategoriesController : ControllerBase
{
    private readonly IAssetCategoryService _categoryService;

    public AssetCategoriesController(
        IAssetCategoryService categoryService
    )
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] string? keyword,
        [FromQuery] bool? isActive
    )
    {
        var categories = await _categoryService.GetAllAsync(
            keyword,
            isActive
        );

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);

        if (category is null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy danh mục tài sản."
            });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateAssetCategoryDto request
    )
    {
        try
        {
            var category = await _categoryService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = category.Id },
                category
            );
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(
        int id,
        [FromBody] UpdateAssetCategoryDto request
    )
    {
        try
        {
            var category = await _categoryService.UpdateAsync(
                id,
                request
            );

            if (category is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy danh mục tài sản."
                });
            }

            return Ok(category);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var success = await _categoryService.DeactivateAsync(id);

        if (!success)
        {
            return NotFound(new
            {
                message = "Không tìm thấy danh mục tài sản."
            });
        }

        return Ok(new
        {
            message = "Đã ngừng hoạt động danh mục tài sản."
        });
    }
}