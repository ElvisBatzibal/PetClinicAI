import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import styles from './pages.module.css';
import { useToast } from '../components/Toast';

type Appointment = { appointmentId: number; visitDate: string; status: string; petName: string; species: string; ownerName: string; phone?: string };

type CreateAppointment = { petId: number; visitDate: string; reason: string; status?: string; notes?: string };

type Pet = { petId: number; name: string };

export default function AppointmentsPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAppointment>({ petId: 0, visitDate: '', reason: '', status: 'Scheduled', notes: '' });
  const [errors, setErrors] = useState<{ petId?: string; visitDate?: string; reason?: string }>({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { push } = useToast();

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

  const validate = () => {
    const next: typeof errors = {};
    if (!form.petId) next.petId = 'Seleccione una mascota';
    if (!form.visitDate) next.visitDate = 'Fecha y hora requeridas';
    if (!form.reason.trim()) next.reason = 'Motivo requerido';
    setErrors(next); return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
  push({ type: 'success', title: 'Creada', message: 'Cita creada correctamente' });
    } catch (e: any) {
  setError(e.message ?? 'Error creating appointment');
  push({ type: 'error', title: 'Error', message: 'No se pudo crear la cita' });
    }
  };

  return (
    <div className={styles.section}>
      <h2>Appointments</h2>
      <p>Próximas citas y creación de nuevas.</p>
      <div className="form-grid">
        <input placeholder="Buscar por mascota o propietario" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todas</option>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        <select value={form.petId} onChange={e => setForm({ ...form, petId: Number(e.target.value) })} required>
          <option value={0} disabled>Select pet</option>
          {pets.map(p => (<option key={p.petId} value={p.petId}>{p.name}</option>))}
        </select>
        {errors.petId && <small className={styles.error}>{errors.petId}</small>}
        <input type="datetime-local" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} required />
        {errors.visitDate && <small className={styles.error}>{errors.visitDate}</small>}
        <input placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
        {errors.reason && <small className={styles.error}>{errors.reason}</small>}
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
        <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      {loading && <p>Loading...</p>}
  {error && <p className={styles.error}>{error}</p>}
      <ul className="list">
        {appts
          .filter(a => !query || a.petName.toLowerCase().includes(query.toLowerCase()) || a.ownerName.toLowerCase().includes(query.toLowerCase()))
          .filter(a => !statusFilter || a.status === statusFilter)
          .slice((page - 1) * pageSize, page * pageSize)
          .map(a => (
            <li className="list-item" key={a.appointmentId}>
              <strong>{a.petName}</strong> <small>({a.species})</small> · {a.ownerName} {a.phone ? `· ${a.phone}` : ''}
              <br />
              {new Date(a.visitDate).toLocaleString()} · <em>{a.status}</em>
            </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <span style={{ color: 'var(--muted)' }}>Página {page}</span>
        <button className="btn" onClick={() => setPage(p => (p * pageSize < appts.filter(a => (!query || a.petName.toLowerCase().includes(query.toLowerCase()) || a.ownerName.toLowerCase().includes(query.toLowerCase())) && (!statusFilter || a.status === statusFilter)).length ? p + 1 : p))}>Siguiente</button>
      </div>
    </div>
  );
}
