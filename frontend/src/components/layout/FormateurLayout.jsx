import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ClipboardList,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  User,
  CheckSquare,
  ChevronDown
} from 'lucide-react';

const FormateurLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Load user data from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Professeur', prenom: 'Formateur' };
  const formateurName = `${user.prenom} ${user.name}`;

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/formateur/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/formateur/cours', icon: <BookOpen size={20} />, label: 'Mes Cours' },
    { path: '/formateur/cours/creer', icon: <PlusCircle size={20} />, label: 'Créer un Cours' },
    { path: '/formateur/examens', icon: <ClipboardList size={20} />, label: 'Examens' },
    { path: '/formateur/correction', icon: <CheckSquare size={20} />, label: 'Correction' },
    { path: '/formateur/etudiants', icon: <Users size={20} />, label: 'Mes Étudiants' },
    { path: '/formateur/emploi-du-temps', icon: <Calendar size={20} />, label: 'Emploi du Temps' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans relative">

      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Sidebar Mobile Toggle Hamburger */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg hover:bg-white/10 transition-all text-cyan-400"
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-35 bg-black/60 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-66 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen overflow-y-auto`}>

        {/* Brand header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">

          <div>
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">EduTrack</h1>
            <span className="text-[10px] text-cyan-400/80 font-bold tracking-widest uppercase">Espace Enseignant</span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className={isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}>
                  {link.icon}
                </div>
                <span className="font-semibold text-[13.5px]">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all font-semibold text-[13.5px]"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top Header Navigation */}
        <header className="h-16 border-b border-white/5 backdrop-blur-md bg-[#0f172a]/30 px-6 md:px-10 flex items-center justify-end z-20">
          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user?.prenom || user?.name || 'Formateur'}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">ENSEIGNANT</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white/20">
                {(user?.prenom || user?.name || 'F')[0].toUpperCase()}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-bold text-white truncate">{user?.prenom} {user?.name || 'Formateur'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'formateur@edutrack.com'}</p>
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
        </header>

        {/* Inner Content Area */}
        <main className="flex-1 p-6 md:p-10 relative overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default FormateurLayout;
