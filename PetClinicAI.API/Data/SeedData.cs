using Microsoft.EntityFrameworkCore;
using PetClinicAI.API.Models;

namespace PetClinicAI.API.Data;

public static class SeedData
{
    public static async Task SeedIfEmptyAsync(PetClinicDbContext db)
    {
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
