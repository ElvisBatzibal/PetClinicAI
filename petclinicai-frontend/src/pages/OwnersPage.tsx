import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import styles from './pages.module.css';
import { useToast } from '../components/Toast';
import OwnerDetailPage from './OwnerDetailPage';

type Owner = { ownerId: number; name: string; email?: string; phone?: string };

type CreateOwner = { name: string; email?: string; phone?: string };

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateOwner>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedOwner, setSelectedOwner] = useState<number | null>(null);
  const { push } = useToast();

  const fetchOwners = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/owners`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Owner[] = await res.json();
      setOwners(data);
    } catch (e: any) {
      setError(e.message ?? 'Error fetching owners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchOwners(); }, []);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Nombre requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email inválido';
    if (form.phone && !/^\+?[0-9\-\s]{7,}$/.test(form.phone)) next.phone = 'Teléfono inválido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/owners`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ name: '', email: '', phone: '' });
      await fetchOwners();
      push({ type: 'success', title: 'Creado', message: 'Owner creado correctamente' });
    } catch (e: any) {
      setError(e.message ?? 'Error creating owner');
      push({ type: 'error', title: 'Error', message: 'No se pudo crear el Owner' });
    }
  };

  return (
    <div className={styles.section}>
      <h2>Owners</h2>
      <p>Administra propietarios y datos de contacto.</p>
      <div className="form-grid" style={{ alignItems: 'start' }}>
        <input placeholder="Buscar por nombre o email" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        <div style={{ width: '100%', maxWidth: 260 }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          {errors.name && <small className={styles.error}>{errors.name}</small>}
        </div>
        <div style={{ width: '100%', maxWidth: 260 }}>
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          {errors.email && <small className={styles.error}>{errors.email}</small>}
        </div>
        <div style={{ width: '100%', maxWidth: 200 }}>
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          {errors.phone && <small className={styles.error}>{errors.phone}</small>}
        </div>
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      {loading && <p>Loading...</p>}
  {error && <p className={styles.error}>{error}</p>}
      <ul className="list">
        {owners
          .filter(o => !query || (o.name?.toLowerCase().includes(query.toLowerCase()) || (o.email || '').toLowerCase().includes(query.toLowerCase())))
          .slice((page - 1) * pageSize, page * pageSize)
          .map(o => (
          <li className="list-item" key={o.ownerId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <strong>{o.name}</strong><br /><small>{o.email || '—'} · {o.phone || '—'}</small>
              </div>
              <button className="btn" onClick={() => setSelectedOwner(o.ownerId)}>Ver detalle</button>
            </div>
          </li>
        ))}
      </ul>
      {selectedOwner !== null && (
        <div className="card" style={{ marginTop: 16 }}>
          <OwnerDetailPage ownerId={selectedOwner} onBack={() => setSelectedOwner(null)} />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <span style={{ color: 'var(--muted)' }}>Página {page}</span>
        <button className="btn" onClick={() => setPage(p => (p * pageSize < owners.filter(o => !query || (o.name?.toLowerCase().includes(query.toLowerCase()) || (o.email || '').toLowerCase().includes(query.toLowerCase()))).length ? p + 1 : p))}>Siguiente</button>
      </div>
    </div>
  );
}
