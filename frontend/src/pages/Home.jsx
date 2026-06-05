import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {

  const navigate = useNavigate();

  return (
    <div className="home-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <img src="/logo.png" alt="EduTrack Logo" className="logo" />
          <div className="nav-links">
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

      {/* Register removed — Login only */}

      <footer className="home-footer">
        <p>© 2026 EduTrack • Plateforme de Gestion Académique</p>
      </footer>

    </div>
  );

};

export default Home;