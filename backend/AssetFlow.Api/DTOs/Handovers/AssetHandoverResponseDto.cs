namespace AssetFlow.Api.DTOs.Handovers;

public class AssetHandoverResponseDto
{
    public int Id { get; set; }

    public string HandoverCode { get; set; } = string.Empty;

    public int EmployeeId { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string? Department { get; set; }

    public DateTime HandoverDate { get; set; }

    public int StatusValue { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int TotalAssets { get; set; }

    public int ReturnedAssets { get; set; }

    public List<AssetHandoverItemResponseDto> Items { get; set; } =
        new();
}