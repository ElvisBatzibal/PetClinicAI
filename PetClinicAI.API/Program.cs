using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Data;
using PetClinicAI.API.Models;
using PetClinicAI.API.Dtos;
using PetClinicAI.API.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// EF Core DbContext y cadena de conexión (DI)
builder.Services.AddDbContext<PetClinicDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: permitir todas las conexiones (no restringido)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

// Seed inicial si base está vacía
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PetClinicDbContext>();
    await SeedData.SeedIfEmptyAsync(db);
}

// Endpoints por recurso
app.MapOwnersEndpoints();
app.MapPetsEndpoints();
app.MapAppointmentsEndpoints();

app.Run();

// Se movieron DTOs, Modelos, DbContext y Seed a carpetas dedicadas.
