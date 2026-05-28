import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Send, MessageSquare, FileText, Video, Link as LinkIcon, Download, ExternalLink, X, Eye } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './MesCours.css';

/** URL du serveur Laravel (sans /api) — ex. http://127.0.0.1:8000 */
const getBackendBaseUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Construit l'URL de téléchargement pour l'espace étudiant.
 * Fichiers stockés : {base}/storage/cours/{coursId}/{nom}?download=1
 * ou {base}/storage/{chemin relatif}?download=1
 */
const getStudentDownloadUrl = (file, coursId) => {
    if (!file || !coursId) return null;

    const base = getBackendBaseUrl();

    if (file.chemin && (file.chemin.startsWith('http://') || file.chemin.startsWith('https://'))) {
        return file.chemin;
    }

    const filename = file.nom || (file.chemin ? file.chemin.split('/').pop() : null);
    if (filename) {
        let url = `${base}/storage/cours/${coursId}/${encodeURIComponent(filename)}?download=1`;
        if (file.id) {
            url += `&fichier_id=${file.id}`;
        }
        return url;
    }

    if (file.chemin) {
        const relativePath = file.chemin.replace(/^public\//, '');
        let url = `${base}/storage/${relativePath}?download=1`;
        if (file.id) {
            url += `&fichier_id=${file.id}`;
        }
        return url;
    }

    return null;
};

/**
 * Téléchargement direct sur le PC (sans nouvel onglet).
 * Priorité : API authentifiée (fiable) puis lien Laravel ?download=1
 */
const triggerStudentDownload = async (file, coursId, event) => {
    event?.preventDefault();

    const filename = getStudentDownloadFilename(file);

    if (file?.id && coursId) {
        try {
            const response = await api.get(`/cours/${coursId}/fichiers/${file.id}/download`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            return;
        } catch (err) {
            console.warn('Téléchargement API échoué, repli sur URL directe:', err);
        }
    }

    const directUrl = getStudentDownloadUrl(file, coursId);
    if (!directUrl) {
        alert('Impossible de télécharger ce fichier : URL introuvable.');
        return;
    }

    const link = document.createElement('a');
    link.href = directUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/** URL d'affichage (PDF dans un nouvel onglet, sans forcer le téléchargement) */
const getStudentViewUrl = (file, coursId) => {
    if (!file || !coursId) return null;

    const base = getBackendBaseUrl();

    if (file.chemin && (file.chemin.startsWith('http://') || file.chemin.startsWith('https://'))) {
        return file.chemin;
    }

    const filename = file.nom || (file.chemin ? file.chemin.split('/').pop() : null);
    if (filename) {
        return `${base}/storage/cours/${coursId}/${encodeURIComponent(filename)}`;
    }

    if (file.chemin) {
        const relativePath = file.chemin.replace(/^public\//, '');
        return `${base}/storage/${relativePath}`;
    }

    return null;
};

const getStudentDownloadFilename = (file) =>
    file?.nom || (file?.chemin ? file.chemin.split('/').pop() : 'fichier');

const MesCours = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCours, setSelectedCours] = useState(null);
    const [selectedModuleGroup, setSelectedModuleGroup] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);

    const { nom } = useParams();

    const fetchCours = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/cours');
            if (response.data && response.data.success && response.data.data.length > 0) {
                setCourses(response.data.data);
            } else {
                setCourses([]);
            }
        } catch (err) {
            console.error('API cours fetch error:', err);
            setError('Erreur lors du chargement des cours');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCours();
    }, []);

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedCours) return;
        setSendingComment(true);
        try {
            const res = await api.post(`/cours/${selectedCours.id}/commentaires`, {
                contenu: newComment.trim()
            });
            if (res.data && res.data.success) {
                const updatedComment = res.data.data;
                setSelectedCours(prev => ({
                    ...prev,
                    commentaires: [...(prev.commentaires || []), updatedComment]
                }));
                setCourses(prev => prev.map(c =>
                    c.id === selectedCours.id
                        ? { ...c, commentaires: [...(c.commentaires || []), updatedComment] }
                        : c
                ));
                setNewComment('');
            }
        } catch (err) {
            console.warn('Comment post error:', err);
            alert('Erreur lors de l\'envoi du commentaire.');
        } finally {
            setSendingComment(false);
        }
    };

    const getEmoji = (category) => {
        const emojis = { Frontend: '⚛️', Backend: '🐘', Database: '💾', Design: '🎨' };
        return emojis[category] || '📚';
    };

    const getInitials = (user) => {
        if (!user) return 'U';
        return `${user.prenom?.charAt(0) || ''}${user.name?.charAt(0) || ''}`.toUpperCase() || 'U';
    };



    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-[#94a3b8] font-sans">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            Chargement des cours...
        </div>
    );

    // Modal détail cours
    if (selectedCours) return (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 font-sans">
            <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(34,211,238,0.15)] flex flex-col relative custom-scrollbar">

                {/* Close Button Top Right */}
                <button
                    onClick={() => setSelectedCours(null)}
                    className="absolute top-6 right-6 text-[#94a3b8] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 pr-12">
                    <button
                        onClick={() => setSelectedCours(null)}
                        className="text-[#94a3b8] hover:text-cyan-400 flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
                    >
                        <ArrowRight size={16} className="rotate-180" /> Retour aux cours
                    </button>

                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                        {selectedCours.titre}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {getInitials(selectedCours.formateur)}
                        </div>
                        <p className="text-[#94a3b8] font-medium text-sm">
                            {selectedCours.formateur
                                ? `${selectedCours.formateur.prenom} ${selectedCours.formateur.name}`
                                : 'Formateur non spécifié'}
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-slate-200 text-sm leading-relaxed backdrop-blur-sm">
                    {selectedCours.description || 'Aucune description disponible.'}
                </div>

                {/* Fichiers */}
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-cyan-400" /> Fichiers du cours
                </h3>

                {selectedCours.fichiers && selectedCours.fichiers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {selectedCours.fichiers.map((f, i) => {
                            const isPdf = f.type === 'pdf' || (f.nom && f.nom.toLowerCase().endsWith('.pdf')) || (f.url && f.url.toLowerCase().includes('.pdf'));
                            const isVideo = f.type === 'video';
                            const viewUrl = getStudentViewUrl(f, selectedCours.id);
                            const downloadUrl = getStudentDownloadUrl(f, selectedCours.id);
                            const downloadName = getStudentDownloadFilename(f);
                            const showPreview = isPdf && viewUrl;

                            return (
                                <div key={f.id || i} className="group bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/10 shadow-sm">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-500/20 text-red-400' : isVideo ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                        {isPdf ? <FileText size={20} /> : isVideo ? <Video size={20} /> : <LinkIcon size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                                            {f.nom || 'Document'}
                                        </p>
                                        <p className="text-xs text-[#94a3b8] uppercase tracking-wider mt-0.5">{f.type || 'Fichier'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {showPreview && (
                                            <a
                                                href={viewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-[#94a3b8] hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors inline-flex"
                                                title="Ouvrir le PDF dans un nouvel onglet"
                                            >
                                                <Eye size={18} />
                                            </a>
                                        )}
                                        {(downloadUrl || (f.id && selectedCours.id)) ? (
                                            <a
                                                href={downloadUrl || '#'}
                                                download={downloadName}
                                                onClick={(e) => triggerStudentDownload(f, selectedCours.id, e)}
                                                className="p-2 text-[#94a3b8] hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors inline-flex cursor-pointer"
                                                title={`Télécharger ${downloadName}`}
                                            >
                                                <Download size={18} />
                                            </a>
                                        ) : (
                                            !showPreview && viewUrl && (
                                                <a
                                                    href={viewUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-[#94a3b8] hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors inline-flex"
                                                    title="Ouvrir le lien"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center text-[#94a3b8] text-sm mb-8 flex flex-col items-center justify-center gap-3">
                        <FileText size={32} className="text-white/20" />
                        <span>Aucun fichier disponible pour ce cours.</span>
                    </div>
                )}

                {/* Commentaires */}
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-indigo-400" /> Espace Discussion ({selectedCours.commentaires?.length || 0})
                </h3>

                <div className="flex-1 mb-6 space-y-4 pr-1">
                    {selectedCours.commentaires && selectedCours.commentaires.length > 0 ? (
                        selectedCours.commentaires.map((c, i) => (
                            <div key={c.id || i} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm mt-1">
                                    {getInitials(c.user)}
                                </div>
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 group-hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <div className="text-cyan-400 text-sm font-bold">
                                            {c.user ? `${c.user.prenom} ${c.user.name}` : 'Utilisateur'}
                                        </div>
                                    </div>
                                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{c.contenu}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl text-[#94a3b8] text-sm">
                            Soyez le premier à lancer la discussion !
                        </div>
                    )}
                </div>

                {/* Add comment input */}
                <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex gap-3 relative">
                        <input
                            type="text"
                            placeholder="Écrire un commentaire..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            className="flex-1 px-5 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-[#94a3b8]"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={sendingComment || !newComment.trim()}
                            className={`px-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${sendingComment || !newComment.trim()
                                    ? 'bg-white/5 text-[#94a3b8] cursor-not-allowed border border-white/5'
                                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                }`}
                        >
                            <Send size={16} className={sendingComment ? 'animate-pulse' : ''} />
                            <span className="hidden sm:inline">{sendingComment ? 'Envoi...' : 'Envoyer'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full min-h-screen p-6 font-sans">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {error}
                </div>
            )}

            {courses.length === 0 && !loading && !error && (
                <div className="text-center py-20 text-[#94a3b8] bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} className="text-cyan-500/50" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Aucun cours disponible</p>
                    <p className="text-sm max-w-md mx-auto">Les cours assignés à votre filière et groupe apparaîtront ici quand ils seront disponibles.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="group relative bg-[#1e293b]/50 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden hover:bg-[#1e293b]/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] flex flex-col"
                    >
                        {/* Soft Top Glow overlay */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="p-6 flex-1 flex flex-col relative z-10">
                            <div className="flex justify-between items-start mb-5">
                                <div className="w-12 h-12 bg-black/20 border border-white/10 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    {course.image || getEmoji(course.category)}
                                </div>
                                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase tracking-wider font-bold rounded-full">
                                    {course.filiere?.nom || course.category || 'Cours'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                {course.titre}
                            </h3>

                            <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                    {getInitials(course.formateur)}
                                </div>
                                <span className="truncate">
                                    {course.formateur
                                        ? `${course.formateur.prenom} ${course.formateur.name}`
                                        : 'Formateur'}
                                </span>
                            </div>

                            <div className="flex gap-4 mt-auto pt-4 border-t border-white/10 text-xs text-[#94a3b8] font-medium">
                                <span className="flex items-center gap-1.5"><FileText size={14} className="text-cyan-400/70" /> {course.fichiers?.length || 0} fichiers</span>
                                <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-indigo-400/70" /> {course.commentaires?.length || 0} commentaires</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border-t border-white/5 relative z-10 transition-colors group-hover:bg-cyan-500/10">
                            <button
                                className="w-full p-4 flex items-center justify-center gap-2 text-sm font-bold text-white group/btn"
                                onClick={() => setSelectedCours(course)}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 group-hover/btn:from-cyan-300 group-hover/btn:to-indigo-300">ACCÉDER AU MODULE</span>
                                <ArrowRight size={16} className="text-indigo-400 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MesCours;