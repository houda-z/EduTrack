import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Calendar,
    Zap
} from 'lucide-react';
import api from '../../services/api';
import './DashboardEtudiant.css';

const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Récemment';
    try {
        const date = new Date(isoString);
        const diffMs = Date.now() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "À l'instant";
        if (diffMin < 60) return `Il y a ${diffMin} min`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `Il y a ${diffH}h`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return `Il y a ${diffD} jour${diffD > 1 ? 's' : ''}`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
        return 'Récemment';
    }
};

const DashboardEtudiant = () => {
    const { nom } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [urgentExams, setUrgentExams] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/student/stats');

            if (response.data?.success && response.data.data) {
                const data = response.data.data;
                setUser(data.user);
                setStats(data.stats);
                setUrgentExams(data.urgent_exams || []);
                setRecentActivity(data.recent_activity || []);

                if (data.user) {
                    const stored = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({
                        ...stored,
                        ...data.user,
                        moyenne: data.user.moyenne,
                    }));
                }
            } else {
                setError('Données du tableau de bord indisponibles.');
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Erreur lors du chargement du tableau de bord.');

            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (stored) {
                setUser({
                    prenom: stored.prenom,
                    name: stored.name,
                    last_connection: null,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const displayName = (user?.prenom || user?.name || 'ÉTUDIANT').toUpperCase();

    const statsCards = stats ? [
        {
            label: 'Moyenne Générale',
            value: stats.moyenne != null ? Number(stats.moyenne).toFixed(2) : '—',
            icon: <TrendingUp className="text-purple" />,
            trend: stats.notes_count > 0 ? `${stats.notes_count} note${stats.notes_count > 1 ? 's' : ''}` : 'Aucune note',
        },
        {
            label: 'Cours Terminés',
            value: `${stats.cours_termines}/${stats.cours_total}`,
            icon: <BookOpen className="text-cyan" />,
            trend: `${stats.cours_completion_percent}%`,
        },
        {
            label: 'Examens à venir',
            value: String(stats.examens_a_venir),
            icon: <Calendar className="text-yellow" />,
            trend: stats.examens_a_venir === 1 ? 'Cette semaine' : 'À planifier',
        },
        {
            label: "Points d'activité",
            value: stats.points_activite?.toLocaleString('fr-FR') ?? '0',
            icon: <Zap className="text-green" />,
            trend: stats.notes_count > 0 ? 'Actif' : 'Débutant',
        },
    ] : [];

    if (loading) {
        return (
            <div className="dashboard-container dashboard-loading">
                <div className="dashboard-spinner" />
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {error && (
                <div className="dashboard-error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button type="button" onClick={fetchDashboard}>Réessayer</button>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="welcome-banner glass-glow">
                <div className="welcome-text">
                    <h1>RE-BONJOUR, <span className="scifi-accent">{displayName}</span></h1>
                    <p>Système opérationnel. Tous les modules sont synchronisés.</p>
                </div>
                <div className="welcome-stats">
                    <div className="pulse-circle"></div>
                    <span>
                        Dernière activité : {formatRelativeTime(user?.last_connection)}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-cyber">
                {statsCards.map((stat, idx) => (
                    <div key={idx} className="stat-card-cyber glass-glow">
                        <div className="stat-icon-box">{stat.icon}</div>
                        <div className="stat-info">
                            <label>{stat.label}</label>
                            <h3>{stat.value}</h3>
                            <span className="stat-trend">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-main-grid">
                {/* Urgent Exams */}
                <div className="main-grid-left">
                    <div className="section-card glass-glow">
                        <div className="section-header">
                            <div className="title-with-icon">
                                <Clock size={20} className="text-purple" />
                                <h3>EXAMENS URGENTS</h3>
                            </div>
                            <button
                                type="button"
                                className="view-all"
                                onClick={() => navigate(`/etudiant/${nom}/examens`)}
                            >
                                VOIR TOUT <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="urgent-list">
                            {urgentExams.length === 0 ? (
                                <p className="dashboard-empty-msg">Aucun examen à venir pour le moment.</p>
                            ) : (
                                urgentExams.map((exam) => (
                                    <div key={exam.id} className="urgent-item">
                                        <div className="urgent-info">
                                            <h4>{exam.title}</h4>
                                            <span>
                                                <Calendar size={14} /> {exam.date_label}
                                            </span>
                                        </div>
                                        <div className="urgent-action">
                                            <span className={`status-tag ${exam.status.toLowerCase()}`}>
                                                {exam.status}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn-go-exam"
                                                onClick={() => navigate(`/etudiant/${nom}/examens`)}
                                            >
                                                GO
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="main-grid-right">
                    <div className="section-card glass-glow">
                        <div className="section-header">
                            <div className="title-with-icon">
                                <AlertCircle size={20} className="text-cyan" />
                                <h3>ACTIVITÉS RÉCENTES</h3>
                            </div>
                        </div>
                        <div className="activity-list">
                            {recentActivity.length === 0 ? (
                                <p className="dashboard-empty-msg">Aucune activité récente.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-dot"></div>
                                        <div className="activity-details">
                                            <p>
                                                <strong>{activity.action}</strong>: {activity.target}
                                            </p>
                                            <span className="activity-time">
                                                {formatRelativeTime(activity.time)}
                                            </span>
                                        </div>
                                        {activity.result && (
                                            <span className="activity-result">{activity.result}</span>
                                        )}
                                        {activity.type === 'cours' && !activity.result && (
                                            <span className="activity-result activity-type-tag">Ressource</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardEtudiant;
