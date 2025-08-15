import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import styles from './pages.module.css';

type Owner = { ownerId: number; name: string };

type Pet = { petId: number; name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number; owner?: Owner };

type CreatePet = { name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number };

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePet>({ name: '', species: '', breed: '', birthDate: '', isNeutered: false, ownerId: 0 });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [petsRes, ownersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/pets`),
        fetch(`${API_BASE_URL}/owners`)
      ]);
      if (!petsRes.ok) throw new Error(`Pets HTTP ${petsRes.status}`);
      if (!ownersRes.ok) throw new Error(`Owners HTTP ${ownersRes.status}`);
      const petsData: Pet[] = await petsRes.json();
      const ownersData: Owner[] = await ownersRes.json();
      setPets(petsData);
      setOwners(ownersData);
    } catch (e: any) {
      setError(e.message ?? 'Error fetching pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/pets`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          ...form,
          ownerId: Number(form.ownerId) || 0,
          birthDate: form.birthDate || undefined,
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ name: '', species: '', breed: '', birthDate: '', isNeutered: false, ownerId: 0 });
      await fetchData();
    } catch (e: any) {
      setError(e.message ?? 'Error creating pet');
    }
  };

  return (
    <div className={styles.section}>
      <h2>Pets</h2>
      <form onSubmit={onSubmit} className={styles.form}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Species" value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} required />
        <input placeholder="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
        <input type="date" placeholder="Birth Date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={form.isNeutered} onChange={e => setForm({ ...form, isNeutered: e.target.checked })} /> Neutered
        </label>
        <select value={form.ownerId} onChange={e => setForm({ ...form, ownerId: Number(e.target.value) })} required>
          <option value={0} disabled>Select owner</option>
          {owners.map(o => (
            <option key={o.ownerId} value={o.ownerId}>{o.name}</option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>
      {loading && <p>Loading...</p>}
  {error && <p className={styles.error}>{error}</p>}
      <ul>
        {pets.map(p => (
          <li key={p.petId}>{p.name} ({p.species}{p.breed ? ` / ${p.breed}` : ''}) — Owner: {p.owner?.name ?? p.ownerId}</li>
        ))}
      </ul>
    </div>
  );
}
