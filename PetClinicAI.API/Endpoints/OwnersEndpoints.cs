using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;
using PetClinicAI.API.Data;
using PetClinicAI.API.Dtos;
using PetClinicAI.API.Models;

namespace PetClinicAI.API.Endpoints;

public static class OwnersEndpoints
{
    public static void MapOwnersEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /owners
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

        // GET /owners/{id}
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

        // POST /owners
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
    }
}
