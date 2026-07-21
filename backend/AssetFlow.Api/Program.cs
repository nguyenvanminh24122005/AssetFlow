using AssetFlow.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Cho phép project sử dụng Controller.
builder.Services.AddControllers();

// OpenAPI có sẵn trong project .NET 9.
builder.Services.AddOpenApi();

// Đọc chuỗi kết nối trong appsettings.json.
var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Không tìm thấy connection string DefaultConnection."
    );

// Đăng ký DbContext và cấu hình sử dụng SQL Server.
builder.Services.AddDbContext<AssetFlowDbContext>(options =>
    options.UseSqlServer(connectionString)
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Tạm thời chưa chuyển hướng HTTPS.
// app.UseHttpsRedirection();

app.MapControllers();

app.Run();