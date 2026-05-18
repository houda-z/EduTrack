import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/dashboard/filieres', icon: <BookOpen size={20} />, label: 'Gestion des Filières' },
    { path: '/dashboard/utilisateurs', icon: <Users size={20} />, label: 'Gestion des Utilisateurs' },
    { path: '/dashboard/settings', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans flex relative overflow-hidden">
      
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
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            ET
          </div>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
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

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
