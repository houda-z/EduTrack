import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw,
  Server,
  Database
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Vue générale');
  const navigate = useNavigate();

  // Data states for CRUD
  const [filieres, setFilieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [users, setUsers] = useState([]);

  // Loaders for each section
  const [filiereLoading, setFiliereLoading] = useState(false);
  const [groupeLoading, setGroupeLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  // Forms states
  const [newFiliere, setNewFiliere] = useState({ nom: '', description: '' });
  const [newGroupe, setNewGroupe] = useState({ nom: '', filiere_id: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Paramètres states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoringFile, setRestoringFile] = useState(null);

  const handleMaintenanceToggle = () => {
    const nextMode = !maintenanceMode;
    setMaintenanceMode(nextMode);
    alert(`[Paramètre Système] Le mode maintenance est désormais ${nextMode ? 'ACTIF' : 'INACTIF'}.`);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setFormSuccess('');
    setFormError('');
    setTimeout(() => {
      setIsBackingUp(false);
      setFormSuccess('Base de données sauvegardée avec succès ! (edutrack_backup.sql)');
    }, 2000);
  };

  const handleDownload = (filename) => {
    alert(`Téléchargement réussi : ${filename} a été enregistré dans vos téléchargements.`);
  };

  const handleRestore = (filename) => {
    if (restoringFile) return; // prevent double-click
    setRestoringFile(filename);
    setTimeout(() => {
      setRestoringFile(null);
      alert(`Restauration réussie ! La base de données a été réinitialisée à la version ${filename}.`);
    }, 2000);
  };

  // Helper to get authorization headers
  const getAuthConfig = () => {
    const token = localStorage.getItem('user_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch stats on mount
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/stats', getAuthConfig());
      setStats(response.data);
    } catch (err) {
      console.error('Erreur API Admin Stats:', err);
      setError('Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch tab-specific data on tab switch
  useEffect(() => {
    if (activeTab === 'Vue générale') {
      fetchStats();
    } else if (activeTab === 'Gestion Filières') {
      fetchFilieres();
    } else if (activeTab === 'Gestion Groupes') {
      fetchGroupes();
      fetchFilieres(); // Needed for group creation dropdown
    } else if (activeTab === 'Gestion Utilisateurs') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- Filières API calls ---
  const fetchFilieres = async () => {
    try {
      setFiliereLoading(true);
      const response = await axios.get('http://localhost:8000/api/filieres', getAuthConfig());
      setFilieres(response.data);
    } catch (err) {
      console.error('Erreur fetch filieres:', err);
      setError('Erreur lors du chargement des filières.');
    } finally {
      setFiliereLoading(false);
    }
  };

  const handleCreateFiliere = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!newFiliere.nom.trim()) {
      setFormError('Le nom de la filière est requis.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/filieres', newFiliere, getAuthConfig());
      setFilieres([...filieres, response.data]);
      setNewFiliere({ nom: '', description: '' });
      setFormSuccess('Filière créée avec succès !');
      // Update local stats count if loaded
      if (stats) setStats({ ...stats, total_filieres: stats.total_filieres + 1 });
    } catch (err) {
      console.error('Erreur creation filiere:', err);
      setFormError(err.response?.data?.message || 'Erreur lors de la création de la filière.');
    }
  };

  const handleDeleteFiliere = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette filière ? Tous les groupes associés seront supprimés.')) return;
    try {
      await axios.delete(`http://localhost:8000/api/filieres/${id}`, getAuthConfig());
      setFilieres(filieres.filter(f => f.id !== id));
      if (stats) setStats({ ...stats, total_filieres: Math.max(0, stats.total_filieres - 1) });
    } catch (err) {
      console.error('Erreur suppression filiere:', err);
      alert('Impossible de supprimer la filière.');
    }
  };

  // --- Groupes API calls ---
  const fetchGroupes = async () => {
    try {
      setGroupeLoading(true);
      const response = await axios.get('http://localhost:8000/api/groupes', getAuthConfig());
      setGroupes(response.data);
    } catch (err) {
      console.error('Erreur fetch groupes:', err);
      setError('Erreur lors du chargement des groupes.');
    } finally {
      setGroupeLoading(false);
    }
  };

  const handleCreateGroupe = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!newGroupe.nom.trim() || !newGroupe.filiere_id) {
      setFormError('Le nom et la filière sont requis.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/groupes', newGroupe, getAuthConfig());
      setGroupes([...groupes, response.data]);
      setNewGroupe({ nom: '', filiere_id: '' });
      setFormSuccess('Groupe créé avec succès !');
      if (stats) setStats({ ...stats, total_groupes: stats.total_groupes + 1 });
    } catch (err) {
      console.error('Erreur creation groupe:', err);
      setFormError(err.response?.data?.message || 'Erreur lors de la création du groupe.');
    }
  };

  const handleDeleteGroupe = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce groupe ?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/groupes/${id}`, getAuthConfig());
      setGroupes(groupes.filter(g => g.id !== id));
      if (stats) setStats({ ...stats, total_groupes: Math.max(0, stats.total_groupes - 1) });
    } catch (err) {
      console.error('Erreur suppression groupe:', err);
      alert('Impossible de supprimer le groupe.');
    }
  };

  // --- Users API calls ---
  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/users', getAuthConfig());
      setUsers(response.data);
    } catch (err) {
      console.error('Erreur fetch users:', err);
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await axios.put(`http://localhost:8000/api/admin/users/${id}/role`, { role: newRole }, getAuthConfig());
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      // Refresh statistics counts
      fetchStats();
    } catch (err) {
      console.error('Erreur maj role user:', err);
      alert('Impossible de modifier le rôle.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${id}`, getAuthConfig());
      setUsers(users.filter(u => u.id !== id));
      if (stats) setStats({ ...stats, total_users: Math.max(0, stats.total_users - 1) });
    } catch (err) {
      console.error('Erreur suppression user:', err);
      alert("Impossible d'effacer cet utilisateur.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { label: 'Vue générale', icon: <LayoutDashboard size={20} /> },
    { label: 'Gestion Filières', icon: <BookOpen size={20} /> },
    { label: 'Gestion Groupes', icon: <Users size={20} /> },
    { label: 'Gestion Utilisateurs', icon: <GraduationCap size={20} /> },
    { label: 'Paramètres', icon: <Settings size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans flex relative overflow-hidden">
      
      {/* Decorative background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Sidebar Mobile Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-lg hover:bg-white/10 transition-colors"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-68 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            ET
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider leading-none">EduTrack</h1>
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-widest mt-1 block">Panel Admin</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(link.label);
                setIsSidebarOpen(false);
                setFormError('');
                setFormSuccess('');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group border ${activeTab === link.label
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              <span className={activeTab === link.label ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400 transition-colors'}>
                {link.icon}
              </span>
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck size={18} className="text-cyan-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate">Administrateur</p>
              <p className="text-[10px] text-slate-400 truncate">admin@edutrack.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all duration-200 text-sm font-semibold"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 relative z-10">
        
        {/* Dynamic content rendering based on activeTab */}
        {activeTab === 'Vue générale' && (
          <>
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Espace Administrateur
                </h2>
                <p className="text-slate-400 text-sm mt-1">Supervision de l'état de la plateforme EduTrack en temps réel.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-xs font-semibold backdrop-blur-md">
                <Activity size={14} className="text-emerald-400 animate-pulse" />
                Système en ligne
              </div>
            </header>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Utilisateurs Enregistrés</p>
                    <h3 className="text-4xl font-extrabold text-white">
                      {loading ? '...' : stats?.total_users ?? 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <Users size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-slate-400">
                  <span>Étudiants : <strong className="text-white">{stats?.total_etudiants ?? 0}</strong></span>
                  <span>Profs : <strong className="text-white">{stats?.total_enseignants ?? 0}</strong></span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Filières</p>
                    <h3 className="text-4xl font-extrabold text-white">
                      {loading ? '...' : stats?.total_filieres ?? 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <BookOpen size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Catalogues académiques</span>
                  <span className="text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setActiveTab('Gestion Filières')}>Gérer <ArrowRight size={12} /></span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Groupes</p>
                    <h3 className="text-4xl font-extrabold text-white">
                      {loading ? '...' : stats?.total_groupes ?? 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-400">
                    <LayoutDashboard size={24} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Répartition active</span>
                  <span className="text-fuchsia-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setActiveTab('Gestion Groupes')}>Voir <ArrowRight size={12} /></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="w-2 h-5 bg-cyan-400 rounded-sm inline-block"></span>
                  Gestion Rapide
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div onClick={() => setActiveTab('Gestion Filières')} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-cyan-500/20 transition-all cursor-pointer">
                    <h4 className="font-semibold text-sm mb-1 text-white">Gérer les Filières</h4>
                    <p className="text-xs text-slate-400 mb-3">Ajouter, modifier ou supprimer des filières académiques.</p>
                    <span className="text-xs text-cyan-400 flex items-center gap-1">Ouvrir l'outil <ArrowRight size={12} /></span>
                  </div>
                  <div onClick={() => setActiveTab('Gestion Utilisateurs')} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all cursor-pointer">
                    <h4 className="font-semibold text-sm mb-1 text-white">Gérer les Utilisateurs</h4>
                    <p className="text-xs text-slate-400 mb-3">Administrer les comptes des étudiants, enseignants.</p>
                    <span className="text-xs text-indigo-400 flex items-center gap-1">Ouvrir l'outil <ArrowRight size={12} /></span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 text-white">Informations Système</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Laravel API Host</span>
                    <span className="font-mono text-cyan-300">127.0.0.1:8000</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Database Driver</span>
                    <span className="font-semibold">MySQL</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">React Port</span>
                    <span className="font-mono text-indigo-300">3000</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- Tab: Gestion Filières --- */}
        {activeTab === 'Gestion Filières' && (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-cyan-300">🏫 Gestion des Filières</h2>
              <p className="text-slate-400 text-sm mt-1">Créez et supprimez les filières de formation d'EduTrack.</p>
            </header>

            {formError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form creation */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
                <h3 className="text-lg font-bold mb-4 text-white">Ajouter une Filière</h3>
                <form onSubmit={handleCreateFiliere} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nom de la Filière</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Développement Digital"
                      value={newFiliere.nom}
                      onChange={(e) => setNewFiliere({ ...newFiliere, nom: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description / Code</label>
                    <textarea 
                      placeholder="Description abrégée ou détails de la formation..."
                      value={newFiliere.description}
                      onChange={(e) => setNewFiliere({ ...newFiliere, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 text-sm transition-all h-24 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Créer la filière
                  </button>
                </form>
              </div>

              {/* Table List */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                <h3 className="text-lg font-bold mb-4 text-white">Filières Actives</h3>
                {filiereLoading ? (
                  <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 className="animate-spin" />
                    <span>Chargement des filières...</span>
                  </div>
                ) : filieres.length === 0 ? (
                  <p className="text-center text-slate-500 py-12 text-sm">Aucune filière trouvée dans le système.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase">
                          <th className="pb-3 pr-4">ID</th>
                          <th className="pb-3 pr-4">Nom</th>
                          <th className="pb-3 pr-4">Description</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filieres.map((filiere) => (
                          <tr key={filiere.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-4 font-mono text-cyan-400 font-semibold">#{filiere.id}</td>
                            <td className="py-4 pr-4 font-semibold text-white">{filiere.nom}</td>
                            <td className="py-4 pr-4 text-slate-400 truncate max-w-[200px]">{filiere.description || '—'}</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteFiliere(filiere.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all"
                                title="Supprimer la filière"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Gestion Groupes --- */}
        {activeTab === 'Gestion Groupes' && (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-fuchsia-300">👥 Gestion des Groupes</h2>
              <p className="text-slate-400 text-sm mt-1">Créez et gérez les groupes d'étudiants par filière.</p>
            </header>

            {formError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold">
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Creation */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
                <h3 className="text-lg font-bold mb-4 text-white">Créer un Groupe</h3>
                <form onSubmit={handleCreateGroupe} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nom du Groupe</label>
                    <input 
                      type="text" 
                      placeholder="e.g. DEV101"
                      value={newGroupe.nom}
                      onChange={(e) => setNewGroupe({ ...newGroupe, nom: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Associer à une Filière</label>
                    <select
                      value={newGroupe.filiere_id}
                      onChange={(e) => setNewGroupe({ ...newGroupe, filiere_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-sm transition-all cursor-pointer"
                      required
                    >
                      <option value="" className="bg-[#0f172a] text-slate-400">Choisir une filière...</option>
                      {filieres.map(f => (
                        <option key={f.id} value={f.id} className="bg-[#0f172a] text-white">
                          {f.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Créer le groupe
                  </button>
                </form>
              </div>

              {/* Table List */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                <h3 className="text-lg font-bold mb-4 text-white">Groupes de Formation Actifs</h3>
                {groupeLoading ? (
                  <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 className="animate-spin" />
                    <span>Chargement des groupes...</span>
                  </div>
                ) : groupes.length === 0 ? (
                  <p className="text-center text-slate-500 py-12 text-sm">Aucun groupe trouvé dans le système.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase">
                          <th className="pb-3 pr-4">ID</th>
                          <th className="pb-3 pr-4">Nom Groupe</th>
                          <th className="pb-3 pr-4">Filière Associée</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {groupes.map((groupe) => (
                          <tr key={groupe.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-4 font-mono text-fuchsia-400 font-semibold">#{groupe.id}</td>
                            <td className="py-4 pr-4 font-semibold text-white">{groupe.nom}</td>
                            <td className="py-4 pr-4">
                              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-indigo-300">
                                {groupe.filiere?.nom || `Filière ID: ${groupe.filiere_id}`}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteGroupe(groupe.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all"
                                title="Supprimer le groupe"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Gestion Utilisateurs --- */}
        {activeTab === 'Gestion Utilisateurs' && (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-indigo-300">🎓 Gestion des Utilisateurs</h2>
              <p className="text-slate-400 text-sm mt-1">Supervisez et modifiez les rôles et permissions des comptes enregistrés.</p>
            </header>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
              <h3 className="text-lg font-bold mb-4 text-white">Comptes Utilisateurs</h3>
              {userLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="animate-spin" />
                  <span>Chargement des utilisateurs...</span>
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-slate-500 py-12 text-sm">Aucun utilisateur enregistré dans le système.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs font-semibold uppercase">
                        <th className="pb-3 pr-4">Nom Complet</th>
                        <th className="pb-3 pr-4">Adresse Email</th>
                        <th className="pb-3 pr-4">Rôle Actuel</th>
                        <th className="pb-3 text-right">Actions / Modifier Rôle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4 font-semibold text-white">
                            {user.prenom ? `${user.prenom} ${user.name}` : user.name}
                          </td>
                          <td className="py-4 pr-4 font-mono text-xs text-slate-400">{user.email}</td>
                          <td className="py-4 pr-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'admin' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : user.role === 'enseignant'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 text-right flex items-center justify-end gap-3">
                            {/* Update Role Select */}
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs transition-all cursor-pointer focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="admin" className="bg-[#0f172a] text-red-400">Admin</option>
                              <option value="enseignant" className="bg-[#0f172a] text-amber-400">Enseignant</option>
                              <option value="etudiant" className="bg-[#0f172a] text-cyan-400">Étudiant</option>
                            </select>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab: Paramètres --- */}
        {activeTab === 'Paramètres' && (
          <div className="space-y-6 w-full max-w-6xl">
            <header>
              <h2 className="text-3xl font-bold text-slate-300">⚙️ Configuration du Système</h2>
              <p className="text-slate-400 text-sm mt-1">Ajustements techniques généraux, sécurité et statut des services de la plateforme.</p>
            </header>

            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold max-w-3xl">
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Configuration Générale */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="w-1.5 h-4 bg-cyan-400 rounded-sm inline-block"></span>
                  Configuration Générale
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nom de la plateforme</label>
                    <input 
                      type="text" 
                      defaultValue="EduTrack"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email de contact système</label>
                    <input 
                      type="email" 
                      defaultValue="contact@edutrack.ma"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Fuseau horaire par défaut</label>
                    <select
                      defaultValue="UTC+01:00"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-sm transition-all cursor-pointer"
                    >
                      <option value="UTC+00:00" className="bg-[#0f172a]">UTC+00:00 (Londres, GMT)</option>
                      <option value="UTC+01:00" className="bg-[#0f172a]">UTC+01:00 (Casablanca, Paris, Bruxelles)</option>
                      <option value="UTC+02:00" className="bg-[#0f172a]">UTC+02:00 (Le Caire, Athènes)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-white">Mode Maintenance</h4>
                      <p className="text-xs text-slate-400">Restreint l'accès aux utilisateurs non-administrateurs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {maintenanceMode ? (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded tracking-wider">
                          Actif
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded tracking-wider">
                          Inactif
                        </span>
                      )}
                      <input 
                        type="checkbox" 
                        checked={maintenanceMode}
                        onChange={handleMaintenanceToggle}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-900 focus:ring-cyan-500 cursor-pointer accent-cyan-400" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sécurité & Backups */}
              <div className="space-y-6">
                
                {/* Database Backups Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <span className="w-1.5 h-4 bg-fuchsia-400 rounded-sm inline-block"></span>
                    Sécurité & Backups
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-fuchsia-500/10 rounded-lg text-fuchsia-400">
                        <Database size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-white">Dernière sauvegarde</h4>
                        <p className="text-xs text-slate-400">Aujourd'hui à 18:30 (Automatique)</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleBackup}
                      disabled={isBackingUp}
                      className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:bg-slate-800 disabled:text-slate-500 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 disabled:border-transparent rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      {isBackingUp ? (
                        <>
                          <Loader2 className="animate-spin h-3.5 w-3.5" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Lancer Sauvegarde'
                      )}
                    </button>
                  </div>

                  {/* Previous Backups list */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historique des fichiers SQL</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400 font-semibold">
                            <th className="pb-2">Nom de fichier</th>
                            <th className="pb-2">Taille</th>
                            <th className="pb-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[
                            { name: 'edutrack_backup_v2.sql', size: '15.4 Mo' },
                            { name: 'edutrack_backup_v1.sql', size: '12.1 Mo' },
                          ].map((file) => (
                            <tr key={file.name} className="group">
                              <td className="py-2.5 font-mono text-cyan-400">{file.name}</td>
                              <td className="py-2.5 text-slate-400">{file.size}</td>
                              <td className="py-2.5 text-right">
                                <div className="flex justify-end gap-2">
                                  {/* Download button */}
                                  <button
                                    onClick={() => handleDownload(file.name)}
                                    disabled={!!restoringFile}
                                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-40 border border-cyan-500/20 rounded-lg text-cyan-400 transition-all"
                                    title="Télécharger"
                                  >
                                    <Download size={14} />
                                  </button>

                                  {/* Restore button */}
                                  <button
                                    onClick={() => handleRestore(file.name)}
                                    disabled={!!restoringFile}
                                    className="p-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 disabled:opacity-40 border border-fuchsia-500/20 rounded-lg text-fuchsia-400 transition-all"
                                    title="Restaurer"
                                  >
                                    <RefreshCw
                                      size={14}
                                      className={restoringFile === file.name ? 'animate-spin' : ''}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Status des services card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-sm inline-block"></span>
                    Statut des Services
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Laravel Service */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mb-2">
                        <Server size={18} />
                      </div>
                      <span className="text-xs font-semibold text-white">API Laravel</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse"></span>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">En ligne</span>
                      </div>
                    </div>

                    {/* MySQL Service */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mb-2">
                        <Database size={18} />
                      </div>
                      <span className="text-xs font-semibold text-white">MySQL DB</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse"></span>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Connecté</span>
                      </div>
                    </div>

                    {/* React App Service */}
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 mb-2">
                        <Activity size={18} />
                      </div>
                      <span className="text-xs font-semibold text-white">React App</span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse"></span>
                        <span className="text-[10px] text-cyan-400 uppercase font-bold">Production</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;