import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  User, 
  LogOut, 
  Search, 
  Bell,
  ChevronRight,
  Clock,
  Calendar
} from 'lucide-react';
import './DashboardEtudiant.css';

const DashboardEtudiant = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState({ name: 'Étudiant' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cours');
        setCourses(response.data);
      } catch (err) {
        console.error('Erreur cours:', err);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">ET</div>
          <h2>EduTrack</h2>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#home" className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a href="#courses" className="nav-item">
            <BookOpen size={20} />
            <span>Mes Cours</span>
          </a>
          <a href="#exams" className="nav-item">
            <GraduationCap size={20} />
            <span>Examens</span>
          </a>
          <a href="#profile" className="nav-item">
            <User size={20} />
            <span>Profil</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Rechercher un cours..." />
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">{user.name.charAt(0)}</div>
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content-scroll">
          <section className="welcome-section">
            <h1>Bienvenue, <span className="gradient-text">{user.name}</span> 👋</h1>
            <p>Heureux de vous revoir ! Voici votre progression actuelle.</p>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Cours en cours</span>
              <span className="stat-value">{courses.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Examens à venir</span>
              <span className="stat-value">2</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Moyenne Générale</span>
              <span className="stat-value">16.5</span>
            </div>
          </section>

          <div className="dashboard-grid-main">
            {/* Left Column: Courses */}
            <section className="courses-section">
              <div className="section-header">
                <h2>Mes Cours</h2>
                <button className="text-btn">Voir tout <ChevronRight size={16} /></button>
              </div>

              <div className="course-grid">
                {loading ? (
                  [1, 2].map(i => <div key={i} className="course-card skeleton"></div>)
                ) : (
                  courses.slice(0, 2).map(course => (
                    <div key={course.id} className="course-card">
                      <div className="course-image">
                        <div className="course-tag">{course.filiere?.nom || 'Général'}</div>
                      </div>
                      <div className="course-info">
                        <h3>{course.titre}</h3>
                        <p>{course.enseignant?.name || 'Professeur'}</p>
                        <div className="progress-bar">
                          <div className="progress" style={{ width: '45%' }}></div>
                        </div>
                        <div className="course-footer">
                          <span>45% complété</span>
                          <button className="btn-start">Continuer</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Right Column: Recent Activity / Calendar */}
            <aside className="activity-sidebar">
              <div className="section-header">
                <h2>Prochains Examens</h2>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon calendar"><Calendar size={18} /></div>
                  <div className="activity-info">
                    <h4>React Advanced</h4>
                    <p>Lundi, 20 Mai - 10:00</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon clock"><Clock size={18} /></div>
                  <div className="activity-info">
                    <h4>PHP & Laravel</h4>
                    <p>Jeudi, 23 Mai - 14:00</p>
                  </div>
                </div>
              </div>

              <div className="announcement-card">
                <h3>Nouveau !</h3>
                <p>Le module de Design UI est maintenant disponible dans votre filière.</p>
                <button className="btn-secondary">Découvrir</button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEtudiant;
