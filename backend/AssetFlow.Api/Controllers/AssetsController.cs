using AssetFlow.Api.DTOs.Assets;
using AssetFlow.Api.Enums;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Api.Controllers;

[ApiController]
[Route("api/assets")]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] string? keyword,
        [FromQuery] int? categoryId,
        [FromQuery] AssetStatus? status
    )
    {
        var assets = await _assetService.GetAllAsync(
            keyword,
            categoryId,
            status
        );

        return Ok(assets);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var asset = await _assetService.GetByIdAsync(id);

        if (asset is null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy thiết bị."
            });
        }

        return Ok(asset);
    }

    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateAssetDto request
    )
    {
        try
        {
            var asset = await _assetService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = asset.Id },
                asset
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
        [FromBody] UpdateAssetDto request
    )
    {
        try
        {
            var asset = await _assetService.UpdateAsync(
                id,
                request
            );

            if (asset is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thiết bị."
                });
            }

            return Ok(asset);
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
    public async Task<ActionResult> Liquidate(int id)
    {
        try
        {
            var success = await _assetService.LiquidateAsync(id);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy thiết bị."
                });
            }

            return Ok(new
            {
                message =
                    "Thiết bị đã được chuyển sang trạng thái thanh lý."
            });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }
}