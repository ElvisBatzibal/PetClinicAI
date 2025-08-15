import { api } from './client';

export type Owner = { ownerId: number; name: string; email?: string; phone?: string };
export type Pet = { petId: number; name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number; owner?: { ownerId: number; name: string; phone?: string } };
export type Appointment = { appointmentId: number; visitDate: string; status: string; petName: string; species: string; ownerName: string; phone?: string };

export const PetClinicApi = {
  getOwners: () => api.get<Owner[]>('/owners'),
  getOwnerById: (id: number) => api.get<Owner & { pets: Pet[] }>(`/owners/${id}`),
  createOwner: (payload: { name: string; email?: string; phone?: string }) => api.post<{ ownerId: number }>(`/owners`, payload),

  getPets: () => api.get<Pet[]>('/pets'),
  createPet: (payload: { name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number }) => api.post(`/pets`, payload),

  getUpcomingAppointments: () => api.get<Appointment[]>(`/appointments/upcoming`),
  createAppointment: (payload: { petId: number; visitDate: string; reason: string; status?: string; notes?: string }) => api.post(`/appointments`, payload),
};
