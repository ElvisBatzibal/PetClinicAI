namespace PetClinicAI.API.Dtos;

public record PetCreateDto(string Name, string Species, string? Breed, DateTime? BirthDate, bool IsNeutered, int OwnerId);
