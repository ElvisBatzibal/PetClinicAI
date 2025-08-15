import { useEffect, useState } from 'react';
import './App.css';
import { PetClinicApi } from './api/petclinic';
import type { Owner, Pet, Appointment } from './api/petclinic';

function App() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    void (async () => {
      try {
        const [o, p, a] = await Promise.all([
          PetClinicApi.getOwners(),
          PetClinicApi.getPets(),
          PetClinicApi.getUpcomingAppointments(),
        ]);
        setOwners(o);
        setPets(p);
        setAppts(a);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const submitOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.name.trim()) return;
    await PetClinicApi.createOwner(ownerForm);
    setOwnerForm({ name: '', email: '', phone: '' });
    setOwners(await PetClinicApi.getOwners());
  };

  return (
    <div className="container">
      <h1>PetClinicAI Frontend</h1>

      <section>
        <h2>Owners</h2>
        <form onSubmit={submitOwner} className="form">
          <input placeholder="Name" value={ownerForm.name} onChange={e => setOwnerForm({ ...ownerForm, name: e.target.value })} />
          <input placeholder="Email" value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} />
          <input placeholder="Phone" value={ownerForm.phone} onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })} />
          <button type="submit">Create Owner</button>
        </form>
        <ul>
          {owners.map(o => (
            <li key={o.ownerId}>{o.name} — {o.email} — {o.phone}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Pets</h2>
        <ul>
          {pets.map(p => (
            <li key={p.petId}>{p.name} ({p.species}) — Owner: {p.owner?.name ?? p.ownerId}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Upcoming Appointments</h2>
        <ul>
          {appts.map(a => (
            <li key={a.appointmentId}>{new Date(a.visitDate).toLocaleString()} — {a.petName} ({a.species}) — {a.ownerName} — {a.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
