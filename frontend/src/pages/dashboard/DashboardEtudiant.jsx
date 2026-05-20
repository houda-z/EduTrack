import React from 'react';
import { 
    BookOpen, 
    Clock, 
    AlertCircle, 
    TrendingUp, 
    ArrowRight,
    Calendar,
    Zap
} from 'lucide-react';
import './DashboardEtudiant.css';

const DashboardEtudiant = () => {
    const stats = [
        { label: "Moyenne Générale", value: "15.82", icon: <TrendingUp className="text-purple" />, trend: "+1.2" },
        { label: "Cours Terminés", value: "12/18", icon: <BookOpen className="text-cyan" />, trend: "65%" },
        { label: "Examens à venir", value: "3", icon: <Calendar className="text-yellow" />, trend: "Cette semaine" },
        { label: "Points d'activité", value: "1,240", icon: <Zap className="text-green" />, trend: "Niveau 4" },
    ];

    const urgentExams = [
        { id: 1, title: "Architecture Microservices", date: "Demain, 09:00", duration: "2h", status: "Critical" },
        { id: 2, title: "Intelligence Artificielle", date: "22 Mai, 14:00", duration: "1h30", status: "Upcoming" },
    ];

    const recentActivity = [
        { id: 1, action: "Note publiée", target: "Algorithmique Avancée", time: "Il y a 2h", result: "16.5/20" },
        { id: 2, action: "Nouveau cours", target: "UI/UX Futuriste", time: "Il y a 5h", type: "Ressource" },
    ];

    return (
        <div className="dashboard-container">
            {/* Welcome Banner */}
            <div className="welcome-banner glass-glow">
                <div className="welcome-text">
                    <h1>RE-BONJOUR, <span className="scifi-accent">HOUDA</span></h1>
                    <p>Système opérationnel. Tous les modules sont synchronisés.</p>
                </div>
                <div className="welcome-stats">
                    <div className="pulse-circle"></div>
                    <span>Dernière connexion: Il y a 10 minutes</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid-cyber">
                {stats.map((stat, idx) => (
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
                            <button className="view-all">VOIR TOUT <ArrowRight size={14} /></button>
                        </div>
                        <div className="urgent-list">
                            {urgentExams.map(exam => (
                                <div key={exam.id} className="urgent-item">
                                    <div className="urgent-info">
                                        <h4>{exam.title}</h4>
                                        <span><Calendar size={14} /> {exam.date}</span>
                                    </div>
                                    <div className="urgent-action">
                                        <span className={`status-tag ${exam.status.toLowerCase()}`}>{exam.status}</span>
                                        <button className="btn-go-exam">GO</button>
                                    </div>
                                </div>
                            ))}
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
                            {recentActivity.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-dot"></div>
                                    <div className="activity-details">
                                        <p><strong>{activity.action}</strong>: {activity.target}</p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                    {activity.result && <span className="activity-result">{activity.result}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardEtudiant;
