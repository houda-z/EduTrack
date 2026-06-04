import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    HelpCircle,
    Award,
    ArrowRight,
    AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Examens.css';

const Examens = () => {
    const { nom } = useParams();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExamens();
    }, []);

    const fetchExamens = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/examens');
            if (response.data && response.data.success && response.data.data) {
                setExams(response.data.data);
            } else {
                setExams([]);
            }
        } catch (err) {
            console.error('Error fetching examens:', err);
            setError('Erreur lors du chargement des examens');
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date non disponible';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'publie':
                return <span className="exam-badge badge-cyan">PUBLIÉ</span>;
            case 'brouillon':
                return <span className="exam-badge badge-closed">BROUILLON</span>;
            case 'termine':
                return <span className="exam-badge badge-urgent">TERMINÉ</span>;
            default:
                return <span className="exam-badge badge-closed">{status?.toUpperCase() || 'INCONNU'}</span>;
        }
    };

    if (loading) {
        return (
            <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                Chargement des examens...
            </div>
        );
    }

    return (
        <div className="exam-list-view">
            <header className="view-header">
                <div className="title-area">
                    <h1>SESSIONS D' <span className="text-gradient">EXAMENS</span></h1>
                    <p>Accédez à vos épreuves sécurisées et suivez vos résultats.</p>
                </div>
                <div className="security-status-indicator glass-glow">
                    <ShieldAlert size={18} className="text-cyan animation-pulse" />
                    <span>SYSTÈME ANTI-TRICHE ACTIF</span>
                </div>
            </header>

            {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {exams.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Aucun examen disponible</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Les examens assignés à votre filière et groupe apparaîtront ici.</p>
                </div>
            ) : (
                <div className="exam-grid-premium">
                    {exams.map((exam) => (
                        <div key={exam.id} className={`exam-card-sci glass-glow`}>
                            {/* Background Effect */}
                            <div className="card-flare"></div>

                            <div className="card-top">
                                {getStatusBadge(exam.statut)}
                            </div>

                            <div className="card-body">
                                <h3 className="exam-title">{exam.titre}</h3>
                                <p className="course-subtitle">{exam.groupe?.nom || 'Groupe'} - {exam.filiere?.nom || 'Filière'}</p>

                                <div className="exam-stats-row">
                                    <div className="stat-item">
                                        <Clock size={16} />
                                        <span>{exam.duree_minutes} min</span>
                                    </div>
                                    <div className="stat-item">
                                        <HelpCircle size={16} />
                                        <span>{exam.questions?.length || 0} Qs</span>
                                    </div>
                                </div>

                                <div className="exam-date-box">
                                    <Calendar size={14} />
                                    <span>{formatDate(exam.date_examen)}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                {exam.statut === 'publie' ? (
                                    <button
                                        className="btn-exam-action btn-cyan"
                                        onClick={() => navigate(`/etudiant/${nom}/en-ligne/${exam.id}`, { state: { examId: exam.id, examTitre: exam.titre, examDuree: exam.duree_minutes } })}
                                    >
                                        COMMENCER L'EXAMEN
                                        <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '8px' }}>
                                        {exam.statut === 'brouillon' && 'Examen en préparation'}
                                        {exam.statut === 'termine' && 'Examen terminé'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Warning Section */}
            <div className="proctoring-notice glass-glow">
                <AlertTriangle size={24} className="text-yellow" />
                <div className="notice-content">
                    <h4>Règlement des Examens en Ligne</h4>
                    <p>Chaque session est surveillée. Le basculement hors du navigateur ou l'ouverture d'outils de capture entraînera un blocage immédiat de la session.</p>
                </div>
            </div>
        </div>
    );
};

// Simple ShieldAlert fallback if not available
const ShieldAlert = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
);

export default Examens;
