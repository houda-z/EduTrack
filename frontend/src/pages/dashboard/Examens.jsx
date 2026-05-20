import React from 'react';
import { 
    Calendar, 
    Clock, 
    HelpCircle, 
    Award, 
    ArrowRight, 
    AlertTriangle 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import './Examens.css';

const Examens = () => {
    const { nom } = useParams();
    const navigate = useNavigate();

    // Mock Data détaillée des examens
    const mockExams = [
        {
            id: 1,
            title: "Contrôle : React JS & Hooks",
            course: "Développement Frontend Avancé",
            duration: "120 min",
            questions: 15,
            coef: 3,
            date: "Disponible dès maintenant",
            status: "available", // Green/Cyan
            difficulty: "Moyen"
        },
        {
            id: 2,
            title: "Examen Final : Laravel Framework",
            course: "Architecture Backend PHP",
            duration: "180 min",
            questions: 24,
            coef: 6,
            date: "Demain à 09:00",
            status: "urgent", // Red/Violet
            difficulty: "Difficile"
        },
        {
            id: 3,
            title: "Quiz : SQL & Optimisation",
            course: "Gestion de Bases de Données",
            duration: "45 min",
            questions: 20,
            coef: 1,
            date: "Passé le 15 Mai",
            status: "closed", // Gray
            difficulty: "Facile",
            grade: "18/20"
        }
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'available': 
                return <span className="exam-badge badge-cyan">DISPONIBLE</span>;
            case 'urgent': 
                return <span className="exam-badge badge-urgent">URGENT</span>;
            case 'closed': 
                return <span className="exam-badge badge-closed">CLÔTURÉ</span>;
            default: 
                return null;
        }
    };

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

            <div className="exam-grid-premium">
                {mockExams.map((exam) => (
                    <div key={exam.id} className={`exam-card-sci glass-glow ${exam.status}`}>
                        {/* Background Effect */}
                        <div className="card-flare"></div>

                        <div className="card-top">
                            {getStatusBadge(exam.status)}
                            <div className="exam-difficulty">{exam.difficulty}</div>
                        </div>

                        <div className="card-body">
                            <h3 className="exam-title">{exam.title}</h3>
                            <p className="course-subtitle">{exam.course}</p>

                            <div className="exam-stats-row">
                                <div className="stat-item">
                                    <Clock size={16} />
                                    <span>{exam.duration}</span>
                                </div>
                                <div className="stat-item">
                                    <HelpCircle size={16} />
                                    <span>{exam.questions} Qs</span>
                                </div>
                                <div className="stat-item">
                                    <Award size={16} />
                                    <span>Coef {exam.coef}</span>
                                </div>
                            </div>

                            <div className="exam-date-box">
                                <Calendar size={14} />
                                <span>{exam.date}</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            {exam.status === 'closed' ? (
                                <div className="grade-display">
                                    <span className="label">NOTE OBTENUE</span>
                                    <span className="value">{exam.grade}</span>
                                </div>
                            ) : (
                                <button 
                                    className={`btn-exam-action ${exam.status === 'urgent' ? 'btn-violet' : 'btn-cyan'}`}
                                    onClick={() => navigate(`/etudiant/${nom}/en-ligne`)}
                                >
                                    {exam.status === 'urgent' ? 'LANCER MAINTENANT' : "COMMENCER L'ÉPREUVE"}
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
);

export default Examens;
