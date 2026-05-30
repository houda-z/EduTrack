import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/dashboard/DashboardEtudiant';
import EtudiantLayout from './components/layout/EtudiantLayout';
import MesCours from './pages/dashboard/MesCours';
import EmploiDuTemps from './pages/dashboard/EmploiDuTemps';
import Examens from './pages/dashboard/Examens';
import ExamenEnLigne from './pages/dashboard/ExamenEnLigne';
import MesNotes from './pages/dashboard/MesNotes';
import ProfilEtudiant from './pages/dashboard/ProfilEtudiant';
import ParametresEtudiant from './pages/dashboard/ParametresEtudiant';

import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import FiliereManagement from './pages/dashboard/FiliereManagement';
import UserManagement from './pages/dashboard/UserManagement';
import Settings from './pages/dashboard/Settings';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Espace Étudiant — Avec Layout Sci-Fi */}
          <Route path="/etudiant/:nom/en-ligne" element={<ExamenEnLigne />} />
          
          <Route path="/etudiant/:nom" element={<EtudiantLayout />}>
            <Route index element={<DashboardEtudiant />} />
            <Route path="dashboard" element={<DashboardEtudiant />} />
            <Route path="cours" element={<MesCours />} />
            <Route path="emploi" element={<EmploiDuTemps />} />
            <Route path="examens" element={<Examens />} />
            <Route path="notes" element={<MesNotes />} />
            <Route path="profil" element={<ProfilEtudiant />} />
            <Route path="parametres" element={<ParametresEtudiant />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="filieres" element={<FiliereManagement />} />
            <Route path="utilisateurs" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;