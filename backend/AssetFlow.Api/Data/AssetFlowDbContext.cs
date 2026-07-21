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
    }
}