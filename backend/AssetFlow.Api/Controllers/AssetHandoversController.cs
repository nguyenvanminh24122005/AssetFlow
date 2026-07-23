using AssetFlow.Api.DTOs.Handovers;
using AssetFlow.Api.Enums;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Api.Controllers;

[ApiController]
[Route("api/asset-handovers")]
public class AssetHandoversController : ControllerBase
{
    private readonly IAssetHandoverService _handoverService;

    public AssetHandoversController(
        IAssetHandoverService handoverService
    )
    {
        _handoverService = handoverService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] string? keyword,
        [FromQuery] int? employeeId,
        [FromQuery] HandoverStatus? status
    )
    {
        var handovers = await _handoverService.GetAllAsync(
            keyword,
            employeeId,
            status
        );

        return Ok(handovers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var handover =
            await _handoverService.GetByIdAsync(id);

        if (handover is null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy phiếu bàn giao."
            });
        }

        return Ok(handover);
    }

    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateAssetHandoverDto request
    )
    {
        try
        {
            var handover =
                await _handoverService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = handover.Id },
                handover
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

    [HttpPost("{id:int}/confirm")]
    public async Task<ActionResult> Confirm(int id)
    {
        try
        {
            var handover =
                await _handoverService.ConfirmAsync(id);

            if (handover is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phiếu bàn giao."
                });
            }

            return Ok(handover);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPost("{handoverId:int}/items/{itemId:int}/return")]
    public async Task<ActionResult> ReturnAsset(
        int handoverId,
        int itemId,
        [FromBody] ReturnAssetDto request
    )
    {
        try
        {
            var handover =
                await _handoverService.ReturnAssetAsync(
                    handoverId,
                    itemId,
                    request
                );

            if (handover is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phiếu bàn giao."
                });
            }

            return Ok(handover);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult> Cancel(int id)
    {
        try
        {
            var handover =
                await _handoverService.CancelAsync(id);

            if (handover is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phiếu bàn giao."
                });
            }

            return Ok(handover);
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