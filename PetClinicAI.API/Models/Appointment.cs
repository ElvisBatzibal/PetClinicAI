namespace PetClinicAI.API.Models;

public class Appointment
{
    public int AppointmentId { get; set; }
    public int PetId { get; set; }
    public DateTime VisitDate { get; set; }
    public string Reason { get; set; } = default!;
    public string Status { get; set; } = "Scheduled";
    public string? Notes { get; set; }
    public Pet? Pet { get; set; }
}
