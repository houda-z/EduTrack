import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import api from '../../services/api';
import './EmploiDuTemps.css';

const EmploiDuTemps = () => {
    const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

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

    const getSessionForSlot = (day, hour) => {
        return schedule.find(s => {
            const sDay = s.jour?.toLowerCase();
            const sStart = s.heure_debut?.substring(0, 5); // "HH:MM"
            return sDay === day && sStart === hour;
        });
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

            {schedule.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Aucun cours programmé</p>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Votre emploi du temps apparaîtra ici une fois qu'il sera défini.</p>
                </div>
            ) : (
                <>
                    <div className="schedule-grid-wrapper">
                        <div className="schedule-header-row">
                            <div className="time-column-header">Heure</div>
                            {days.map(day => (
                                <div key={day} className="day-column-header">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                            ))}
                        </div>

                        <div className="schedule-body">
                            {timeSlots.map(slot => (
                                <div key={slot} className="schedule-row">
                                    <div className="time-slot-label">
                                        <Clock size={14} />
                                        <span>{slot}</span>
                                    </div>
                                    {days.map(day => {
                                        const session = getSessionForSlot(day, slot);
                                        return (
                                            <div key={`${day}-${slot}`} className="schedule-cell">
                                                {session ? (
                                                    <div className={`session-card ${getTypeColor(session.type)}`}>
                                                        <div className="session-glow"></div>
                                                        <h4>{session.titre}</h4>
                                                        <div className="session-meta">
                                                            <span className="room"><MapPin size={12} /> {session.salle}</span>
                                                            <span className="teacher">{session.formateur?.prenom} {session.formateur?.name}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="empty-slot"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="schedule-legend">
                        <div className="legend-item"><span className="dot cyan"></span> Cours</div>
                        <div className="legend-item"><span className="dot purple"></span> Examen</div>
                        <div className="legend-item"><span className="dot blue"></span> TP</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmploiDuTemps;
