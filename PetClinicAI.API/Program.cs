using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// EF Core DbContext y cadena de conexión (DI)
builder.Services.AddDbContext<PetClinicDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Seed inicial si base está vacía
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PetClinicDbContext>();
    await SeedData.SeedIfEmptyAsync(db);
}

// Endpoints

// GET /owners (listar todos)
app.MapGet("/owners", async (PetClinicDbContext db) =>
{
    var owners = await db.Owners
        .AsNoTracking()
        .Select(o => new { o.OwnerId, o.Name, o.Email, o.Phone })
        .ToListAsync();
    return Results.Ok(owners);
})
.WithName("GetOwners")
.WithOpenApi();

// GET /owners/{id} (con mascotas)
app.MapGet("/owners/{id:int}", async (int id, PetClinicDbContext db) =>
{
    var owner = await db.Owners
        .AsNoTracking()
        .Where(o => o.OwnerId == id)
        .Select(o => new
        {
            o.OwnerId,
            o.Name,
            o.Email,
            o.Phone,
            Pets = o.Pets.Select(p => new { p.PetId, p.Name, p.Species, p.Breed, p.BirthDate, p.IsNeutered, p.OwnerId })
        })
        .FirstOrDefaultAsync();

    return owner is null ? Results.NotFound() : Results.Ok(owner);
})
.WithName("GetOwnerById")
.WithOpenApi();

// POST /owners (crear)
app.MapPost("/owners", async (OwnerCreateDto dto, PetClinicDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name))
        return Results.BadRequest("Name is required.");

    var owner = new Owner { Name = dto.Name.Trim(), Email = dto.Email, Phone = dto.Phone };
    db.Owners.Add(owner);
    await db.SaveChangesAsync();
    return Results.Created($"/owners/{owner.OwnerId}", new { owner.OwnerId, owner.Name, owner.Email, owner.Phone });
})
.WithName("CreateOwner")
.WithOpenApi();

// GET /pets (con info de owner)
app.MapGet("/pets", async (PetClinicDbContext db) =>
{
    var pets = await db.Pets
        .AsNoTracking()
        .Select(p => new
        {
            p.PetId,
            p.Name,
            p.Species,
            p.Breed,
            p.BirthDate,
            p.IsNeutered,
            p.OwnerId,
            Owner = new { p.Owner!.OwnerId, p.Owner!.Name, p.Owner!.Phone }
        })
        .ToListAsync();
    return Results.Ok(pets);
})
.WithName("GetPets")
.WithOpenApi();

// POST /pets (crear)
app.MapPost("/pets", async (PetCreateDto dto, PetClinicDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Species))
        return Results.BadRequest("Name and Species are required.");

    var ownerExists = await db.Owners.AnyAsync(o => o.OwnerId == dto.OwnerId);
    if (!ownerExists) return Results.BadRequest("OwnerId not found.");

    var pet = new Pet
    {
        Name = dto.Name.Trim(),
        Species = dto.Species.Trim(),
        Breed = dto.Breed,
        BirthDate = dto.BirthDate,
        IsNeutered = dto.IsNeutered,
        OwnerId = dto.OwnerId
    };

    db.Pets.Add(pet);
    await db.SaveChangesAsync();
    return Results.Created($"/pets/{pet.PetId}", pet);
})
.WithName("CreatePet")
.WithOpenApi();

// GET /appointments/upcoming (próximas 10 con detalles)
app.MapGet("/appointments/upcoming", async (PetClinicDbContext db) =>
{
    var now = DateTime.UtcNow;
    var items = await db.Appointments
        .AsNoTracking()
        .Where(a => a.VisitDate >= now)
        .OrderBy(a => a.VisitDate)
        .Take(10)
        .Select(a => new
        {
            a.AppointmentId,
            a.VisitDate,
            a.Status,
            PetName = a.Pet!.Name,
            Species = a.Pet!.Species,
            OwnerName = a.Pet!.Owner!.Name,
            Phone = a.Pet!.Owner!.Phone
        })
        .ToListAsync();
    return Results.Ok(items);
})
.WithName("GetUpcomingAppointments")
.WithOpenApi();

// POST /appointments (crear)
app.MapPost("/appointments", async (AppointmentCreateDto dto, PetClinicDbContext db) =>
{
    var petExists = await db.Pets.AnyAsync(p => p.PetId == dto.PetId);
    if (!petExists) return Results.BadRequest("PetId not found.");

    var appt = new Appointment
    {
        PetId = dto.PetId,
        VisitDate = dto.VisitDate,
        Reason = dto.Reason,
        Status = dto.Status ?? "Scheduled",
        Notes = dto.Notes
    };

    db.Appointments.Add(appt);
    await db.SaveChangesAsync();
    return Results.Created($"/appointments/{appt.AppointmentId}", appt);
})
.WithName("CreateAppointment")
.WithOpenApi();

