import React, { useState } from 'react';
import {
    BookOpen,
    Calendar,
    ClipboardList,
    Award,
    User,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    X,
    LayoutDashboard
} from 'lucide-react';
import { Link, useLocation, useParams, Outlet, useNavigate } from 'react-router-dom';
import './EtudiantLayout.css';
import api from '../../services/api';

const EtudiantLayout = () => {
    const { nom } = useParams();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { path: `/etudiant/${nom}/dashboard`, icon: <LayoutDashboard size={20} />, label: "Dashboard", end: true },
        { path: `/etudiant/${nom}/cours`, icon: <BookOpen size={20} />, label: "Mes Cours" },
        { path: `/etudiant/${nom}/emploi`, icon: <Calendar size={20} />, label: "Emploi du Temps" },
        { path: `/etudiant/${nom}/examens`, icon: <ClipboardList size={20} />, label: "Examens" },
        { path: `/etudiant/${nom}/notes`, icon: <Award size={20} />, label: "Mes Notes" },
        { path: `/etudiant/${nom}/profil`, icon: <User size={20} />, label: "Mon Profil" },
        { path: `/etudiant/${nom}/parametres`, icon: <Settings size={20} />, label: "Paramètres" },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.delete('/logout');
        } catch (err) {
            console.warn('Logout API failed:', err);
        } finally {
            localStorage.removeItem('user_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // Dynamic Title based on Path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === `/etudiant/${nom}` || path === `/etudiant/${nom}/dashboard`) {
            return 'Dashboard';
        }
        const currentItem = navItems.find((item) => path === item.path);
        return currentItem ? currentItem.label : 'Tableau de Bord';
    };

    return (
        <div className={`etudiant-layout ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
            {/* Sidebar Overlay for Mobile */}
            {!isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-box">
                        <LayoutDashboard size={24} />
                    </div>
                    <h2 className="brand-name">Edu<span className="text-cyan">Track</span></h2>
                    <button className="mobile-close" onClick={toggleSidebar}><X /></button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = item.end
                            ? location.pathname === item.path || location.pathname === `/etudiant/${nom}`
                            : location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                                {isActive && <div className="active-glow"></div>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="version-tag">VER. 2.0.4-STU</div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-viewport">
                <header className="top-bar-stu">
                    <div className="top-bar-left">
                        <button className="menu-toggle-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h2 className="page-context-title">{getPageTitle()}</h2>
                    </div>

                    <div className="search-box-stu">
                        <Search size={18} className="search-icon" />
                        <input type="text" placeholder="Rechercher..." />
                    </div>

                    <div className="top-bar-right">
                        <button className="notif-btn">
                            <Bell size={20} />
                            <span className="scifi-dot"></span>
                        </button>

                        <div className="stu-profile-pill">
                            <div className="stu-info">
                                <span className="stu-name">{nom || "Utilisateur"}</span>
                                <span className="stu-role">Étudiant</span>
                            </div>
                            <div className="stu-avatar">
                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${nom}`} alt="avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="glass-inner-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EtudiantLayout;
