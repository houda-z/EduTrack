import React, { useState, useRef, useEffect } from 'react';
import {
    BookOpen,
    Calendar,
    ClipboardList,
    Award,
    User,
    Settings,
    LogOut,
    Search,
    Menu,
    X,
    LayoutDashboard,
    ChevronDown
} from 'lucide-react';
import { Link, useLocation, useParams, Outlet, useNavigate } from 'react-router-dom';
import './EtudiantLayout.css';
import api from '../../services/api';

const EtudiantLayout = () => {
    const { nom } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState(null);

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Error parsing user:', err);
            }
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    <img src="/Gemini_Generated_Image_z92bi9z92bi9z92b (1) (1).png" alt="EduTrack Logo" className="sidebar-logo" />

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
                        {/* User Menu Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{user?.prenom || user?.name || nom || 'Utilisateur'}</p>
                                    <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">ÉTUDIANT</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white/20">
                                    {(user?.prenom || user?.name || nom || 'E')[0].toUpperCase()}
                                </div>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/5">
                                        <p className="text-xs font-bold text-white truncate">{user?.prenom} {user?.name || nom}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{user?.email || 'etudiant@edutrack.com'}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold"
                                    >
                                        <LogOut size={15} />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
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
