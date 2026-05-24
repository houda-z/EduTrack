import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Award, Target, Info } from 'lucide-react';
import api from '../../services/api';
import './MesNotes.css';

const MesNotes = () => {
    const [notes, setNotes] = useState([]);
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
                setNotes([]);
                setLoading(false);
                return;
            }

            const response = await api.get(`/notes/etudiant/${user.id}`);
            if (response.data && response.data.success && response.data.data) {
                setNotes(response.data.data);
            } else {
                setNotes([]);
            }

            // Get moyenne from localStorage
            if (user.moyenne !== undefined) {
                setMoyenne(user.moyenne);
            }
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError('Erreur lors du chargement des notes');
            setNotes([]);
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
                            <span className="value">{notes.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {notes.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Aucune note disponible</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Vos notes apparaîtront ici une fois évaluées.</p>
                </div>
            ) : (
                <div className="grades-table-container glass-glow">
                    <div className="table-header">
                        <div className="table-title">
                            <FileText size={20} />
                            <h3>Détail des Résultats</h3>
                        </div>
                        <div className="semester-badge">Résultats</div>
                    </div>

                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>Sujet</th>
                                <th>Note /20</th>
                                <th>Commentaire</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notes.map((note) => (
                                <tr key={note.id}>
                                    <td className="module-name">
                                        {note.examen?.titre || note.cours?.titre || 'Évaluation'}
                                    </td>
                                    <td className="grade-value pass">{note.note}</td>
                                    <td className="comment">{note.commentaire || '-'}</td>
                                    <td>{formatDate(note.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="info-box-cyber">
                <Info size={18} />
                <p>Les notes sont mises à jour en temps réel après évaluation par les formateurs.</p>
            </div>
        </div>
    );
};

export default MesNotes;
