using AssetFlow.Api.DTOs.Employees;

namespace AssetFlow.Api.Services.Interfaces;

public interface IEmployeeService
{
    Task<IReadOnlyList<EmployeeResponseDto>> GetAllAsync(
        string? keyword,
        string? department,
        bool? isActive
    );

    Task<EmployeeResponseDto?> GetByIdAsync(int id);

    Task<EmployeeResponseDto> CreateAsync(
        CreateEmployeeDto request
    );

    Task<EmployeeResponseDto?> UpdateAsync(
        int id,
        UpdateEmployeeDto request
    );

    Task<bool> DeactivateAsync(int id);
}