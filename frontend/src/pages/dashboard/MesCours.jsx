import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Send, MessageSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './MesCours.css';

const MesCours = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCours, setSelectedCours] = useState(null);
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
                // Update the selected course's commentaires in-place
                const updatedComment = res.data.data;
                setSelectedCours(prev => ({
                    ...prev,
                    commentaires: [...(prev.commentaires || []), updatedComment]
                }));
                // Also update the main courses array
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

    if (loading) return (
        <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            Chargement des cours...
        </div>
    );


    // Modal détail cours
    if (selectedCours) return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <div style={{
                background: '#0f172a', border: '1px solid rgba(34,211,238,0.3)',
                borderRadius: '16px', padding: '32px', maxWidth: '700px', width: '100%',
                maxHeight: '80vh', overflowY: 'auto'
            }}>
                <button onClick={() => setSelectedCours(null)} style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px'
                }}>
                    ← Retour
                </button>

                <h2 style={{ color: 'cyan', marginBottom: '8px' }}>
                    {selectedCours.titre}
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                    {selectedCours.formateur
                        ? `${selectedCours.formateur.prenom} ${selectedCours.formateur.name}`
                        : 'Formateur non spécifié'}
                </p>

                <p style={{ color: 'white', marginBottom: '24px' }}>
                    {selectedCours.description || 'Aucune description disponible.'}
                </p>

                {/* Fichiers */}
                <h3 style={{ color: 'white', marginBottom: '12px' }}>📎 Fichiers du cours</h3>
                {selectedCours.fichiers && selectedCours.fichiers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                        {selectedCours.fichiers.map((f, i) => (
                            <a key={f.id || i}
                                href={f.url || `http://127.0.0.1:8000/storage/${f.chemin}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
                                    borderRadius: '8px', padding: '12px', color: 'cyan', textDecoration: 'none'
                                }}
                            >
                                {f.type === 'pdf' ? '📄' : f.type === 'video' ? '🎥' : '🔗'} {f.nom || f.url || 'Fichier'}
                            </a>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Aucun fichier disponible pour ce cours.</p>
                )}

                {/* Commentaires */}
                <h3 style={{ color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} /> Commentaires ({selectedCours.commentaires?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {selectedCours.commentaires && selectedCours.commentaires.length > 0 ? (
                        selectedCours.commentaires.map((c, i) => (
                            <div key={c.id || i} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '12px'
                            }}>
                                <div style={{ color: 'cyan', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                                    {c.user ? `${c.user.prenom} ${c.user.name}` : 'Utilisateur'}
                                </div>
                                <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{c.contenu}</div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Aucun commentaire pour le moment.</p>
                    )}
                </div>

                {/* Add comment */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Écrire un commentaire..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        style={{
                            flex: 1, padding: '10px 14px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white', fontSize: '13px', outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={sendingComment || !newComment.trim()}
                        style={{
                            padding: '10px 16px', borderRadius: '8px',
                            background: sendingComment ? '#334155' : 'cyan', border: 'none',
                            color: '#0f172a', cursor: sendingComment ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        <Send size={14} /> Envoyer
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="courses-container">
            {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {courses.length === 0 && (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Aucun cours disponible</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Les cours assignés à votre filière et groupe apparaîtront ici.</p>
                </div>
            )}
            <div className="courses-grid">
                {courses.map((course) => (
                    <div key={course.id} className="module-card">
                        <div className="card-glitch-effect"></div>
                        <div className="card-inner">
                            <div className="module-header">
                                <div className="module-icon-box">
                                    <span className="module-emoji">
                                        {course.image || getEmoji(course.category)}
                                    </span>
                                </div>
                                <span className="category-tag">
                                    {course.filiere?.nom || course.category || 'Cours'}
                                </span>
                            </div>

                            <div className="module-body">
                                <h3>{course.titre}</h3>
                                <div className="teacher-info">
                                    <User size={14} />
                                    <span>
                                        {course.formateur
                                            ? `${course.formateur.prenom} ${course.formateur.name}`
                                            : 'Formateur'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
                                    <span>📎 {course.fichiers?.length || 0} fichiers</span>
                                    <span>💬 {course.commentaires?.length || 0} commentaires</span>
                                </div>
                            </div>

                            <div className="module-footer">
                                <button
                                    className="enter-course-btn"
                                    onClick={() => setSelectedCours(course)}
                                >
                                    <span>ACCÉDER AU MODULE</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MesCours;