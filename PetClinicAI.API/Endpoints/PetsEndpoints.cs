using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Data;
using PetClinicAI.API.Dtos;
using PetClinicAI.API.Models;

namespace PetClinicAI.API.Endpoints;

public static class PetsEndpoints
{
    public static void MapPetsEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /pets
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

        // POST /pets
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
    }
}
