import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, X, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
// import api from '../../services/api';

const FiliereManagement = () => {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [newFiliere, setNewFiliere] = useState({ name: '', status: 'Active' });
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        // Décommenter pour utiliser la vraie API :
        // const response = await api.get('/filieres');
        // setFilieres(response.data);
        
        // Données mockées enrichies
        setTimeout(() => {
          setFilieres([
            { id: 1, name: 'Full Stack 208', count: 24, status: 'Active' },
            { id: 2, name: 'Développement Digital', count: 18, status: 'Active' },
            { id: 3, name: 'Réseaux et Sécurité', count: 32, status: 'Active' },
            { id: 4, name: 'Marketing Digital', count: 15, status: 'Archivée' },
            { id: 5, name: 'Intelligence Artificielle', count: 28, status: 'Active' },
            { id: 6, name: 'Cloud Computing', count: 20, status: 'Active' },
            { id: 7, name: 'Design UX/UI', count: 22, status: 'Active' },
            { id: 8, name: 'Cybersécurité Avancée', count: 19, status: 'Archivée' }
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Erreur de récupération des filières", error);
        setLoading(false);
      }
    };

    fetchFilieres();
  }, []);

  // Search, Sort and Paginate logic (Real-time recalculation)
  const processedData = useMemo(() => {
    // 1. Search filter
    let data = filieres.filter(filiere => 
      filiere.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filiere.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [filieres, searchTerm, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentItems = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when searching to avoid empty pages
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

  const exportCSV = () => {
    const headers = ['ID', 'Nom de la Filière', "Nombre d'Étudiants", 'Statut'];
    const csvContent = [
      headers.join(','),
      ...processedData.map(f => `${f.id},"${f.name}",${f.count},${f.status}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'filieres_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const confirmDelete = () => {
    setFilieres(filieres.filter(f => f.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    showToast('Filière supprimée avec succès.');
  };

  const handleSaveAdd = () => {
    // Add logic here
    const newId = Math.max(...filieres.map(f => f.id), 0) + 1;
    setFilieres([...filieres, { id: newId, name: newFiliere.name || 'Nouvelle Filière', count: 0, status: newFiliere.status }]);
    setNewFiliere({ name: '', status: 'Active' });
    setIsAddModalOpen(false);
    showToast('Filière ajoutée avec succès.');
  };

  const closeAddModal = () => {
    setNewFiliere({ name: '', status: 'Active' });
    setIsAddModalOpen(false);
  };

  return (
    <>
      <header className="mb-10 mt-12 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Gestion des Filières</h2>
          <p className="text-slate-400">Gérez les filières, les promotions et les statuts.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button 
            onClick={exportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-all backdrop-blur-md"
          >
            <Download size={20} />
            <span>Exporter CSV</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
          >
            <Plus size={20} />
            <span>Ajouter une Filière</span>
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une filière ou un statut..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        <div className="text-slate-400 text-sm w-full sm:w-auto text-right">
          {processedData.length} résultat{processedData.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th 
                  className="px-6 py-4 font-semibold text-slate-300 w-20 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID {getSortIcon('id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-300 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Nom de la Filière {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-300 cursor-pointer group hover:bg-white/5 transition-colors select-none"
                  onClick={() => handleSort('count')}
                >
                  <div className="flex items-center gap-2">
                    Nombre d'Étudiants {getSortIcon('count')}
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-300">Statut</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Chargement des données...</td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={40} className="mb-4 opacity-20" />
                      <p className="text-lg">Aucune filière trouvée.</p>
                      <p className="text-sm opacity-70">Essayez de modifier vos termes de recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((filiere) => (
                  <tr key={filiere.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 text-slate-400">#{filiere.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{filiere.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-500/10 text-indigo-300 py-1 px-3 rounded-full text-sm font-medium border border-indigo-500/20">
                        {filiere.count} étudiants
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {filiere.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 py-1 px-3 rounded-full text-sm font-medium border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-500/10 text-slate-400 py-1 px-3 rounded-full text-sm font-medium border border-slate-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          Archivée
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20" title="Modifier">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setItemToDelete(filiere);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20" 
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/10">
            <div className="text-sm text-slate-400 text-center sm:text-left">
              Affichage de <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> sur <span className="text-white font-medium">{processedData.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      currentPage === i + 1 
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
                className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold text-white">Ajouter une Filière</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nom de la filière</label>
                <input 
                  type="text" 
                  value={newFiliere.name}
                  onChange={(e) => setNewFiliere({...newFiliere, name: e.target.value})}
                  placeholder="Ex: Développement Digital" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Statut initial</label>
                <select 
                  value={newFiliere.status}
                  onChange={(e) => setNewFiliere({...newFiliere, status: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Archivée">Archivée</option>
                </select>
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
                Créer la filière
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
                Voulez-vous vraiment supprimer la filière <br/>
                <span className="text-white font-semibold">"{itemToDelete?.name}"</span> ? <br/>
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

export default FiliereManagement;
