import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, Shield, User, GraduationCap, CheckCircle2 } from 'lucide-react';
// import api from '../../services/api';

const FILIERES_LIST = [
  { id: 1, name: 'Full Stack 208' },
  { id: 2, name: 'Développement Digital' },
  { id: 3, name: 'Réseaux et Sécurité' }
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Add form state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Étudiant', filiere: '' });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Data table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Décommenter pour utiliser la vraie API :
        // const response = await api.get('/users');
        // setUsers(response.data);

        // Mock data diverse
        setTimeout(() => {
          setUsers([
            { id: 1, name: 'Amina Bennis', email: 'amina.admin@edutrack.ma', role: 'Admin', filiere: null },
            { id: 2, name: 'Karim Tazi', email: 'k.tazi@prof.edutrack.ma', role: 'Professeur', filiere: null },
            { id: 3, name: 'Youssef Alaoui', email: 'youssef@etu.ma', role: 'Étudiant', filiere: 'Full Stack 208' },
            { id: 4, name: 'Sara Mansouri', email: 'sara@etu.ma', role: 'Étudiant', filiere: 'Développement Digital' },
            { id: 5, name: 'Mehdi Benkirane', email: 'mehdi.admin@edutrack.ma', role: 'Admin', filiere: null },
            { id: 6, name: 'Fatima Zahra', email: 'fatima@etu.ma', role: 'Étudiant', filiere: 'Réseaux et Sécurité' }
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Erreur de récupération des utilisateurs", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search, Sort and Paginate logic
  const processedData = useMemo(() => {
    // 1. Search filter
    let data = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.filiere && user.filiere.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [users, searchTerm, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity"><ChevronUp size={16} /></div>;
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={16} className="text-cyan-400" />
      : <ChevronDown size={16} className="text-cyan-400" />;
  };

  const confirmDelete = () => {
    // Appel API simulé
    setUsers(users.filter(u => u.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    showToast('Utilisateur supprimé avec succès.');
  };

  const handleSaveAdd = () => {
    if (newUser.role === 'Étudiant' && !newUser.filiere) {
      showToast('Veuillez sélectionner une filière pour cet étudiant.');
      // Optional: you could make this toast error-styled, but we'll stick to the current toast for simplicity
      return;
    }

    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    setUsers([...users, { id: newId, name: newUser.name || 'Nouvel Utilisateur', email: newUser.email, role: newUser.role, filiere: newUser.role === 'Étudiant' ? newUser.filiere : null }]);
    setNewUser({ name: '', email: '', password: '', role: 'Étudiant', filiere: '' });
    setIsAddModalOpen(false);
    showToast('Utilisateur ajouté avec succès.');
  };

  const closeAddModal = () => {
    setNewUser({ name: '', email: '', password: '', role: 'Étudiant', filiere: '' });
    setIsAddModalOpen(false);
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 py-1 px-3 rounded-full text-sm font-medium border border-yellow-500/20">
            <Shield size={14} /> Admin
          </span>
        );
      case 'Professeur':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 py-1 px-3 rounded-full text-sm font-medium border border-indigo-500/20">
            <User size={14} /> Professeur
          </span>
        );
      case 'Étudiant':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/20">
            <GraduationCap size={14} /> Étudiant
          </span>
        );
      default:
        return <span className="text-slate-400">{role}</span>;
    }
  };

  console.log('FILIERES_LIST:', FILIERES_LIST);

  return (
    <>
      <header className="mb-10 mt-12 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Gestion des Utilisateurs</h2>
          <p className="text-slate-400">Gérez les accès, les rôles et les comptes étudiants.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
        >
          <Plus size={20} />
          <span>Ajouter un Utilisateur</span>
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        <div className="text-slate-400 text-sm w-full sm:w-auto text-right">
          {processedData.length} utilisateur{processedData.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th
                  className="px-6 py-4 font-semibold text-slate-300 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Utilisateur {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold text-slate-300 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Rôle {getSortIcon('role')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold text-slate-300 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('filiere')}
                >
                  <div className="flex items-center gap-2">
                    Filière {getSortIcon('filiere')}
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">Chargement des données...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={40} className="mb-4 opacity-20" />
                      <p className="text-lg">Aucun utilisateur trouvé.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{user.name}</span>
                        <span className="text-sm text-slate-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.filiere ? user.filiere : <span className="text-slate-500 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20" title="Modifier">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/10">
            <div className="text-sm text-slate-400">
              Affichage de <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> sur <span className="text-white font-medium">{processedData.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold text-white">Ajouter un Utilisateur</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Ex: John Doe"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@edutrack.ma"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setNewUser({ ...newUser, role: newRole, filiere: newRole === 'Étudiant' ? newUser.filiere : '' });
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                  >
                    <option value="Étudiant" style={{ color: 'black', backgroundColor: 'white' }}>Étudiant</option>
                    <option value="Professeur" style={{ color: 'black', backgroundColor: 'white' }}>Professeur</option>
                    <option value="Admin" style={{ color: 'black', backgroundColor: 'white' }}>Administrateur</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label style={{ color: 'yellow' }}>--- FILIERE TEST FIELD ---</label>
                  <select
                    value={newUser.filiere}
                    onChange={(e) => setNewUser({ ...newUser, filiere: e.target.value })}
                    style={{ color: 'black', backgroundColor: 'white', display: 'block', width: '100%', padding: '10px', marginTop: '10px' }}
                  >
                    <option value="" style={{ color: 'black', backgroundColor: 'white' }}>-- Test: Data Loading... --</option>
                    <option value="1" style={{ color: 'black', backgroundColor: 'white' }}>Full Stack 208</option>
                    <option value="2" style={{ color: 'black', backgroundColor: 'white' }}>Développement Digital</option>
                    <option value="3" style={{ color: 'black', backgroundColor: 'white' }}>Réseaux et Sécurité</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 rounded-xl font-medium text-slate-300 hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded-xl font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-900 transition-colors"
                onClick={handleSaveAdd}
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center mt-2">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Êtes-vous sûr ?</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Voulez-vous vraiment supprimer l'utilisateur <br />
                <span className="text-white font-semibold">"{itemToDelete?.name}"</span> ? <br />
                Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-colors"
                >
                  Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </>
  );
};

export default UserManagement;