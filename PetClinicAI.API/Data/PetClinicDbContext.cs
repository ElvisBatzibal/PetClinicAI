using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Models;

namespace PetClinicAI.API.Data;

public class PetClinicDbContext : DbContext
{
    public PetClinicDbContext(DbContextOptions<PetClinicDbContext> options) : base(options) { }

    public DbSet<Owner> Owners => Set<Owner>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("clinic");

        modelBuilder.Entity<Owner>(entity =>
        {
            entity.ToTable("Owners");
            entity.HasKey(e => e.OwnerId);
            entity.Property(e => e.Name).HasColumnName("FullName").HasMaxLength(120).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(160);
            entity.Property(e => e.Phone).HasMaxLength(40);
        });

        modelBuilder.Entity<Pet>(entity =>
        {
            entity.ToTable("Pets");
            entity.HasKey(e => e.PetId);
            entity.Property(e => e.Name).HasColumnName("PetName").HasMaxLength(80).IsRequired();
            entity.Property(e => e.Species).HasMaxLength(40).IsRequired();
            entity.Property(e => e.Breed).HasMaxLength(80);

            entity.HasOne(e => e.Owner)
                  .WithMany(o => o.Pets)
                  .HasForeignKey(e => e.OwnerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.OwnerId);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointments");
            entity.HasKey(e => e.AppointmentId);
            entity.Property(e => e.Reason).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Scheduled");
            entity.Property(e => e.Notes).HasMaxLength(400);

            entity.HasOne(a => a.Pet)
                  .WithMany(p => p.Appointments)
                  .HasForeignKey(a => a.PetId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => a.PetId);
            entity.HasIndex(a => a.VisitDate);
        });
    }
}
