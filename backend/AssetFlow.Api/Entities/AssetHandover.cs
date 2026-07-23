using System.ComponentModel.DataAnnotations;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.Entities;

public class AssetHandover
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string HandoverCode { get; set; } = string.Empty;

    public int EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateTime HandoverDate { get; set; }

    public HandoverStatus Status { get; set; } =
        HandoverStatus.Draft;

    [MaxLength(1000)]
    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<AssetHandoverItem> Items { get; set; } =
        new List<AssetHandoverItem>();
}