import { useState } from 'react';
import './App.css';
import OwnersPage from './pages/OwnersPage';
import PetsPage from './pages/PetsPage';
import AppointmentsPage from './pages/AppointmentsPage';

type Tab = 'owners' | 'pets' | 'appointments';

export default function App() {
  const [tab, setTab] = useState<Tab>('owners');

  return (
    <div className="container" style={{ padding: 16 }}>
      <h1>PetClinicAI</h1>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('owners')} disabled={tab === 'owners'}>Owners</button>
        <button onClick={() => setTab('pets')} disabled={tab === 'pets'}>Pets</button>
        <button onClick={() => setTab('appointments')} disabled={tab === 'appointments'}>Appointments</button>
      </nav>
      {tab === 'owners' && <OwnersPage />}
      {tab === 'pets' && <PetsPage />}
      {tab === 'appointments' && <AppointmentsPage />}
    </div>
  );
}
