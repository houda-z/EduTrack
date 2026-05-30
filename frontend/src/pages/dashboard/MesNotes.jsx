import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Award, Target, Info } from 'lucide-react';
import api from '../../services/api';
import './MesNotes.css';

const MesNotes = () => {
    const [examNotes, setExamNotes] = useState([]);
    const [manualNotes, setManualNotes] = useState([]);
    const [moyenne, setMoyenne] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                setError('Données utilisateur non disponibles');
                setExamNotes([]);
                setManualNotes([]);
                setLoading(false);
                return;
            }

            const response = await api.get(`/notes/etudiant/${user.id}`);
            if (response.data && response.data.success && response.data.data) {
                const data = response.data.data;
                if (Array.isArray(data)) {
                    setExamNotes([]);
                    setManualNotes(data);
                    setMoyenne(user.moyenne ?? 0);
                } else {
                    setExamNotes(data.exam_notes || []);
                    setManualNotes(data.manual_notes || []);
                    setMoyenne(data.moyenne || 0);
                }
            } else {
                setExamNotes([]);
                setManualNotes([]);
                setMoyenne(0);
            }
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError('Erreur lors du chargement des notes');
            setExamNotes([]);
            setManualNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                Chargement de vos notes...
            </div>
        );
    }

    return (
        <div className="grades-container">
            {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div className="summary-section">
                <div className="average-card glass-glow">
                    <div className="avg-header">
                        <Award size={30} className="text-purple" />
                        <span>Moyenne Générale</span>
                    </div>
                    <div className="avg-value">{moyenne.toFixed(2)}</div>
                    <div className="avg-rank">Calcul basé sur vos évaluations</div>
                </div>

                <div className="stats-mini-grid">
                    <div className="mini-stat glass-glow">
                        <Target className="text-cyan" />
                        <div>
                            <span className="label">Évaluations</span>
                            <span className="value">{examNotes.length + manualNotes.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {examNotes.length + manualNotes.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Aucune note disponible</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Vos notes apparaîtront ici une fois évaluées.</p>
                </div>
            ) : (
                <>
                    <div className="notes-section glass-glow">
                        <h3 className="section-title">Notes des Examens</h3>
                        {examNotes.length === 0 ? (
                            <p className="empty">Aucune note d'examen disponible.</p>
                        ) : examNotes.map((note, i) => (
                            <div key={i} className="note-card">
                                <div className="note-info">
                                    <span className="note-titre">{note.examen_titre}</span>
                                    <span className="note-date">{formatDate(note.created_at)}</span>
                                </div>
                                <div className="note-score">
                                    <span className={note.note >= note.total_points * 0.5 ? 'score-good' : 'score-bad'}>
                                        {note.note} / {note.total_points}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="notes-section glass-glow">
                        <h3 className="section-title">Notes Manuelles</h3>
                        {manualNotes.length === 0 ? (
                            <p className="empty">Aucune note manuelle.</p>
                        ) : manualNotes.map((note, i) => (
                            <div key={i} className="note-card">
                                <div className="note-info">
                                    <span className="note-titre">{note.examen_titre || note.cours_titre || 'Note'}</span>
                                    {note.commentaire && <span className="note-comment">{note.commentaire}</span>}
                                </div>
                                <div className="note-score">
                                    <span className="score-good">{note.note} / 20</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="info-box-cyber">
                <Info size={18} />
                <p>Les notes sont mises à jour en temps réel après évaluation par les formateurs.</p>
            </div>
        </div>
    );
};

export default MesNotes;
