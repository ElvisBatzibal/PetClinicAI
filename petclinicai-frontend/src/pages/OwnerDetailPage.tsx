import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

type Pet = { petId: number; name: string; species: string; breed?: string };

type OwnerDetail = { ownerId: number; name: string; email?: string; phone?: string; pets: Pet[] };

export default function OwnerDetailPage({ ownerId, onBack }: { ownerId: number; onBack: () => void }) {
  const [data, setData] = useState<OwnerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/owners/${ownerId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar detalle');
      } finally { setLoading(false); }
    };
    void run();
  }, [ownerId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return null;

  return (
    <div>
      <button className="btn" onClick={onBack}>← Volver</button>
      <h2>{data.name}</h2>
      <p>{data.email || '—'} · {data.phone || '—'}</p>
      <h3>Mascotas</h3>
      <ul className="list">
        {data.pets.map(p => (
          <li className="list-item" key={p.petId}>
            <strong>{p.name}</strong> <small>({p.species}{p.breed ? ` / ${p.breed}` : ''})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
