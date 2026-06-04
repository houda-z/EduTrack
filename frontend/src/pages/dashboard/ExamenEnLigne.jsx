import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  Lock,
  Send,
  Terminal,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './ExamenEnLigne.css';

const ExamenEnLigne = () => {
  const { nom, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Safety check for ID injection variants including URL search params and router state.
  const searchParams = new URLSearchParams(location.search);
  const queryExamId = searchParams.get('id') || searchParams.get('examId');
  const examId = id || queryExamId || location.state?.examId || location.state?.id;
  const { examTitre, examDuree } = location.state || {};

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return Object.values(value).filter((item) => item !== undefined && item !== null);
  };

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState((examDuree || 60) * 60);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [allExamImages, setAllExamImages] = useState([]);

  const [titre, setTitre] = useState(examTitre || '');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  // Resizable divider state
  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const isDragging = useRef(false);

  // Memoize fetch function with useCallback to prevent re-render loop triggers
  const fetchExam = useCallback(async () => {
    if (!examId) {
      console.error("CRITICAL ERROR: examId parameter is missing or undefined inside the router context.");
      setQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("=== FETCHING EXAM DATA FOR ID: " + examId + " ===");

      // 1. Check Session Availability Status Safely
      const sessionRes = await api.get("/examens/" + examId + "/ma-session").catch((err) => {
        console.warn("Session data retrieval ignored or unauthorized:", err);
        return null;
      });

      const existingSession = sessionRes?.data?.data;
      if (existingSession?.statut === 'soumis') {
        console.log("Session already completed. Redirecting out...");
        navigate(-1);
        return;
      }
      if (existingSession?.statut === 'bloque') {
        console.log("Student session state is explicitly blocked.");
        setIsBlocked(true);
        setQuestions([]);
        setLoading(false);
        return;
      }

      // 2. Load Core Exam Model Payloads
      const response = await api.get("/examens/" + examId);
      console.log("Core API Payload Response Received:", response.data);

      if (response.data && response.data.success) {
        const exam = response.data.data;
        setExamData(exam);
        setTimeLeft((exam.duree_minutes || 60) * 60);

        let aggregated = [];
        const examParties = normalizeArray(exam.parties);
        const examQuestions = normalizeArray(exam.questions);

        // A. Extract from structural modular layout parts
        if (examParties.length > 0) {
          console.log("Parsing sections for questions allocation.");
          examParties.forEach(partie => {
            const partieQuestions = normalizeArray(partie.questions);
            partieQuestions.forEach(q => {
              aggregated.push({
                ...q,
                partieId: partie.id,
                partieTitre: partie.titre
              });
            });
          });
          setParties(examParties);
        }

        // B. Merge direct exam questions (matching the target data state count)
        if (examQuestions.length > 0) {
          console.log("Merging root questions into array stream.");
          examQuestions.forEach(q => {
            if (!aggregated.some(existing => existing.id === q.id)) {
              aggregated.push(q);
            }
          });
        }

        console.log("Final Aggregated Target Array Count Evaluated:", aggregated.length);
        setQuestions(aggregated);

        // Parse layout asset images from all structural modules
        const allImages = [];
        examParties.forEach(p => {
          normalizeArray(p.images).forEach(img => {
            if (img && img.image) allImages.push(img.image);
          });
        });
        aggregated.forEach(q => {
          if (q.file) {
            try {
              const parsed = JSON.parse(q.file);
              if (Array.isArray(parsed)) allImages.push(...parsed);
              else allImages.push(q.file);
            } catch { allImages.push(q.file); }
          }
        });
        setAllExamImages(allImages);
      } else {
        console.error("Payload request succeeded but data object extraction layer failed.");
        setQuestions([]);
      }
    } catch (err) {
      console.error("Fatal Exception inside fetchExam execution context loop:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
      setTimerStarted(true);
    }
  }, [examId, navigate]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // Calculate score and submit
  const handleSubmission = useCallback(async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir livrer le contrôle ? Cette action est irréversible.'
    );
    if (!confirmed) return;

    setIsFinished(true);

    const formattedAnswers = {};
    questions.forEach((q) => {
      if (answers[q.id] !== undefined) {
        formattedAnswers[q.id] = answers[q.id];
      }
    });

    try {
      const response = await api.post('/student/exams/submit', {
        examen_id: examId,
        answers: formattedAnswers,
      });

      if (response.data && response.data.success) {
        let score = 0;
        let totalPoints = 0;
        questions.forEach((q) => {
          totalPoints += q.points || 1;
          if (q.type === 'qcm') {
            const correctChoice = q.choix?.find((c) => c.est_correct);
            if (correctChoice && answers[q.id] === correctChoice.id) {
              score += q.points || 1;
            }
          }
        });

        navigate(`/etudiant/${nom}/examens`, {
          state: {
            examCompleted: true,
            score,
            totalPoints,
            examTitre: titre,
          },
        });
      } else {
        alert('Erreur lors de la soumission. Veuillez réessayer.');
        setIsFinished(false);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
      setIsFinished(false);
    }
  }, [answers, questions, navigate, nom, titre, examId]);

  // Timer — starts only AFTER questions are loaded
  useEffect(() => {
    if (!timerStarted || isFinished || isBlocked) return;
    if (timeLeft <= 0) {
      handleSubmission();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, isFinished, isBlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Anti-cheat: lock session on blur / tab switch
  useEffect(() => {
    const lockSession = async () => {
      if (!isFinished && !isBlocked) {
        setIsBlocked(true);
        try {
          await api.post(`/examens/${examId}/bloquer-session`);
        } catch (err) {
          console.error('Failed to save block status:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) lockSession();
    };

    window.addEventListener('blur', lockSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', lockSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFinished, isBlocked, examId]);

  // Resizable divider handlers
  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const container = document.getElementById('exam-layout');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth > 30 && newWidth < 75) setLeftWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const setAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };



  // ── Guard renders ──────────────────────────────────────────────────────────
  if (!examId) return null;

  if (loading || questions === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b1329] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400 mb-4"></div>
        <p className="text-emerald-400 font-medium tracking-wide">Chargement de l'examen...</p>
        <p className="text-slate-500 text-xs mt-1">Récupération des questions et des ressources en cours...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="exam-end-screen">
        <div className="success-card glass-glow">
          <CheckCircle2 size={80} className="text-cyan animation-pulse" />
          <h2>MISSION TERMINÉE</h2>
          <p>Votre copie a été scellée et transmise avec succès.</p>
          <div className="result-meta">
            <span>ID SESSION: {examId}</span>
            <span>DATE: {new Date().toLocaleDateString()}</span>
          </div>
          <button className="btn-sci-primary" onClick={() => navigate(`/etudiant/${nom}/examens`)}>
            RETOUR AU PORTAIL
          </button>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="blocked-overlay">
        <div className="alert-box glass-glow border-red">
          <Lock size={100} className="text-red animation-shake" />
          <h1 className="text-red">SESSION BLOQUÉE</h1>
          <div className="alert-cyber-text">
            TENTATIVE DE FRAUDE DÉTECTÉE : SORTIE DU FOCUS NAVIGATEUR
          </div>
          <p>Votre examen a été gelé. Contactez immédiatement l'enseignant pour une levée de sanction.</p>
          <div className="security-code">ERROR_CODE_403_STU</div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (Array.isArray(questions) && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b1329] text-center p-6 text-white">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <h2 className="text-xl font-bold text-red-400 mb-2">Aucune question disponible</h2>
          <p className="text-slate-400 text-sm mb-6">L'examen est en cours de configuration. Contactez votre formateur.</p>
          <button onClick={() => navigate(-1)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
            RETOUR
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const typeBadgeLabel =
    currentQuestion.type === 'qcm' ? 'QCM' :
      currentQuestion.type === 'code' ? 'CODE' :
        currentQuestion.type === 'commande' ? 'COMMANDE' : 'TEXTE';

  // ── Main exam UI ───────────────────────────────────────────────────────────
  return (
    <div className="exam-container-secure">
      {/* Top HUD */}
      <header className="exam-hud glass-glow">
        <div className="hud-part">
          <Terminal size={18} className="text-cyan" />
          <div className="hud-info">
            <span className="hud-label">EXAMEN</span>
            <span className="hud-text">{titre}</span>
          </div>
        </div>

        <div className={`hud-timer ${timeLeft < 300 ? 'urgent' : ''}`}>
          <Clock size={24} />
          <span className="timer-neon">{formatTime(timeLeft)}</span>
        </div>

        <div className="hud-part align-right">
          <button className="btn-submit-cyber" onClick={handleSubmission}>
            <Send size={16} /> SOUMETTRE
          </button>
        </div>
      </header>

      {/* Two-column resizable layout */}
      <div
        id="exam-layout"
        className="exam-two-col-layout"
        style={{ userSelect: isDragging.current ? 'none' : 'auto' }}
      >
        {/* LEFT COLUMN */}
        <div
          className="exam-left-col glass-glow"
          style={{ width: `${leftWidth}%`, flexShrink: 0 }}
        >
          {parties.length > 0 ? (
            // New parties system
            parties.map((partie, pIdx) => (
              <div key={partie.id} className="partie-section mb-6 pb-6 border-b border-white/5">
                {/* Partie title */}
                <div className="partie-title mb-3">
                  <h3 className="text-cyan-400 font-extrabold text-sm uppercase tracking-wider">{partie.titre}</h3>
                </div>

                {/* Partie introduction */}
                {partie.introduction && (
                  <div className="exam-intro-banner mb-3 p-3 rounded bg-white/3 border border-white/5">
                    <div className="exam-intro-label text-[10px] text-slate-500 font-bold uppercase">📋 Consignes</div>
                    <p className="text-xs text-slate-400">{partie.introduction}</p>
                  </div>
                )}

                {/* Partie images */}
                {partie.images && partie.images.length > 0 && (
                  <div className="exam-images-section flex flex-col gap-2 mb-3">
                    {partie.images.map((img, i) => (
                      <img key={i} src={img.image} alt={`img-${i}`} className="question-image w-full max-h-48 object-contain rounded border border-white/5" />
                    ))}
                  </div>
                )}

                {/* Partie tableau */}
                {partie.tableau && partie.tableau.headers && partie.tableau.headers.length > 0 && (
                  <div className="partie-tableau overflow-x-auto mb-4 p-2 bg-slate-950/40 rounded border border-white/5">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-bold">
                          {partie.tableau.headers.map((h, i) => <th key={i} className="py-2 px-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {partie.tableau.rows.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            {row.map((cell, j) => <td key={j} className="py-2 px-3 text-slate-300 font-semibold">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Partie questions list */}
                <div className="questions-list space-y-1">
                  {partie.questions.map((q, qIdx) => {
                    const globalIdx = questions.findIndex(gq => gq.id === q.id);
                    return (
                      <div key={q.id}
                        onClick={() => setCurrentIdx(globalIdx)}
                        className={`question-list-item ${currentIdx === globalIdx ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}>
                        <span className="q-number">{qIdx + 1}.</span>
                        <span className="q-enonce">{q.enonce}</span>
                        {answers[q.id] !== undefined && <span className="q-check">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Old system fallback
            <>
              {/* Introduction banner */}
              {examData?.introduction && (
                <div className="exam-intro-banner mb-4">
                  <div className="exam-intro-label">📋 CONSIGNES</div>
                  <p>{examData.introduction}</p>
                </div>
              )}

              {/* Images — fixed for the whole exam */}
              {allExamImages.length > 0 && (
                <div className="exam-images-section mb-4">
                  {allExamImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`img-${i + 1}`}
                      className="question-image"
                    />
                  ))}
                </div>
              )}

              {/* Questions list */}
              <div className="questions-list">
                <div className="questions-list-header">LISTE DES QUESTIONS</div>
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`question-list-item ${currentIdx === idx ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
                  >
                    <span className="q-number">{idx + 1}.</span>
                    <span className="q-enonce">{q.enonce}</span>
                    {answers[q.id] !== undefined && <span className="q-check">✓</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* DIVIDER */}
        <div
          className="exam-divider"
          onMouseDown={handleMouseDown}
        />

        {/* RIGHT COLUMN */}
        <div
          className="exam-right-col"
          style={{ flex: 1, minWidth: 0 }}
        >
          {/* Question header */}
          <div className="question-header">
            <span className="q-tag">
              Question {currentIdx + 1} / {questions.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="q-type-badge">{typeBadgeLabel}</span>
              <span className="q-points">[{currentQuestion.points || 0} PTS]</span>
            </div>
          </div>

          {/* Answer zone */}
          <div className="question-body">
            {/* Enonce (shown in right column for context) */}
            <p className="question-enonce">{currentQuestion.enonce}</p>

            {/* QCM */}
            {currentQuestion.type === 'qcm' && (
              <div className="qcm-options">
                {(currentQuestion.choix || []).map((choice) => (
                  <label
                    key={choice.id}
                    className={`option-card ${answers[currentQuestion.id] === choice.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      value={choice.id}
                      checked={answers[currentQuestion.id] === choice.id}
                      onChange={() => setAnswer(currentQuestion.id, choice.id)}
                    />
                    <div className="opt-marker" />
                    <span>{choice.texte}</span>
                  </label>
                ))}
              </div>
            )}

            {/* CODE */}
            {currentQuestion.type === 'code' && (
              <div className="code-editor-interface">
                <div className="editor-top-bar">
                  <Monitor size={14} />
                  <span>● solution.js</span>
                </div>
                <div className="editor-wrappers">
                  <div className="editor-lines">
                    {Array.from({ length: 15 }, (_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    className="styled-code-area"
                    spellCheck={false}
                    placeholder="Écrivez votre code ici...."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    rows={15}
                  />
                </div>
              </div>
            )}

            {/* TEXTE */}
            {currentQuestion.type === 'texte' && (
              <div className="text-answer-wrapper">
                <textarea
                  className="text-answer-textarea"
                  placeholder="Rédigez votre réponse ici..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                  rows={8}
                />
              </div>
            )}

            {/* COMMANDE */}
            {currentQuestion.type === 'commande' && (
              <div className="commande-editor">
                <div className="terminal-header">
                  <span className="terminal-dot red"></span>
                  <span className="terminal-dot yellow"></span>
                  <span className="terminal-dot green"></span>
                  <span className="terminal-title">bash terminal</span>
                </div>
                <div className="terminal-body font-mono">
                  <span className="terminal-prompt">$ </span>
                  <textarea
                    className="terminal-input"
                    placeholder="Tapez votre commande ici..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                    rows={5}
                    spellCheck={false}
                    style={{
                      fontFamily: 'monospace',
                      background: 'transparent',
                      color: '#22d3ee',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      resize: 'vertical',
                      lineHeight: '1.6'
                    }}
                  />
                </div>
              </div>
            )}
          </div>


        </div>
      </div>


    </div>
  );
};

export default ExamenEnLigne;
