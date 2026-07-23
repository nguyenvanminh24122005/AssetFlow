using AssetFlow.Api.Data;
using AssetFlow.Api.Services.Implementations;
using AssetFlow.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
const string FrontendCorsPolicy = "FrontendCors";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddOpenApi();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Không tìm thấy connection string DefaultConnection."
    );

builder.Services.AddDbContext<AssetFlowDbContext>(options =>
    options.UseSqlServer(connectionString)
);

builder.Services.AddScoped<
    IAssetCategoryService,
    AssetCategoryService
>();
builder.Services.AddScoped<
    IAssetService,
    AssetService
>();
builder.Services.AddScoped<
    IEmployeeService,
    EmployeeService
>();
builder.Services.AddScoped<
    IAssetHandoverService,
    AssetHandoverService
>();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);

app.UseHttpsRedirection();

app.MapControllers();

app.Run();