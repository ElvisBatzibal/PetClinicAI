namespace PetClinicAI.API.Models;

public class Owner
{
    public int OwnerId { get; set; }
    public string Name { get; set; } = default!;
    public string? Email { get; set; }
    public string? Phone { get; set; }

    // Navigation
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}
