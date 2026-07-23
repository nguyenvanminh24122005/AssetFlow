using System.ComponentModel.DataAnnotations;

namespace AssetFlow.Api.DTOs.Handovers;

public class CreateAssetHandoverDto
{
    [Required(ErrorMessage = "Mã phiếu bàn giao là bắt buộc.")]
    [MaxLength(
        50,
        ErrorMessage = "Mã phiếu không được vượt quá 50 ký tự."
    )]
    public string HandoverCode { get; set; } = string.Empty;

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Nhân viên nhận tài sản không hợp lệ."
    )]
    public int EmployeeId { get; set; }

    public DateTime HandoverDate { get; set; } =
        DateTime.UtcNow;

    [MaxLength(
        1000,
        ErrorMessage = "Ghi chú phiếu không được vượt quá 1000 ký tự."
    )]
    public string? Note { get; set; }

    [MinLength(
        1,
        ErrorMessage = "Phiếu bàn giao phải có ít nhất một tài sản."
    )]
    public List<CreateAssetHandoverItemDto> Items { get; set; } =
        new();
}