import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Code,
  FileText,
  Terminal,
  RotateCcw,
  Check
} from 'lucide-react';
import api from '../../services/api';
import './CorrectionExamens.css';

const CorrectionExamens = () => {
  // View state
  const [currentView, setCurrentView] = useState('exams'); // 'exams' | 'students' | 'grading'
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Data states
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentResponses, setStudentResponses] = useState([]);
  const [examData, setExamData] = useState(null);

  // Grading states
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== VIEW 1: EXAM LIST ====================
  useEffect(() => {
    if (currentView === 'exams') {
      fetchExams();
    }
  }, [currentView]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/formateur/examens-correction');
      if (res.data && res.data.success) {
        setExams(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Impossible de charger les examens à corriger.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
    fetchStudents(exam.id, exam.groupe_id);
    setCurrentView('students');
  };

  // ==================== VIEW 2: STUDENT LIST ====================
  const fetchStudents = async (exam_id, groupe_id) => {
    setLoading(true);
    try {
      const res = await api.get(`/formateur/examens/${exam_id}/groupes/${groupe_id}/etudiants`);
      if (res.data && res.data.success) {
        setStudents(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Impossible de charger les etudiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentResponses(student.responses || []);
    // Initialize grades from existing note_attribuee
    const initialGrades = {};
    (student.responses || []).forEach((resp) => {
      initialGrades[resp.question_id] = resp.note_attribuee || 0;
    });
    setGrades(initialGrades);
    setCurrentView('grading');
  };

  const handleBackToStudents = () => {
    setCurrentView('students');
    setSelectedStudent(null);
    setGrades({});
  };

  const handleBackToExams = () => {
    setCurrentView('exams');
    setSelectedExam(null);
    setSelectedStudent(null);
  };

  // ==================== VIEW 3: GRADING WORKSPACE ====================
  const handleGradeChange = (questionId, value, maxPoints) => {
    const rawValue = value?.toString?.() ?? '';
    if (rawValue.trim() === '') {
      setGrades((prev) => ({
        ...prev,
        [questionId]: '',
      }));
      return;
    }

    const parsed = parseFloat(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const sanitized = Math.max(0, Math.min(maxPoints ?? 0, parsed));
    setGrades((prev) => ({
      ...prev,
      [questionId]: sanitized,
    }));
  };

  const handleSubmitGrades = async () => {
    if (!selectedStudent || !selectedExam) return;

    setSaving(true);
    try {
      const res = await api.post('/formateur/reponses/noter', {
        session_id: selectedStudent.session_id,
        etudiant_id: selectedStudent.etudiant.id,
        examen_id: selectedExam.id,
        notes: grades,
      });

      if (res.data && res.data.success) {
        alert('Correction enregistree avec succes!');
        handleBackToStudents();
      }
    } catch (err) {
      console.error('Failed to save grades:', err);
      alert('Erreur lors de l\'enregistrement des notes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDebloquer = async (sessionId) => {
    try {
      await api.patch(`/sessions/${sessionId}/debloquer`);
      await fetchStudents(selectedExam.id, selectedExam.groupe_id);
      alert('Étudiant débloqué avec succès.');
    } catch (err) {
      console.error('Deblocking error:', err);
      alert('Erreur lors du déblocage.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get(
        `/formateur/examens/${selectedExam.id}/etudiants/${selectedStudent.etudiant.id}/export-pdf`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `correction_${selectedStudent.etudiant.name}_${selectedExam.titre}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export PDF error:', err);
      alert('Erreur lors de l\'export PDF.');
    }
  };

  // ==================== RENDER: VIEW 1 ====================
  if (currentView === 'exams') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">CORRECTION D'EXAMENS</h2>
            <p className="text-slate-400 text-sm mt-1">Consultez et notez les reponses des etudiants.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest">Chargement...</span>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-2xl bg-white/2">
            <ClipboardList size={40} className="mx-auto text-slate-600 mb-3" />
            Aucun examen a corriger pour l'instant.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleSelectExam(exam)}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-black text-white group-hover:text-cyan-400 transition-colors mb-2">
                      {exam.titre}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {exam.filiere?.nom || 'Filiere'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {exam.groupe?.nom || 'Groupe'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-yellow-500/10 text-yellow-200 border border-yellow-500/20">
                    ⏳ {exam.nb_soumis ?? exam.submissions_count ?? 0} en attente
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-200 border border-emerald-500/20">
                    ✓ {exam.nb_corriges ?? 0} corrigés
                  </span>
                  <ChevronRight size={20} className="text-cyan-400 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ==================== RENDER: VIEW 2 ====================
  if (currentView === 'students' && selectedExam) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToExams}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{selectedExam.titre}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {selectedExam.filiere?.nom} • {selectedExam.groupe?.nom}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest">Chargement des etudiants...</span>
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-2xl bg-white/2">
            <Users size={40} className="mx-auto text-slate-600 mb-3" />
            Aucun etudiant n'a soumis cet examen.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const isCorrected = student.statut === 'corrige';
              const score = student.note_totale || 0;

              return (
                <div
                  key={student.session_id}
                  onClick={() => handleSelectStudent(student)}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-cyan-300">
                      {student.etudiant?.prenom?.[0] || 'E'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {student.etudiant?.prenom} {student.etudiant?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{student.etudiant?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between gap-3">
                      {student.statut === 'bloque' ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                          🔒 Bloqué (fraude)
                        </span>
                      ) : student.statut === 'soumis' ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                          ⏳ En attente
                        </span>
                      ) : student.statut === 'corrige' ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          ✓ Corrigé — {score}/20
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
                          Statut inconnu
                        </span>
                      )}
                      <ChevronRight size={16} className="text-cyan-400" />
                    </div>
                    {student.statut === 'bloque' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDebloquer(student.session_id);
                        }}
                        className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-100 text-xs font-bold hover:bg-red-500/15 transition-all"
                      >
                        🔓 Débloquer l'accès
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==================== RENDER: VIEW 3 ====================
  if (currentView === 'grading' && selectedStudent && selectedExam) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <button
            onClick={handleBackToStudents}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              {selectedStudent.etudiant?.prenom} {selectedStudent.etudiant?.name}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {selectedExam.titre} • {selectedExam.filiere?.nom} • {selectedExam.groupe?.nom}
            </p>
          </div>
          <button
            onClick={() => handleExportPDF()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 rounded-xl text-xs font-bold transition-all"
          >
            📄 Exporter PDF
          </button>
        </div>

        {/* Reference materials section */}
        {/* TODO: Add parties/images/tables here */}

        {/* Grading section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Questions et reponses</h3>

          {studentResponses.map((resp) => {
            const question = resp.question;
            const isQCM = question?.type === 'qcm';
            const isCode = question?.type === 'code';
            const isCommande = question?.type === 'commande';

            return (
              <div
                key={resp.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isQCM && <span className="text-[10px] font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300">QCM</span>}
                      {isCode && <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-300">CODE</span>}
                      {isCommande && <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500/20 text-orange-300">COMMANDE</span>}
                      {!isQCM && !isCode && !isCommande && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-300">TEXTE</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white">{question?.enonce}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                    {question?.points || 1} pts
                  </span>
                </div>

                {/* QCM response */}
                {isQCM && question?.choix && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Choix du student</p>
                    <div className="space-y-1">
                      {question.choix.map((choice) => {
                        const isSelected = resp.choix_qcm_id === choice.id;
                        const isCorrect = choice.est_correct;
                        return (
                          <div
                            key={choice.id}
                            className={`p-2 rounded text-sm ${isSelected
                              ? isCorrect
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'
                                : 'bg-red-500/20 border border-red-500/30 text-red-200'
                              : isCorrect
                                ? 'bg-white/5 border border-white/10 text-slate-300'
                                : 'bg-white/2 border border-white/5 text-slate-400'
                              }`}
                          >
                            {isSelected && '✓'} {choice.texte}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Code/Commande response */}
                {(isCode || isCommande) && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Reponse du student</p>
                    <pre className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-200 overflow-x-auto max-h-40">
                      {resp.reponse_texte || '(Aucune reponse)'}
                    </pre>
                  </div>
                )}

                {/* Text response */}
                {!isQCM && !isCode && !isCommande && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Reponse du student</p>
                    <div className="p-3 rounded-lg bg-white/2 border border-white/5 text-sm text-slate-300 max-h-32 overflow-y-auto">
                      {resp.reponse_texte || '(Aucune reponse)'}
                    </div>
                  </div>
                )}

                {/* Grading input */}
                {!isQCM && (
                  <div className="flex items-end gap-3 pt-2 border-t border-white/5">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Note</label>
                      <input
                        type="number"
                        min={0}
                        max={question?.points || 1}
                        step={0.25}
                        placeholder={`/ ${question?.points || 1} pts`}
                        value={grades[resp.question_id] !== undefined ? grades[resp.question_id] : ''}
                        onChange={(e) => handleGradeChange(resp.question_id, e.target.value, question?.points || 1)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500 font-bold"
                        style={{
                          borderColor: grades[resp.question_id] > (question?.points || 1)
                            ? 'rgba(239,68,68,0.5)'
                            : 'rgba(255,255,255,0.1)',
                          color: grades[resp.question_id] > (question?.points || 1) ? '#fca5a5' : 'white',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">/ {question?.points || 1}</span>
                  </div>
                )}

                {isQCM && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      Note automatique: {resp.note_attribuee || 0} / {question?.points || 1}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent border-t border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
            <button
              onClick={handleBackToStudents}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmitGrades}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:opacity-50 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Valider la note et finaliser
                </>
              )}
            </button>
          </div>
        </div>

        <div className="h-20"></div>
      </div>
    );
  }

  return null;
};

export default CorrectionExamens;
