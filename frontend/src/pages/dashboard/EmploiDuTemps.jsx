import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ScheduleTimeline from '../../components/schedule/ScheduleTimeline';
import { SCHEDULE_START, SCHEDULE_END } from '../../constants/scheduleConfig';
import './EmploiDuTemps.css';

const EmploiDuTemps = () => {
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

            const response = await api.get('/emploi-du-temps', {
                params: { groupe_id: user.groupe_id },
            });

            if (response.data?.success && response.data.data) {
                const normalized = response.data.data.map((item) => ({
                    ...item,
                    jour: item.jour?.toLowerCase() || 'lundi',
                }));
                setSchedule(normalized);
                setHasGroupe(true);
            } else {
                setSchedule([]);
                setHasGroupe(true);
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setError("Erreur lors du chargement de l'emploi du temps");
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="schedule-loading">
                <div className="schedule-spinner" />
                Chargement de l'emploi du temps...
            </div>
        );
    }

    if (!hasGroupe) {
        return (
            <div className="schedule-no-groupe">
                <p className="schedule-no-groupe-title">Groupe non assigné</p>
                <p className="schedule-no-groupe-desc">
                    Votre emploi du temps apparaîtra une fois que vous serez assigné à un groupe.
                </p>
            </div>
        );
    }

    return (
        <div className="schedule-container">
            <div className="schedule-page-header">
                <h2>Mon emploi du temps</h2>
                <p>
                    Semaine type — plage continue de {SCHEDULE_START} à {SCHEDULE_END}
                </p>
            </div>

            {error && <div className="schedule-error">{error}</div>}

            <ScheduleTimeline sessions={schedule} readonly />

            <div className="schedule-legend">
                <div className="legend-item"><span className="dot cyan" /> Cours</div>
                <div className="legend-item"><span className="dot purple" /> Examen</div>
                <div className="legend-item"><span className="dot blue" /> TP</div>
            </div>
        </div>
    );
};

export default EmploiDuTemps;
