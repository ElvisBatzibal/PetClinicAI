namespace PetClinicAI.API.Dtos;

public record AppointmentCreateDto(int PetId, DateTime VisitDate, string Reason, string? Status, string? Notes);
