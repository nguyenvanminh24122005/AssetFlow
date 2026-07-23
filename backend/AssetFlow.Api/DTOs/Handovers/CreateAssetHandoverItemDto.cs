using System.ComponentModel.DataAnnotations;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.DTOs.Handovers;

public class CreateAssetHandoverItemDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Tài sản được chọn không hợp lệ."
    )]
    public int AssetId { get; set; }

    [EnumDataType(
        typeof(AssetCondition),
        ErrorMessage = "Tình trạng tài sản khi bàn giao không hợp lệ."
    )]
    public AssetCondition ConditionAtHandover { get; set; } =
        AssetCondition.Good;

    [MaxLength(
        500,
        ErrorMessage = "Ghi chú tài sản không được vượt quá 500 ký tự."
    )]
    public string? HandoverNote { get; set; }
}