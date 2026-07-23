using AssetFlow.Api.Data;
using AssetFlow.Api.DTOs.Employees;
using AssetFlow.Api.Entities;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.Api.Services.Implementations;

public class EmployeeService : IEmployeeService
{
    private readonly AssetFlowDbContext _dbContext;

    public EmployeeService(AssetFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<EmployeeResponseDto>> GetAllAsync(
        string? keyword,
        string? department,
        bool? isActive
    )
    {
        var query = _dbContext.Employees
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var normalizedKeyword = keyword.Trim();

            query = query.Where(employee =>
                employee.EmployeeCode.Contains(normalizedKeyword) ||
                employee.FullName.Contains(normalizedKeyword) ||
                (
                    employee.Email != null &&
                    employee.Email.Contains(normalizedKeyword)
                ) ||
                (
                    employee.PhoneNumber != null &&
                    employee.PhoneNumber.Contains(normalizedKeyword)
                )
            );
        }

        if (!string.IsNullOrWhiteSpace(department))
        {
            var normalizedDepartment = department.Trim();

            query = query.Where(employee =>
                employee.Department != null &&
                employee.Department.Contains(normalizedDepartment)
            );
        }

        if (isActive.HasValue)
        {
            query = query.Where(employee =>
                employee.IsActive == isActive.Value
            );
        }

        return await query
            .OrderByDescending(employee => employee.CreatedAt)
            .Select(employee => new EmployeeResponseDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Email = employee.Email,
                PhoneNumber = employee.PhoneNumber,
                Department = employee.Department,
                Position = employee.Position,
                IsActive = employee.IsActive,
                CreatedAt = employee.CreatedAt,
                UpdatedAt = employee.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
    {
        return await _dbContext.Employees
            .AsNoTracking()
            .Where(employee => employee.Id == id)
            .Select(employee => new EmployeeResponseDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Email = employee.Email,
                PhoneNumber = employee.PhoneNumber,
                Department = employee.Department,
                Position = employee.Position,
                IsActive = employee.IsActive,
                CreatedAt = employee.CreatedAt,
                UpdatedAt = employee.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<EmployeeResponseDto> CreateAsync(
        CreateEmployeeDto request
    )
    {
        var normalizedCode = request.EmployeeCode
            .Trim()
            .ToUpperInvariant();

        var normalizedEmail = NormalizeEmail(request.Email);

        var codeExists = await _dbContext.Employees
            .AnyAsync(employee =>
                employee.EmployeeCode == normalizedCode
            );

        if (codeExists)
        {
            throw new InvalidOperationException(
                "Mã nhân viên đã tồn tại."
            );
        }

        if (normalizedEmail is not null)
        {
            var emailExists = await _dbContext.Employees
                .AnyAsync(employee =>
                    employee.Email == normalizedEmail
                );

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "Email nhân viên đã tồn tại."
                );
            }
        }

        var employee = new Employee
        {
            EmployeeCode = normalizedCode,
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PhoneNumber =
                NormalizeOptionalValue(request.PhoneNumber),
            Department =
                NormalizeOptionalValue(request.Department),
            Position =
                NormalizeOptionalValue(request.Position),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Employees.Add(employee);
        await _dbContext.SaveChangesAsync();

        return MapToResponse(employee);
    }

    public async Task<EmployeeResponseDto?> UpdateAsync(
        int id,
        UpdateEmployeeDto request
    )
    {
        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(item => item.Id == id);

        if (employee is null)
        {
            return null;
        }

        var normalizedCode = request.EmployeeCode
            .Trim()
            .ToUpperInvariant();

        var normalizedEmail = NormalizeEmail(request.Email);

        var codeExists = await _dbContext.Employees
            .AnyAsync(item =>
                item.EmployeeCode == normalizedCode &&
                item.Id != id
            );

        if (codeExists)
        {
            throw new InvalidOperationException(
                "Mã nhân viên đã được sử dụng bởi nhân viên khác."
            );
        }

        if (normalizedEmail is not null)
        {
            var emailExists = await _dbContext.Employees
                .AnyAsync(item =>
                    item.Email == normalizedEmail &&
                    item.Id != id
                );

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "Email đã được sử dụng bởi nhân viên khác."
                );
            }
        }

        employee.EmployeeCode = normalizedCode;
        employee.FullName = request.FullName.Trim();
        employee.Email = normalizedEmail;
        employee.PhoneNumber =
            NormalizeOptionalValue(request.PhoneNumber);
        employee.Department =
            NormalizeOptionalValue(request.Department);
        employee.Position =
            NormalizeOptionalValue(request.Position);
        employee.IsActive = request.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return MapToResponse(employee);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var employee = await _dbContext.Employees
            .FirstOrDefaultAsync(item => item.Id == id);

        if (employee is null)
        {
            return false;
        }

        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return true;
    }

    private static string? NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        return email.Trim().ToLowerInvariant();
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static EmployeeResponseDto MapToResponse(
        Employee employee
    )
    {
        return new EmployeeResponseDto
        {
            Id = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            FullName = employee.FullName,
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            Department = employee.Department,
            Position = employee.Position,
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt,
            UpdatedAt = employee.UpdatedAt
        };
    }
}