app.Run();

// DTOs
public record OwnerCreateDto(string Name, string? Email, string? Phone);
public record PetCreateDto(string Name, string Species, string? Breed, DateTime? BirthDate, bool IsNeutered, int OwnerId);
public record AppointmentCreateDto(int PetId, DateTime VisitDate, string Reason, string? Status, string? Notes);

// Modelos EF Core (en este archivo para simplicidad)
public class Owner
{
    public int OwnerId { get; set; }
    public string Name { get; set; } = default!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}

public class Pet
{
    public int PetId { get; set; }
    public string Name { get; set; } = default!;
    public string Species { get; set; } = default!;
    public string? Breed { get; set; }
    public DateTime? BirthDate { get; set; }
    public bool IsNeutered { get; set; }
    public int OwnerId { get; set; }
    public Owner? Owner { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}

public class Appointment
{
    public int AppointmentId { get; set; }
    public int PetId { get; set; }
    public DateTime VisitDate { get; set; }
    public string Reason { get; set; } = default!;
    public string Status { get; set; } = "Scheduled";
    public string? Notes { get; set; }
    public Pet? Pet { get; set; }
}

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

public static class SeedData
{
    public static async Task SeedIfEmptyAsync(PetClinicDbContext db)
    {
        // Si ya hay datos, salimos
        if (await db.Owners.AnyAsync()) return;

        var o1 = new Owner { Name = "John Doe", Email = "john.doe@example.com", Phone = "555-1234" };
        var o2 = new Owner { Name = "Jane Smith", Email = "jane.smith@example.com", Phone = "555-5678" };
        var o3 = new Owner { Name = "Alice Johnson", Email = "alice.johnson@example.com", Phone = "555-8765" };

        db.Owners.AddRange(o1, o2, o3);
        await db.SaveChangesAsync();

        var p1 = new Pet { Name = "Buddy", Species = "Dog", Breed = "Golden Retriever", BirthDate = new DateTime(2020, 5, 10), IsNeutered = true, OwnerId = o1.OwnerId };
        var p2 = new Pet { Name = "Mittens", Species = "Cat", Breed = "Siamese", BirthDate = new DateTime(2019, 8, 15), IsNeutered = false, OwnerId = o1.OwnerId };
        var p3 = new Pet { Name = "Charlie", Species = "Dog", Breed = "Beagle", BirthDate = new DateTime(2021, 3, 22), IsNeutered = true, OwnerId = o2.OwnerId };
        var p4 = new Pet { Name = "Whiskers", Species = "Cat", Breed = "Persian", BirthDate = new DateTime(2022, 1, 10), IsNeutered = false, OwnerId = o2.OwnerId };
        var p5 = new Pet { Name = "Coco", Species = "Other", Breed = "Parrot", BirthDate = new DateTime(2018, 7, 5), IsNeutered = false, OwnerId = o3.OwnerId };

        db.Pets.AddRange(p1, p2, p3, p4, p5);
        await db.SaveChangesAsync();

        var now = DateTime.UtcNow;
        var a1 = new Appointment { PetId = p1.PetId, VisitDate = now.AddDays(7), Reason = "Annual check-up", Status = "Scheduled" };
        var a2 = new Appointment { PetId = p1.PetId, VisitDate = now.AddDays(-30), Reason = "Vaccination", Notes = "Rabies vaccine", Status = "Completed" };
        var a3 = new Appointment { PetId = p2.PetId, VisitDate = now.AddDays(14), Reason = "Dental cleaning", Status = "Scheduled" };
        var a4 = new Appointment { PetId = p3.PetId, VisitDate = now.AddDays(-10), Reason = "Skin allergy treatment", Notes = "Prescribed ointment", Status = "Completed" };
        var a5 = new Appointment { PetId = p4.PetId, VisitDate = now.AddDays(3), Reason = "Neutering surgery", Status = "Cancelled" };
        var a6 = new Appointment { PetId = p5.PetId, VisitDate = now.AddDays(-5), Reason = "Wing trimming", Status = "Completed" };

        db.Appointments.AddRange(a1, a2, a3, a4, a5, a6);
        await db.SaveChangesAsync();
    }
}
