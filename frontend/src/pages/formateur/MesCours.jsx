import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Trash2,
  Edit3,
  FileText,
  Users,
  PlusCircle,
  Calendar,
  X,
  Plus,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const MesCours = () => {
  const [courses, setCourses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isAnswersModalOpen, setIsAnswersModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [linkNom, setLinkNom] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState('pdf');

  // Course Edit Form State
  const [editTitre, setEditTitre] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFiliereId, setEditFiliereId] = useState('');
  const [editGroupeId, setEditGroupeId] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cours');
      if (res.data && res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.warn("API Error, loading mock courses:", err);
      setError("Connexion API impossible. Affichage des données fictives.");
      setCourses([
        {
          id: 1,
          titre: "React Hooks & Functional Components",
          description: "Maîtriser useState, useEffect et les hooks personnalisés.",
          created_at: "2026-05-23T14:30:00",
          filiere_id: 1,
          groupe_id: 1,
          filiere: { nom: "Développement Digital" },
          groupe: { nom: "DEV-101" },
          fichiers: [
            { id: 1, nom: "Cours_Hooks.pdf", type: "pdf", url: "#" },
            { id: 2, nom: "Video_Demo.mp4", type: "video", url: "#" }
          ],
          commentaires: [
            { id: 1, contenu: "Super cours !", user: { name: "Benjelloun", prenom: "Mehdi" } }
          ]
        },
        {
          id: 2,
          titre: "Docker & Containerisation Basics",
          description: "Apprendre à packager des applications web.",
          created_at: "2026-05-20T10:00:00",
          filiere_id: 1,
          groupe_id: 2,
          filiere: { nom: "Développement Digital" },
          groupe: { nom: "DEV-102" },
          fichiers: [
            { id: 3, nom: "Docker_Guide.pdf", type: "pdf", url: "#" }
          ],
          commentaires: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const filRes = await api.get('/filieres');
      setFilieres(filRes.data || []);
      const grpRes = await api.get('/groupes');
      setGroupes(grpRes.data.data || []);
    } catch (err) {
      console.warn("Failed to fetch filieres/groupes for edit dropdowns:", err);
      // Fictional metadata
      setFilieres([
        { id: 1, nom: "Développement Digital" },
        { id: 2, nom: "Systèmes d'Information" }
      ]);
      setGroupes([
        { id: 1, nom: "DEV-101", filiere_id: 1 },
        { id: 2, nom: "DEV-102", filiere_id: 1 },
        { id: 3, nom: "SI-201", filiere_id: 2 }
      ]);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchMetadata();
  }, []);

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action supprimera tous les fichiers associés.")) return;
    try {
      await api.delete(`/cours/${id}`);
      fetchCourses();
    } catch (err) {
      alert("Erreur lors de la suppression du cours.");
    }
  };

  // Student Responses Modal
  const handleOpenAnswersModal = async (course) => {
    setSelectedCourse(course);
    setIsAnswersModalOpen(true);
    setLoadingComments(true);
    setActiveReplyId(null);
    setReplyTexts({});
    try {
      const res = await api.get(`/cours/${course.id}/commentaires`);
      if (res.data && res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.warn("Error fetching course comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchComments = async (courseId) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/cours/${courseId}/commentaires`);
      if (res.data && res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.warn("Error refreshing comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostReply = async (comment) => {
    const currentText = replyTexts[comment.id] || '';
    if (!currentText.trim()) return;

    const content = `@${comment.user.prenom} ${comment.user.name}: ${currentText.trim()}`;
    try {
      const res = await api.post(`/cours/${selectedCourse.id}/commentaires`, { contenu: content });
      if (res.data && res.data.success) {
        setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
        setActiveReplyId(null);
        await fetchComments(selectedCourse.id);
      }
    } catch (err) {
      console.warn('Error posting reply:', err);
      alert('Impossible d\'envoyer la réponse. Réessayez.');
    }
  };

  const handleReplyTextChange = (commentId, value) => {
    setReplyTexts(prev => ({ ...prev, [commentId]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCurrentUserId = () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored).id : null;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // Edit Course Modal
  const handleOpenEditModal = (course) => {
    setSelectedCourse(course);
    setEditTitre(course.titre);
    setEditDesc(course.description || '');
    setEditFiliereId(course.filiere_id);
    setEditGroupeId(course.groupe_id || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editTitre || !editFiliereId) {
      alert("Le titre et la filière sont requis.");
      return;
    }

    try {
      const res = await api.put(`/cours/${selectedCourse.id}`, {
        titre: editTitre,
        description: editDesc,
        filiere_id: editFiliereId,
        groupe_id: editGroupeId || null
      });

      if (res.data && res.data.success) {
        setIsEditModalOpen(false);
        fetchCourses();
      }
    } catch (err) {
      console.warn("API Error updating course, falling back to updating mock local state:", err);
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? {
        ...c,
        titre: editTitre,
        description: editDesc,
        filiere_id: editFiliereId,
        groupe_id: editGroupeId || null,
        filiere: filieres.find(f => f.id === parseInt(editFiliereId)) || c.filiere,
        groupe: groupes.find(g => g.id === parseInt(editGroupeId)) || null
      } : c));
      setIsEditModalOpen(false);
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('fichier', uploadFile);

    try {
      await api.post(`/cours/${selectedCourse.id}/fichiers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Fichier importé avec succès !");
      setUploadFile(null);

      // reload
      fetchCourses();
      // reload responses modal details
      const fresh = courses.find(c => c.id === selectedCourse.id);
      if (fresh) setSelectedCourse(fresh);
    } catch (err) {
      console.warn("Upload error, adding to local mock:");
      const mockFichier = {
        id: Math.floor(Math.random() * 1000),
        nom: uploadFile.name,
        type: uploadFile.name.endsWith('.pdf') ? 'pdf' : 'lien',
        url: '#'
      };
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? {
        ...c,
        fichiers: [...(c.fichiers || []), mockFichier]
      } : c));
      setUploadFile(null);
      alert("Fichier importé (simulation locale).");
    }
  };

  // Video Link Add
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkNom || !linkUrl) {
      alert("Le nom et l'URL sont requis.");
      return;
    }

    try {
      await api.post(`/cours/${selectedCourse.id}/fichiers`, {
        nom: linkNom,
        url: linkUrl,
        type: linkType
      });
      setLinkNom('');
      setLinkUrl('');
      fetchCourses();
    } catch (err) {
      const mockLink = {
        id: Math.floor(Math.random() * 1000),
        nom: linkNom,
        type: linkType,
        url: linkUrl
      };
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? {
        ...c,
        fichiers: [...(c.fichiers || []), mockLink]
      } : c));
      setLinkNom('');
      setLinkUrl('');
      alert("Lien vidéo/ressource ajouté (simulation locale).");
    }
  };

  const handleDeleteFile = async (courseId, fileId) => {
    if (!window.confirm("Voulez-vous supprimer cette ressource ?")) return;
    try {
      await api.delete(`/cours/${courseId}/fichiers/${fileId}`);
      fetchCourses();
    } catch (err) {
      setCourses(prev => prev.map(c => c.id === courseId ? {
        ...c,
        fichiers: c.fichiers.filter(f => f.id !== fileId)
      } : c));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">MES COURS</h2>
          <p className="text-slate-400 text-sm mt-1">Gérez vos supports pédagogiques, vidéos et notes de cours.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest">Chargement des cours...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-2xl bg-white/2">
              <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
              Aucun cours publié. Cliquez sur "Créer un Cours" dans la barre latérale pour en poster un.
            </div>
          ) : (
            courses.map(course => (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Category/Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {course.filiere ? course.filiere.nom : 'Filière'}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {course.groupe ? course.groupe.nom : 'Tous les groupes'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base md:text-lg font-black text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">{course.titre}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-6 font-semibold">{course.description || 'Aucune description fournie.'}</p>

                  {/* Resource badges summary */}
                  <div className="flex items-center gap-4 text-[11px] font-extrabold text-slate-400 mb-6 bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="flex items-center gap-1.5"><FileText size={14} className="text-cyan-400" /> {course.fichiers ? course.fichiers.length : 0} fichiers</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-indigo-400" /> {course.commentaires ? course.commentaires.length : 0} commentaires</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleOpenAnswersModal(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-cyan-300 transition-all"
                  >
                    <Users size={14} />
                    Suivi & Notes
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 transition-all"
                      title="Modifier le cours"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-300 transition-all"
                      title="Supprimer le cours"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: FOLLOW UP & GRADING (SUIVI ET NOTES) */}
      {isAnswersModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div>
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">Suivi Étudiant</span>
                <h3 className="text-lg md:text-xl font-black text-white line-clamp-1">{selectedCourse.titre}</h3>
              </div>
              <button
                onClick={() => setIsAnswersModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Resources manager sub-section */}
            <div className="mb-8 p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <h4 className="font-extrabold text-[12.5px] uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText size={16} className="text-cyan-400" />
                Gérer les fichiers & ressources
              </h4>

              {/* Files Upload & Link Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Drag-drop upload */}
                <form onSubmit={handleFileUpload} className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Importer un fichier PDF</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="flex-1 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/5 file:text-cyan-300 hover:file:bg-white/10 file:cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={!uploadFile}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-xs font-bold transition-all text-slate-900"
                    >
                      Importer
                    </button>
                  </div>
                </form>

                {/* Add Video Link */}
                <form onSubmit={handleAddLink} className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Ajouter un lien vidéo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom du lien..."
                      value={linkNom}
                      onChange={(e) => setLinkNom(e.target.value)}
                      className="w-1/3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="URL (YouTube/Vimeo)..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                    />
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                    >
                      <option value="video">Vidéo</option>
                      <option value="lien">Autre Lien</option>
                    </select>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* List of current files */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.fichiers && selectedCourse.fichiers.map(file => (
                    <div key={file.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[11.5px] font-bold">
                      <FileText size={12} className="text-cyan-400" />
                      <span className="text-slate-300 line-clamp-1 max-w-[150px]">{file.nom}</span>
                      <button
                        onClick={() => handleDeleteFile(selectedCourse.id, file.id)}
                        className="text-red-400 hover:text-red-300 p-0.5 rounded transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Students list & grades */}
            <h4 className="font-extrabold text-[12.5px] uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
              <Users size={16} className="text-indigo-400" />
              Accès étudiants & notations
            </h4>

            {loadingComments ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                {comments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-bold">Aucun commentaire étudiant pour ce cours pour le moment.</div>
                ) : (
                  comments.map(comment => {
                    const isTeacherComment = comment.user && (comment.user.role === 'enseignant' || comment.user.role === 'formateur' || comment.user.id === currentUserId);
                    return (
                      <div key={comment.id} className={`p-4 rounded-2xl border ${isTeacherComment ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-white/5 border-white/10'} transition-all`}>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-black text-cyan-300 uppercase">
                              {comment.user?.prenom ? comment.user.prenom[0] : comment.user?.name ? comment.user.name[0] : 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{comment.user?.prenom} {comment.user?.name}</div>
                              <div className="text-[11px] text-slate-500">{formatDate(comment.created_at)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveReplyId(comment.id === activeReplyId ? null : comment.id)}
                            className="px-3 py-1 rounded-full text-[11px] font-bold border border-white/10 bg-white/5 text-cyan-300 hover:bg-cyan-500/10 transition-all"
                          >
                            Répondre
                          </button>
                        </div>
                        <p className="text-sm text-slate-200 leading-6 mb-3">{comment.contenu}</p>
                        {activeReplyId === comment.id && (
                          <div className="space-y-3 mt-3">
                            <textarea
                              rows="3"
                              value={replyTexts[comment.id] || ''}
                              onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500"
                              placeholder={`Répondre à ${comment.user.prenom}...`}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => handlePostReply(comment)}
                                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-900 transition-all"
                              >
                                Envoyer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COURSE */}
      {isEditModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpdateCourse}
            className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-lg font-black text-white">Modifier le Cours</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Titre du cours</label>
              <input
                type="text"
                required
                value={editTitre}
                onChange={(e) => setEditTitre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea
                rows="3"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              />
            </div>

            {/* Filière & Groupe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filière</label>
                <select
                  required
                  value={editFiliereId}
                  onChange={(e) => setEditFiliereId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="">Sélectionnez...</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Groupe (Optionnel)</label>
                <select
                  value={editGroupeId}
                  onChange={(e) => setEditGroupeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="">Tous les groupes</option>
                  {groupes.filter(g => g.filiere_id === parseInt(editFiliereId)).map(g => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default MesCours;
