import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importation des composants (تأكدي من المسارات صحيحة)
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardEtudiant from './pages/dashboard/DashboardEtudiant';
import Dashboard from './pages/dashboard/Dashboard';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard-etudiant" element={<DashboardEtudiant />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 