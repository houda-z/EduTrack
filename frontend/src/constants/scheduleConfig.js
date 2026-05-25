/** Plage horaire continue — remplace 08:00-12:00 / 14:00-18:00 */
export const SCHEDULE_START = '08:30';
export const SCHEDULE_END = '18:30';
export const SLOT_INTERVAL_MINUTES = 60;

export const DAYS_OF_WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const normalized = timeStr.length >= 5 ? timeStr.slice(0, 5) : timeStr;
  const [h, m] = normalized.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatTime = (timeStr) => {
  if (!timeStr) return SCHEDULE_START;
  return timeStr.slice(0, 5);
};

export const getScheduleDurationMinutes = () =>
  timeToMinutes(SCHEDULE_END) - timeToMinutes(SCHEDULE_START);

export const generateSuggestedSlots = (intervalMinutes = SLOT_INTERVAL_MINUTES) => {
  const start = timeToMinutes(SCHEDULE_START);
  const end = timeToMinutes(SCHEDULE_END);
  const slots = [];

  for (let cursor = start; cursor + intervalMinutes <= end; cursor += intervalMinutes) {
    const debut = minutesToTime(cursor);
    const fin = minutesToTime(cursor + intervalMinutes);
    slots.push({ debut, fin, label: `${debut}-${fin}` });
  }

  return slots;
};

export const generateTimeAxisLabels = (stepMinutes = 60) => {
  const labels = [];
  const start = timeToMinutes(SCHEDULE_START);
  const end = timeToMinutes(SCHEDULE_END);

  for (let cursor = start; cursor <= end; cursor += stepMinutes) {
    labels.push(minutesToTime(cursor));
  }

  return labels;
};

export const isWithinScheduleRange = (heureDebut, heureFin) => {
  const debut = timeToMinutes(formatTime(heureDebut));
  const fin = timeToMinutes(formatTime(heureFin));
  const min = timeToMinutes(SCHEDULE_START);
  const max = timeToMinutes(SCHEDULE_END);

  return debut >= min && fin <= max && fin > debut;
};

/** Position % dans la colonne jour (grille continue) */
export const getSessionStyle = (heureDebut, heureFin) => {
  const total = getScheduleDurationMinutes();
  const start = timeToMinutes(SCHEDULE_START);
  const debut = timeToMinutes(formatTime(heureDebut));
  const fin = timeToMinutes(formatTime(heureFin));

  const top = ((debut - start) / total) * 100;
  const height = ((fin - debut) / total) * 100;

  return {
    top: `${Math.max(0, top)}%`,
    height: `${Math.min(100 - top, height)}%`,
  };
};

export const sessionsOverlap = (session, slotDebut, slotFin) => {
  const sessStart = formatTime(session.heure_debut);
  const sessEnd = formatTime(session.heure_fin);
  return sessStart < slotFin && sessEnd > slotDebut;
};

export const findSessionAtSlot = (sessions, day, slotDebut, slotFin) =>
  sessions.find(
    (s) =>
      s.jour?.toLowerCase() === day.toLowerCase() &&
      sessionsOverlap(s, slotDebut, slotFin)
  ) || null;
