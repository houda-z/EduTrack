import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import './EmploiDuTemps.css';

const EmploiDuTemps = () => {
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const timeSlots = ["08:30 - 10:30", "10:45 - 12:45", "14:00 - 16:00", "16:15 - 18:15"];

    const schedule = [
        { day: "Lundi", time: "08:30 - 10:30", subject: "React Native", room: "Lab 4", teacher: "M. Ahmed", color: "cyan" },
        { day: "Lundi", time: "10:45 - 12:45", subject: "UI Architecture", room: "Salle 2", teacher: "Mme. Sarah", color: "purple" },
        { day: "Mardi", time: "14:00 - 16:00", subject: "Laravel Backend", room: "Lab 1", teacher: "M. Karim", color: "cyan" },
        { day: "Mercredi", time: "08:30 - 10:30", subject: "Cloud Computing", room: "Salle 5", teacher: "Dr. Ben", color: "purple" },
        { day: "Jeudi", time: "10:45 - 12:45", subject: "Soft Skills", room: "Amphi A", teacher: "Mme. Layla", color: "blue" },
        { day: "Vendredi", time: "16:15 - 18:15", subject: "Mobile Dev", room: "Lab 3", teacher: "M. Sami", color: "cyan" },
    ];

    const getSession = (day, slot) => {
        return schedule.find(s => s.day === day && s.time === slot);
    };

    return (
        <div className="schedule-container">


            <div className="schedule-grid-wrapper">
                <div className="schedule-header-row">
                    <div className="time-column-header">Heure</div>
                    {days.map(day => (
                        <div key={day} className="day-column-header">{day}</div>
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
                                const session = getSession(day, slot);
                                return (
                                    <div key={`${day}-${slot}`} className="schedule-cell">
                                        {session ? (
                                            <div className={`session-card ${session.color}`}>
                                                <div className="session-glow"></div>
                                                <h4>{session.subject}</h4>
                                                <div className="session-meta">
                                                    <span className="room"><MapPin size={12} /> {session.room}</span>
                                                    <span className="teacher">{session.teacher}</span>
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
                <div className="legend-item"><span className="dot cyan"></span> Technique</div>
                <div className="legend-item"><span className="dot purple"></span> Design / Architecture</div>
                <div className="legend-item"><span className="dot blue"></span> Soft Skills</div>
            </div>
        </div>
    );
};

export default EmploiDuTemps;
