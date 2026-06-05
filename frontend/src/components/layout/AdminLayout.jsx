import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, Menu, X, LogOut, ChevronDown } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/dashboard/filieres', icon: <BookOpen size={20} />, label: 'Gestion des Filières' },
    { path: '/dashboard/utilisateurs', icon: <Users size={20} />, label: 'Gestion des Utilisateurs' },
    { path: '/dashboard/settings', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans relative">

      {/* Decorative background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen overflow-y-auto`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">

          <h1 className="text-xl font-bold tracking-wider">EduTrack</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            // Using end matching for /dashboard so it doesn't match /dashboard/filieres
            const isActive = link.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className={isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400 transition-colors'}>
                  {link.icon}
                </div>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header with User Dropdown */}
        <header className="h-16 border-b border-white/5 backdrop-blur-md bg-[#0f172a]/30 px-6 md:px-10 flex items-center justify-end z-20">
          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user?.prenom || user?.name || 'Admin'}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">ADMINISTRATEUR</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white/20">
                {(user?.prenom || user?.name || 'A')[0].toUpperCase()}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-bold text-white truncate">{user?.prenom} {user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@edutrack.com'}</p>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;