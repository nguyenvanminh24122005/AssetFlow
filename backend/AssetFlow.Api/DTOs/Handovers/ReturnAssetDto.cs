using System.ComponentModel.DataAnnotations;
using AssetFlow.Api.Enums;

namespace AssetFlow.Api.DTOs.Handovers;

public class ReturnAssetDto
{
    [EnumDataType(
        typeof(AssetCondition),
        ErrorMessage = "Tình trạng tài sản khi trả không hợp lệ."
    )]
    public AssetCondition ConditionAtReturn { get; set; } =
        AssetCondition.Good;

    [MaxLength(
        500,
        ErrorMessage = "Ghi chú trả tài sản không được vượt quá 500 ký tự."
    )]
    public string? ReturnNote { get; set; }
}