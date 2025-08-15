using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Data;
using PetClinicAI.API.Models;
using PetClinicAI.API.Dtos;

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

// Se movieron DTOs, Modelos, DbContext y Seed a carpetas dedicadas.
