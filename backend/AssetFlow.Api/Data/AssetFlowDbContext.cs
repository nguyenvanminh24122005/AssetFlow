using AssetFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssetFlow.Api.Data;

public class AssetFlowDbContext : DbContext
{
    public AssetFlowDbContext(
        DbContextOptions<AssetFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<AssetCategory> AssetCategories => Set<AssetCategory>();

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Employee> Employees =>
    Set<Employee>();
    public DbSet<AssetHandover> AssetHandovers =>
    Set<AssetHandover>();

    public DbSet<AssetHandoverItem> AssetHandoverItems =>
    Set<AssetHandoverItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AssetCategory>()
            .HasIndex(category => category.Code)
            .IsUnique();

        modelBuilder.Entity<Asset>()
            .HasIndex(asset => asset.AssetCode)
            .IsUnique();

        modelBuilder.Entity<Asset>()
            .HasIndex(asset => asset.SerialNumber)
            .IsUnique()
            .HasFilter("[SerialNumber] IS NOT NULL");

        modelBuilder.Entity<Asset>()
            .HasIndex(asset => asset.Status);

        modelBuilder.Entity<Asset>()
            .HasIndex(asset => asset.CategoryId);

        modelBuilder.Entity<Asset>()
            .HasOne(asset => asset.Category)
            .WithMany(category => category.Assets)
            .HasForeignKey(asset => asset.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Employee>()
            .HasIndex(employee => employee.EmployeeCode)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .HasIndex(employee => employee.Email)
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL");

        modelBuilder.Entity<Employee>()
            .HasIndex(employee => employee.IsActive);
        modelBuilder.Entity<AssetHandover>()
            .HasIndex(handover => handover.HandoverCode)
            .IsUnique();

        modelBuilder.Entity<AssetHandover>()
            .HasIndex(handover => handover.EmployeeId);

        modelBuilder.Entity<AssetHandover>()
            .HasIndex(handover => handover.Status);

        modelBuilder.Entity<AssetHandover>()
            .HasOne(handover => handover.Employee)
            .WithMany()
            .HasForeignKey(handover => handover.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AssetHandoverItem>()
            .HasIndex(item => new
            {
                item.AssetHandoverId,
                item.AssetId
            })
            .IsUnique();

        modelBuilder.Entity<AssetHandoverItem>()
            .HasOne(item => item.AssetHandover)
            .WithMany(handover => handover.Items)
            .HasForeignKey(item => item.AssetHandoverId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AssetHandoverItem>()
            .HasOne(item => item.Asset)
            .WithMany()
            .HasForeignKey(item => item.AssetId)
            .OnDelete(DeleteBehavior.Restrict);
            }
}