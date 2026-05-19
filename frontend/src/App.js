import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/dashboard/DashboardEtudiant';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import FiliereManagement from './pages/dashboard/FiliereManagement';
import UserManagement from './pages/dashboard/UserManagement';
import Settings from './pages/dashboard/Settings';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Etudiant — URL avec son nom */}
          <Route path="/etudiant/:nom/cours" element={<DashboardEtudiant />} />

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