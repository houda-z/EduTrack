import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './MesNotes.css';

const MesNotes = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        moyenneGenerale: 0,
        modulesValides: 0,
        examensRestants: 0
    });

    useEffect(() => {
        const fetchGrades = async () => {
            setLoading(true);
            setError(null);
            try {
                // Endpoint placeholder based on user requirement
                const response = await api.get('/student/grades');

                if (response.data && response.data.success) {
                    const fetchedGrades = response.data.data;
                    setGrades(fetchedGrades);

                    // Calculate quick stats
                    const totalMoyenne = fetchedGrades.length > 0
                        ? fetchedGrades.reduce((acc, curr) => acc + (curr.moyenne || 0), 0) / fetchedGrades.length
                        : 0;

                    const valides = fetchedGrades.filter(g => g.statut === 'Validé').length;
                    const restants = fetchedGrades.filter(g => g.statut === 'En cours').length;

                    setStats({
                        moyenneGenerale: totalMoyenne,
                        modulesValides: valides,
                        examensRestants: restants
                    });
                } else {
                    setGrades([]);
                }
            } catch (err) {
                console.error('Failed to fetch grades:', err);
                setError('Impossible de récupérer vos notes. Veuillez réessayer plus tard.');
                // Fallback for demonstration if API is not ready (optional, but keeping it clean as per requirement)
                setGrades([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="premium-spinner"></div>
                <p style={{ marginTop: '20px', color: '#94a3b8', fontWeight: '500' }}>Analyse de vos performances...</p>
            </div>
        );
    }

    return (
        <div className="notes-dashboard">
            {error && (
                <div className="error-alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Metrics Row */}
            <div className="metrics-row">
                <div className="metric-card">
                    <div className="metric-icon">
                        <Award size={24} />
                    </div>
                    <span className="metric-label">Moyenne Générale</span>
                    <span className="metric-value">{stats.moyenneGenerale.toFixed(2)}</span>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <BookOpen size={24} />
                    </div>
                    <span className="metric-label">Modules Validés</span>
                    <span className="metric-value">{stats.modulesValides}</span>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Clock size={24} />
                    </div>
                    <span className="metric-label">Examens Restants</span>
                    <span className="metric-value">{stats.examensRestants}</span>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="grades-table-container">
                <div className="table-header">
                    <h2 className="table-title">Détail des Évaluations</h2>
                    <span className="secondary-text">Dernière mise à jour: Aujourd'hui</span>
                </div>

                {grades.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                        <p>Aucune donnée de notation disponible pour le moment.</p>
                    </div>
                ) : (
                    <table className="custom-grades-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Formateur</th>
                                <th>Contrôle</th>
                                <th>Examen</th>
                                <th>Moyenne</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade, index) => (
                                <tr key={index} className="grade-row">
                                    <td>
                                        <div style={{ fontWeight: '800', color: '#fff' }}>
                                            {typeof grade.module === 'object' && grade.module?.nom ? grade.module.nom : grade.module}
                                        </div>
                                        <div className="secondary-text">Semestre 1</div>
                                    </td>
                                    <td>
                                        {typeof grade.formateur === 'object' && grade.formateur?.name
                                            ? grade.formateur.name
                                            : (typeof grade.formateur === 'object' && grade.formateur?.prenom
                                                ? `${grade.formateur.prenom} ${grade.formateur.name || ''}`
                                                : grade.formateur)}
                                    </td>
                                    <td>
                                        <span className="score-text">{grade.controle ?? '--'}</span>
                                        <span className="secondary-text">/20</span>
                                    </td>
                                    <td>
                                        <span className="score-text">{grade.examen ?? '--'}</span>
                                        <span className="secondary-text">/20</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '900', color: '#fff', fontSize: '1.2rem' }}>
                                            {grade.moyenne ? grade.moyenne.toFixed(2) : '--'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${grade.statut === 'Validé' ? 'badge-valide' : 'badge-encours'}`}>
                                            {grade.statut}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MesNotes;
