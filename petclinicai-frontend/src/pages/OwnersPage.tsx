import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import styles from './pages.module.css';

type Owner = { ownerId: number; name: string; email?: string; phone?: string };

type CreateOwner = { name: string; email?: string; phone?: string };

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateOwner>({ name: '', email: '', phone: '' });

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/owners`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ name: '', email: '', phone: '' });
      await fetchOwners();
    } catch (e: any) {
      setError(e.message ?? 'Error creating owner');
    }
  };

  return (
    <div className={styles.section}>
      <h2>Owners</h2>
      <p>Administra propietarios y datos de contacto.</p>
      <form onSubmit={onSubmit} className={styles.form}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <button type="submit">Add</button>
      </form>
      {loading && <p>Loading...</p>}
  {error && <p className={styles.error}>{error}</p>}
      <ul className="list">
        {owners.map(o => (
          <li className="list-item" key={o.ownerId}><strong>{o.name}</strong><br /><small>{o.email || '—'} · {o.phone || '—'}</small></li>
        ))}
      </ul>
    </div>
  );
}
