using System.ComponentModel.DataAnnotations;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.Entities;

public class AssetHandoverItem
{
    public int Id { get; set; }

    public int AssetHandoverId { get; set; }

    public AssetHandover AssetHandover { get; set; } = null!;

    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    public AssetCondition ConditionAtHandover { get; set; } =
        AssetCondition.Good;

    [MaxLength(500)]
    public string? HandoverNote { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public AssetCondition? ConditionAtReturn { get; set; }

    [MaxLength(500)]
    public string? ReturnNote { get; set; }
}