import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  // الحالة لتخزين بيانات الفورم
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', 
    confirmPassword: '', filiere: '', groupe: ''
  });

  // دالة لتحديث البيانات عند الكتابة
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log("Données:", formData);
    alert('Inscription réussie!');
    // التوجه لصفحة الداشبورد (تأكدي أن المسار مطابق لـ App.js)
    navigate('/dashboard'); 
  };

  return (
    <div className={`home-container ${showRegister ? 'form-active' : ''}`}>
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <img src="/logo.png" alt="EduTrack Logo" className="logo" />
          <div className="nav-links">
            <button onClick={() => setShowRegister(true)} className="login-link">
              Inscription
            </button>
            <Link to="/login" className="nav-btn">Se connecter</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">✨ Nouveau : Gestion des Examens 2026</div>
          <h1>L'excellence numérique pour <span>EduTrack</span></h1>
          <p>
            Simplifiez la gestion de votre parcours académique. Une plateforme 
            conçue pour les étudiants, les professeurs et l'administration.
          </p>
          <div className="hero-actions">
            {/* التعديل هنا: استعملنا المسار /dashboard نيشان */}
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
               Accéder au Dashboard
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="image-wrapper">
            <img src="/hero.png" alt="Education Illustration" className="hero-img" />
            <div className="circle-gradient"></div>
            <div className="stat-card card-1">⭐ 4.9 Note</div>
            <div className="stat-card card-2">👥 +200 Étudiants</div>
          </div>
        </div>
      </section>

      {/* Register Form (Modal) */}
      {showRegister && (
        <div className="register-overlay" onClick={() => setShowRegister(false)}>
          <div className="register-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowRegister(false)}>×</button>
            <h2>Inscription - Étudiant</h2>
            <p>Veuillez remplir vos informations académiques</p>
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-grid">
                <input name="nom" type="text" placeholder="Nom" onChange={handleChange} required />
                <input name="prenom" type="text" placeholder="Prénom" onChange={handleChange} required />
              </div>
              
              <input name="email" type="email" placeholder="Email Académique" className="full-input" onChange={handleChange} required /> 
              
              <div className="form-grid">
                <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
                <input name="confirmPassword" type="password" placeholder="Confirmer MDP" onChange={handleChange} required />
              </div>
              
              <div className="form-grid">
                <input name="filiere" type="text" placeholder="Filière" onChange={handleChange} required />
                <input name="groupe" type="text" placeholder="Groupe" onChange={handleChange} required />
              </div>
              
              <button type="submit" className="submit-register-btn">
                Créer mon compte
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>© 2026 EduTrack • Plateforme de Gestion Académique</p>
      </footer>
      
    </div>
  );
  
};

export default Home;