namespace AssetFlow.Api.DTOs.Handovers;

public class AssetHandoverItemResponseDto
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string AssetCode { get; set; } = string.Empty;

    public string AssetName { get; set; } = string.Empty;

    public string? SerialNumber { get; set; }

    public int ConditionAtHandoverValue { get; set; }

    public string ConditionAtHandover { get; set; } =
        string.Empty;

    public string? HandoverNote { get; set; }

    public DateTime? ReturnedAt { get; set; }

    public int? ConditionAtReturnValue { get; set; }

    public string? ConditionAtReturn { get; set; }

    public string? ReturnNote { get; set; }

    public bool IsReturned { get; set; }
}