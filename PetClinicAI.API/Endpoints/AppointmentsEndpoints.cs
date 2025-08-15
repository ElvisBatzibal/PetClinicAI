using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Data;
using PetClinicAI.API.Dtos;

namespace PetClinicAI.API.Endpoints;

public static class AppointmentsEndpoints
{
    public static void MapAppointmentsEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /appointments/upcoming
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

        // POST /appointments
        app.MapPost("/appointments", async (AppointmentCreateDto dto, PetClinicDbContext db) =>
        {
            var petExists = await db.Pets.AnyAsync(p => p.PetId == dto.PetId);
            if (!petExists) return Results.BadRequest("PetId not found.");

            var appt = new Models.Appointment
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
    }
}
