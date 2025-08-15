import { useState } from 'react';
import './App.css';
import OwnersPage from './pages/OwnersPage';
import PetsPage from './pages/PetsPage';
import AppointmentsPage from './pages/AppointmentsPage';

type Tab = 'owners' | 'pets' | 'appointments';

export default function App() {
  const [tab, setTab] = useState<Tab>('owners');

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-title">PetClinicAI</span>
            <span className="brand-sub">Dashboard</span>
          </div>
          <nav className="tabs">
            <button className={`tab-btn ${tab === 'owners' ? 'active' : ''}`} onClick={() => setTab('owners')}>Owners</button>
            <button className={`tab-btn ${tab === 'pets' ? 'active' : ''}`} onClick={() => setTab('pets')}>Pets</button>
            <button className={`tab-btn ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>Appointments</button>
          </nav>
        </div>
      </header>
      <main className="container">
        <div className="card">
          {tab === 'owners' && <OwnersPage />}
          {tab === 'pets' && <PetsPage />}
          {tab === 'appointments' && <AppointmentsPage />}
        </div>
      </main>
    </>
  );
}
