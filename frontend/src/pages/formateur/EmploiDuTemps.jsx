import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  PlusCircle,
  Clock,
  MapPin,
  Trash2,
  Edit3,
  X,
  Plus,
  Sliders
} from 'lucide-react';
import api from '../../services/api';
import ScheduleTimeline from '../../components/schedule/ScheduleTimeline';
import {
  DAYS_OF_WEEK,
  SCHEDULE_START,
  SCHEDULE_END,
  formatTime,
  generateSuggestedSlots,
  findSessionAtSlot,
  isWithinScheduleRange,
} from '../../constants/scheduleConfig';

const DEFAULT_SLOT = generateSuggestedSlots()[0];

const EmploiDuTemps = () => {
  const [filieres, setFilieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [selectedFiliereId, setSelectedFiliereId] = useState('');
  const [selectedGroupeId, setSelectedGroupeId] = useState('');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showSlots, setShowSlots] = useState(false);
  const [viewMode, setViewMode] = useState('timeline');

  const suggestedSlots = useMemo(() => generateSuggestedSlots(), []);

  const [titre, setTitre] = useState('');
  const [jour, setJour] = useState('lundi');
  const [heureDebut, setHeureDebut] = useState(DEFAULT_SLOT?.debut || SCHEDULE_START);
  const [heureFin, setHeureFin] = useState(DEFAULT_SLOT?.fin || '09:30');
  const [salle, setSalle] = useState('');
  const [typeSession, setTypeSession] = useState('cours');

  const fetchMetadata = async () => {
    try {
      const filRes = await api.get('/filieres');
      setFilieres(filRes.data || []);
    } catch (err) {
      console.warn('API metadata loading error:', err);
      setFilieres([
        { id: 1, nom: 'Développement Digital' },
        { id: 2, nom: 'Systèmes d\'Information' },
      ]);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchGroupes = async () => {
      if (!selectedFiliereId) {
        setGroupes([]);
        setSelectedGroupeId('');
        return;
      }
      try {
        const grpRes = await api.get(`/groupes?filiere_id=${selectedFiliereId}`);
        if (grpRes.data?.success) {
          setGroupes(grpRes.data.data);
        } else {
          setGroupes(grpRes.data || []);
        }
      } catch (err) {
        console.warn('API groups load error:', err);
        setGroupes([]);
      }
    };
    fetchGroupes();
  }, [selectedFiliereId]);

  const fetchSchedule = async () => {
    if (!selectedGroupeId) {
      setSessions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/emploi-du-temps?groupe_id=${selectedGroupeId}`);
      if (res.data?.success) {
        setSessions(
          (res.data.data || []).map((s) => ({
            ...s,
            jour: s.jour?.toLowerCase(),
          }))
        );
      }
    } catch (err) {
      console.error('API schedule fetch error:', err);
      setError("Erreur lors du chargement de l'emploi du temps.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedGroupeId]);

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!selectedGroupeId) {
      alert("Veuillez d'abord sélectionner un groupe.");
      return;
    }

    const normalizedHeureDebut = formatTime(heureDebut);
    const normalizedHeureFin = formatTime(heureFin);

    if (!isWithinScheduleRange(normalizedHeureDebut, normalizedHeureFin)) {
      alert(`Les horaires doivent être compris entre ${SCHEDULE_START} et ${SCHEDULE_END}, avec une heure de fin après le début.`);
      return;
    }

    const payload = {
      groupe_id: parseInt(selectedGroupeId, 10),
      titre,
      jour,
      heure_debut: normalizedHeureDebut,
      heure_fin: normalizedHeureFin,
      salle,
      type: typeSession,
    };

    try {
      if (editingSession) {
        const res = await api.put(`/emploi-du-temps/${editingSession.id}`, payload);
        if (res.data?.success) {
          setIsModalOpen(false);
          fetchSchedule();
        }
      } else {
        const res = await api.post('/emploi-du-temps', payload);
        if (res.data?.success) {
          setIsModalOpen(false);
          fetchSchedule();
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.errors?.heure_debut?.[0] ||
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement de la session.";
      setError(msg);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;
    try {
      await api.delete(`/emploi-du-temps/${id}`);
      fetchSchedule();
    } catch (err) {
      console.error('API delete session error:', err);
      alert('Erreur lors de la suppression de la session.');
    }
  };

  const handleOpenAddModal = (day = 'lundi', preDebut = DEFAULT_SLOT.debut, preFin = DEFAULT_SLOT.fin) => {
    setEditingSession(null);
    setTitre('');
    setJour(day);
    setHeureDebut(preDebut);
    setHeureFin(preFin);
    setSalle('');
    setTypeSession('cours');
    setShowSlots(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setTitre(session.titre);
    setJour(session.jour);
    setHeureDebut(formatTime(session.heure_debut));
    setHeureFin(formatTime(session.heure_fin));
    setSalle(session.salle || '');
    setTypeSession(session.type);
    setIsModalOpen(true);
  };

  const getSessionsForDay = (day) =>
    sessions
      .filter((s) => s.jour?.toLowerCase() === day.toLowerCase())
      .sort((a, b) => formatTime(a.heure_debut).localeCompare(formatTime(b.heure_debut)));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">EMPLOI DU TEMPS</h2>
          <p className="text-slate-400 text-sm mt-1">
            Planification continue de {SCHEDULE_START} à {SCHEDULE_END} — tous les créneaux sont disponibles sur cette plage.
          </p>
        </div>

        {selectedGroupeId && (
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'timeline' ? 'cards' : 'timeline'))}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
            >
              {viewMode === 'timeline' ? 'Vue cartes' : 'Vue grille'}
            </button>
            <button
              type="button"
              onClick={() => setShowSlots((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${
                showSlots
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Sliders size={15} />
              Créneaux suggérés
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
            >
              <PlusCircle size={15} />
              Ajouter un Cours/TP
            </button>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filière</label>
          <select
            value={selectedFiliereId}
            onChange={(e) => setSelectedFiliereId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="">Sélectionnez la filière...</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Groupe</label>
          <select
            value={selectedGroupeId}
            onChange={(e) => setSelectedGroupeId(e.target.value)}
            disabled={!selectedFiliereId}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold disabled:opacity-50"
          >
            <option value="">Sélectionnez le groupe...</option>
            {groupes.map((g) => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-bold">
          {error}
        </div>
      )}

      {showSlots && selectedGroupeId && !loading && (
        <div className="p-5 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md shadow-xl space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Créneaux suggérés (1h) — plage {SCHEDULE_START} à {SCHEDULE_END}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 border-b border-white/5 pb-1.5">
                  {day}
                </p>
                {suggestedSlots.map((slot) => {
                  const occupied = findSessionAtSlot(sessions, day, slot.debut, slot.fin);
                  return (
                    <div
                      key={slot.label}
                      className={`px-3 py-2 rounded-xl border text-[10px] font-bold flex items-center justify-between gap-2 ${
                        occupied
                          ? 'bg-red-500/10 border-red-500/20 text-red-300'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      <span className="truncate">{occupied ? occupied.titre : slot.label}</span>
                      {!occupied && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(day, slot.debut, slot.fin)}
                          className="shrink-0 p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 transition-colors"
                          title={`Ajouter un cours ${slot.label}`}
                        >
                          <Plus size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedGroupeId ? (
        <div className="p-12 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-2xl bg-white/2">
          <Calendar size={40} className="mx-auto text-slate-600 mb-3" />
          Veuillez sélectionner une filière et un groupe ci-dessus pour charger l'emploi du temps.
        </div>
      ) : loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'timeline' ? (
        <ScheduleTimeline
          sessions={sessions}
          readonly={false}
          onSessionClick={handleOpenEditModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySessions = getSessionsForDay(day);
            return (
              <div
                key={day}
                className="p-4 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-md flex flex-col space-y-4 shadow-lg min-h-[300px]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <h3 className="font-extrabold text-[12px] uppercase tracking-widest text-cyan-400">{day}</h3>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(day)}
                    className="p-1 rounded bg-white/5 hover:bg-cyan-500 hover:text-slate-900 text-cyan-400 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {daySessions.length === 0 ? (
                    <span className="text-[10px] text-slate-600 font-bold italic block text-center py-8">
                      Aucun cours
                    </span>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleOpenEditModal(session)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.03] text-left flex flex-col justify-between space-y-2 shadow-md ${
                          session.type === 'exam'
                            ? 'bg-red-500/10 border-red-500/20 text-red-300'
                            : session.type === 'tp'
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                              : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-wide opacity-80">
                            <Clock size={11} />
                            {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                          </div>
                          <h4 className="font-bold text-[12.5px] text-white line-clamp-1 mt-1">{session.titre}</h4>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400 pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {session.salle || 'N/A'}
                          </span>
                          <span className="uppercase text-[9px]">{session.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveSession}
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-5 animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-black text-white">
                {editingSession ? 'Modifier la Session' : 'Planifier un cours/TP'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-[10px] text-slate-500">
              Horaires autorisés : {SCHEDULE_START} — {SCHEDULE_END} (plage continue, sans coupure déjeuner)
            </p>

            <div className="space-y-1.5">
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Titre Session</label>
              <input
                type="text"
                required
                placeholder="Ex. Architecture logicielle..."
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Jour</label>
                <select
                  value={jour}
                  onChange={(e) => setJour(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                <select
                  value={typeSession}
                  onChange={(e) => setTypeSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none font-bold"
                >
                  <option value="cours">Cours</option>
                  <option value="tp">TP (Pratique)</option>
                  <option value="exam">Examen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Début</label>
                <input
                  type="time"
                  required
                  min={SCHEDULE_START}
                  max={SCHEDULE_END}
                  step="300"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Fin</label>
                <input
                  type="time"
                  required
                  min={SCHEDULE_START}
                  max={SCHEDULE_END}
                  step="300"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">Salle</label>
                <input
                  type="text"
                  placeholder="Lab 3"
                  value={salle}
                  onChange={(e) => setSalle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                {editingSession && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDeleteSession(editingSession.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all text-xs font-bold"
                  >
                    <Trash2 size={13} />
                    Supprimer
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmploiDuTemps;
