import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ShieldAlert,
  Lock,
  Send,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './ExamenEnLigne.css';

const ExamenEnLigne = () => {
  const { nom } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { examId, examTitre, examDuree } = location.state || {};

  const [timeLeft, setTimeLeft] = useState(examDuree ? examDuree * 60 : 0);
  const [titre, setTitre] = useState(examTitre || '');
  const [dureeMinutes, setDureeMinutes] = useState(examDuree || 0);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) {
      navigate(`/etudiant/${nom}/examens`);
      return;
    }
    fetchExam();
  }, [examId, nom, navigate]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/examens/${examId}`);
      if (response.data && response.data.success) {
        const exam = response.data.data;
        setQuestions(exam.questions || []);
        const duration = exam.duree_minutes || examDuree || 60;
        setDureeMinutes(duration);
        setTimeLeft(duration * 60);
        setTitre(exam.titre || examTitre || 'Examen en ligne');
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = useCallback(async () => {
    setIsFinished(true);
    if (examId) {
      try {
        await api.post(`/examens/${examId}/soumettre`, { answers });
      } catch (err) {
        console.error('Error submitting exam:', err);
      }
    }
    navigate(`/etudiant/${nom}/examens`);
  }, [answers, examId, navigate, nom]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmission();
      return;
    }
    if (isFinished || isBlocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isBlocked, handleSubmission]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const lockSession = () => {
      if (!isFinished) {
        setIsBlocked(true);
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
  }, [isFinished]);

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  if (!examId) {
    return null;
  }

  if (loading) {
    return (
      <div className="exam-end-screen">
        <div className="success-card glass-glow">
          <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <h2>Chargement de l'examen...</h2>
        </div>
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

  const currentQuestion = questions[currentIdx] || {};

  return (
    <div className="exam-container-secure">
      <header className="exam-hud glass-glow">
        <div className="hud-part">
          <Terminal size={18} className="text-cyan" />
          <div className="hud-info">
            <span className="hud-label">COURS</span>
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

      <main className="exam-main-layout">
        <aside className="question-sidebar glass-glow">
          <h3>INDEX QUESTIONS</h3>
          <div className="q-grid">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                className={`q-nav-item ${currentIdx === idx ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                onClick={() => setCurrentIdx(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="sidebar-legend">
            <div className="l-item"><span className="dot active"></span> Actuel</div>
            <div className="l-item"><span className="dot answered"></span> Répondu</div>
          </div>
        </aside>

        <section className="work-area glass-glow">
          <div className="question-header">
            <span className="q-tag">QUESTION {currentIdx + 1} / {questions.length}</span>
            <span className="q-points">[{currentQuestion.points || 0} PTS]</span>
          </div>

          <div className="question-body">
            <p>{currentQuestion.enonce}</p>

            {currentQuestion.type === 'qcm' ? (
              <div className="qcm-options">
                {(currentQuestion.choix || []).map((choice) => (
                  <label key={choice.id} className={`option-card ${answers[currentQuestion.id] === choice.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === choice.id}
                      onChange={() => setAnswer(currentQuestion.id, choice.id)}
                    />
                    <div className="opt-marker"></div>
                    <span>{choice.texte}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="code-editor-interface">
                <div className="editor-top-bar">
                  <Monitor size={14} /> <span>{currentQuestion.type === 'texte' ? 'Réponse texte libre' : 'ide_terminal.exe'}</span>
                </div>
                <div className="editor-wrappers">
                  <div className="editor-lines">
                    {[...Array(15)].map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    className="styled-code-area"
                    spellCheck="false"
                    placeholder={currentQuestion.type === 'texte' ? 'Tapez votre réponse ici...' : currentQuestion.placeholder || 'Écrivez votre code ici...'}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <footer className="work-footer">
            <button
              disabled={currentIdx === 0}
              className="btn-nav"
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            >
              <ChevronLeft /> PRÉCÉDENT
            </button>
            <button
              disabled={currentIdx === questions.length - 1}
              className="btn-nav next"
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            >
              SUIVANT <ChevronRight />
            </button>
          </footer>
        </section>
      </main>

      <div className="security-status glass-glow">
        <ShieldAlert size={16} className="text-green flash" />
        <span>SYSTÈME DE SURVEILLANCE : ACTIF</span>
      </div>
    </div>
  );
};

export default ExamenEnLigne;
