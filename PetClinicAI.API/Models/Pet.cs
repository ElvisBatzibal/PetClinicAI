namespace PetClinicAI.API.Models;

public class Pet
{
    public int PetId { get; set; }
    public string Name { get; set; } = default!;
    public string Species { get; set; } = default!;
    public string? Breed { get; set; }
    public DateTime? BirthDate { get; set; }
    public bool IsNeutered { get; set; }

    // FK
    public int OwnerId { get; set; }

    // Navigation
    public Owner? Owner { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
