import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import styles from './pages.module.css';
import { useToast } from '../components/Toast';

type Owner = { ownerId: number; name: string };

type Pet = { petId: number; name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number; owner?: Owner };

type CreatePet = { name: string; species: string; breed?: string; birthDate?: string; isNeutered: boolean; ownerId: number };

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePet>({ name: '', species: '', breed: '', birthDate: '', isNeutered: false, ownerId: 0 });
  const [errors, setErrors] = useState<{ name?: string; species?: string; ownerId?: string }>({});
  const [query, setQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { push } = useToast();

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

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Nombre requerido';
    if (!form.species.trim()) next.species = 'Especie requerida';
    if (!form.ownerId) next.ownerId = 'Debe seleccionar un propietario';
    setErrors(next); return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
  push({ type: 'success', title: 'Creado', message: 'Pet creado correctamente' });
    } catch (e: any) {
  setError(e.message ?? 'Error creating pet');
  push({ type: 'error', title: 'Error', message: 'No se pudo crear la mascota' });
    }
  };

  return (
    <div className={styles.section}>
      <h2>Pets</h2>
      <p>Listado de mascotas y su propietario.</p>
      <div className="form-grid">
        <input placeholder="Buscar por nombre o raza" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
        <input placeholder="Filtrar por especie" value={speciesFilter} onChange={e => { setSpeciesFilter(e.target.value); setPage(1); }} />
      </div>
      <form onSubmit={onSubmit} className={styles.form}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        {errors.name && <small className={styles.error}>{errors.name}</small>}
        <input placeholder="Species" value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} required />
        {errors.species && <small className={styles.error}>{errors.species}</small>}
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
        {errors.ownerId && <small className={styles.error}>{errors.ownerId}</small>}
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      {loading && <p>Loading...</p>}
  {error && <p className={styles.error}>{error}</p>}
      <ul className="list">
        {pets
          .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()) || (p.breed || '').toLowerCase().includes(query.toLowerCase()))
          .filter(p => !speciesFilter || p.species.toLowerCase().includes(speciesFilter.toLowerCase()))
          .slice((page - 1) * pageSize, page * pageSize)
          .map(p => (
            <li className="list-item" key={p.petId}>
              <strong>{p.name}</strong> <small>({p.species}{p.breed ? ` / ${p.breed}` : ''})</small>
              <br />Owner: {p.owner?.name ?? p.ownerId}
            </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <button className="btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <span style={{ color: 'var(--muted)' }}>Página {page}</span>
        <button className="btn" onClick={() => setPage(p => (p * pageSize < pets.filter(pp => (!query || pp.name.toLowerCase().includes(query.toLowerCase()) || (pp.breed || '').toLowerCase().includes(query.toLowerCase())) && (!speciesFilter || pp.species.toLowerCase().includes(speciesFilter.toLowerCase()))).length ? p + 1 : p))}>Siguiente</button>
      </div>
    </div>
  );
}
