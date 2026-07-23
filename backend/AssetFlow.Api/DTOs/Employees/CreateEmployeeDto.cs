using System.ComponentModel.DataAnnotations;

namespace AssetFlow.Api.DTOs.Employees;

public class CreateEmployeeDto
{
    [Required(ErrorMessage = "Mã nhân viên là bắt buộc.")]
    [MaxLength(
        30,
        ErrorMessage = "Mã nhân viên không được vượt quá 30 ký tự."
    )]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Họ tên nhân viên là bắt buộc.")]
    [MaxLength(
        150,
        ErrorMessage = "Họ tên không được vượt quá 150 ký tự."
    )]
    public string FullName { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ.")]
    [MaxLength(
        150,
        ErrorMessage = "Email không được vượt quá 150 ký tự."
    )]
    public string? Email { get; set; }

    [MaxLength(
        20,
        ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự."
    )]
    public string? PhoneNumber { get; set; }

    [MaxLength(
        100,
        ErrorMessage = "Tên phòng ban không được vượt quá 100 ký tự."
    )]
    public string? Department { get; set; }

    [MaxLength(
        100,
        ErrorMessage = "Chức vụ không được vượt quá 100 ký tự."
    )]
    public string? Position { get; set; }
}