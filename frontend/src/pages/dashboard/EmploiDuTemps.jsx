import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import api from '../../services/api';
import './EmploiDuTemps.css';

const EmploiDuTemps = () => {
    const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasGroupe, setHasGroupe] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.groupe_id) {
                setHasGroupe(false);
                setSchedule([]);
                setLoading(false);
                return;
            }

            const response = await api.get(`/emploi-du-temps`, {
                params: { groupe_id: user.groupe_id }
            });

            if (response.data && response.data.success && response.data.data) {
                // Normalize jour names to lowercase
                const normalized = response.data.data.map(item => ({
                    ...item,
                    jour: item.jour?.toLowerCase() || 'lundi'
                }));
                setSchedule(normalized);
                setHasGroupe(true);
            } else {
                setSchedule([]);
                setHasGroupe(true);
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError('Erreur lors du chargement de l\'emploi du temps');
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type) => {
        const typeMap = {
            'cours': 'cyan',
            'exam': 'purple',
            'tp': 'blue'
        };
        return typeMap[type?.toLowerCase()] || 'cyan';
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const getSessionsForDay = (day) => {
        return schedule
            .filter(s => s.jour?.toLowerCase() === day)
            .sort((a, b) => formatTime(a.heure_debut).localeCompare(formatTime(b.heure_debut)));
    };

    if (loading) {
        return (
            <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                Chargement de l'emploi du temps...
            </div>
        );
    }

    if (!hasGroupe) {
        return (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Groupe non assigné</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Votre emploi du temps apparaîtra une fois que vous serez assigné à un groupe.</p>
            </div>
        );
    }

    return (
        <div className="schedule-container">
            {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div className="schedule-grid-wrapper">
                <div className="schedule-days-grid">
                    {days.map(day => {
                        const daySessions = getSessionsForDay(day);

                        return (
                            <div key={day} className="day-column">
                                <div className="day-column-header">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                                <div className="day-column-body">
                                    {daySessions.length === 0 ? (
                                        <div className="day-empty-placeholder">Aucun cours</div>
                                    ) : (
                                        daySessions.map(session => (
                                            <div key={session.id} className={`session-card ${getTypeColor(session.type)}`}>
                                                <div className="session-glow"></div>
                                                <div className="session-card-body">
                                                    <div className="session-top">
                                                        <span className="session-time">{formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}</span>
                                                        <span className="session-type">{session.type}</span>
                                                    </div>
                                                    <h4>{session.titre}</h4>
                                                    <div className="session-meta">
                                                        <span className="room"><MapPin size={12} /> {session.salle}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="schedule-legend">
                <div className="legend-item"><span className="dot cyan"></span> Cours</div>
                <div className="legend-item"><span className="dot purple"></span> Examen</div>
                <div className="legend-item"><span className="dot blue"></span> TP</div>
            </div>
        </div>
    );
};

export default EmploiDuTemps;
