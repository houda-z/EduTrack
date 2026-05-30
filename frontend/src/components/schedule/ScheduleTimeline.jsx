import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import {
  DAYS_OF_WEEK,
  SCHEDULE_START,
  SCHEDULE_END,
  formatTime,
  generateTimeAxisLabels,
  getSessionStyle,
} from '../../constants/scheduleConfig';
import './ScheduleTimeline.css';

const getTypeColor = (type) => {
  const map = { cours: 'cyan', exam: 'purple', tp: 'blue' };
  return map[type?.toLowerCase()] || 'cyan';
};

const ScheduleTimeline = ({
  sessions = [],
  days = DAYS_OF_WEEK,
  readonly = true,
  onSessionClick,
  emptyLabel = 'Aucun cours',
}) => {
  const timeLabels = generateTimeAxisLabels(60);

  const getDaySessions = (day) =>
    sessions
      .filter((s) => s.jour?.toLowerCase() === day.toLowerCase())
      .sort((a, b) => formatTime(a.heure_debut).localeCompare(formatTime(b.heure_debut)));

  return (
    <div className="schedule-timeline">
      <div className="schedule-timeline-range">
        <Clock size={14} />
        <span>
          Plage horaire : {SCHEDULE_START} — {SCHEDULE_END} (continue)
        </span>
      </div>

      <div className="schedule-timeline-grid">
        <div className="schedule-timeline-time-col">
          <div className="schedule-timeline-corner" />
          {timeLabels.map((label) => (
            <div key={label} className="schedule-timeline-time-label">
              {label}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const daySessions = getDaySessions(day);

          return (
            <div key={day} className="schedule-timeline-day-col">
              <div className="schedule-timeline-day-header">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </div>
              <div className="schedule-timeline-day-body">
                {timeLabels.map((label, index) => (
                  <div
                    key={`${day}-${label}`}
                    className="schedule-timeline-hour-line"
                    style={{ top: `${(index / (timeLabels.length - 1)) * 100}%` }}
                  />
                ))}

                {daySessions.length === 0 ? (
                  <div className="schedule-timeline-empty">{emptyLabel}</div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`schedule-timeline-session ${getTypeColor(session.type)} ${readonly ? '' : 'interactive'}`}
                      style={getSessionStyle(session.heure_debut, session.heure_fin)}
                      onClick={() => !readonly && onSessionClick?.(session)}
                      role={readonly ? undefined : 'button'}
                      tabIndex={readonly ? undefined : 0}
                    >
                      <span className="schedule-timeline-session-time">
                        {formatTime(session.heure_debut)} – {formatTime(session.heure_fin)}
                      </span>
                      <strong className="schedule-timeline-session-title">{session.titre}</strong>
                      {session.salle && (
                        <span className="schedule-timeline-session-room">
                          <MapPin size={11} /> {session.salle}
                        </span>
                      )}
                      <span className="schedule-timeline-session-type">{session.type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleTimeline;
