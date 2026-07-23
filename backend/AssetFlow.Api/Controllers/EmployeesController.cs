using AssetFlow.Api.DTOs.Employees;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AssetFlow.Api.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(
        IEmployeeService employeeService
    )
    {
        _employeeService = employeeService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll(
        [FromQuery] string? keyword,
        [FromQuery] string? department,
        [FromQuery] bool? isActive
    )
    {
        var employees = await _employeeService.GetAllAsync(
            keyword,
            department,
            isActive
        );

        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult> GetById(int id)
    {
        var employee = await _employeeService.GetByIdAsync(id);

        if (employee is null)
        {
            return NotFound(new
            {
                message = "Không tìm thấy nhân viên."
            });
        }

        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult> Create(
        [FromBody] CreateEmployeeDto request
    )
    {
        try
        {
            var employee =
                await _employeeService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = employee.Id },
                employee
            );
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(
        int id,
        [FromBody] UpdateEmployeeDto request
    )
    {
        try
        {
            var employee =
                await _employeeService.UpdateAsync(id, request);

            if (employee is null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy nhân viên."
                });
            }

            return Ok(employee);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var success =
            await _employeeService.DeactivateAsync(id);

        if (!success)
        {
            return NotFound(new
            {
                message = "Không tìm thấy nhân viên."
            });
        }

        return Ok(new
        {
            message = "Đã ngừng hoạt động nhân viên."
        });
    }
}