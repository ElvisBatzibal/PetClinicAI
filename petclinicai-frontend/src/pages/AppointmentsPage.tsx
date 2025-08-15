import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

type Appointment = { appointmentId: number; visitDate: string; status: string; petName: string; species: string; ownerName: string; phone?: string };

type CreateAppointment = { petId: number; visitDate: string; reason: string; status?: string; notes?: string };

type Pet = { petId: number; name: string };

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAppointment>({ petId: 0, visitDate: '', reason: '', status: 'Scheduled', notes: '' });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [aRes, pRes] = await Promise.all([
        fetch(`${API_BASE_URL}/appointments/upcoming`),
        fetch(`${API_BASE_URL}/pets`)
      ]);
      if (!aRes.ok) throw new Error(`Appointments HTTP ${aRes.status}`);
      if (!pRes.ok) throw new Error(`Pets HTTP ${pRes.status}`);
      const aData: Appointment[] = await aRes.json();
      const pData: Pet[] = await pRes.json();
      setAppts(aData);
      setPets(pData);
    } catch (e: any) {
      setError(e.message ?? 'Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          ...form,
          petId: Number(form.petId) || 0,
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ petId: 0, visitDate: '', reason: '', status: 'Scheduled', notes: '' });
      await fetchData();
    } catch (e: any) {
      setError(e.message ?? 'Error creating appointment');
    }
  };

  return (
    <div>
      <h2>Appointments</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={form.petId} onChange={e => setForm({ ...form, petId: Number(e.target.value) })} required>
          <option value={0} disabled>Select pet</option>
          {pets.map(p => (<option key={p.petId} value={p.petId}>{p.name}</option>))}
        </select>
        <input type="datetime-local" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} required />
        <input placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button type="submit">Add</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {appts.map(a => (
          <li key={a.appointmentId}>
            {new Date(a.visitDate).toLocaleString()} — {a.petName} ({a.species}) — {a.ownerName} — {a.phone ?? ''} — {a.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
