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
import './ExamenEnLigne.css';

const ExamenEnLigne = () => {
    // 1. Mock Data : Examen Blanc Hautement Détaillé
    const mockControle = {
        id: "X-2026-RF",
        titre: "Examen Blanc : Fullstack React & Laravel",
        professeur: "Dr. Sarah Connor",
        dureeMinutes: 120,
        questions: [
            {
                id: 1,
                type: "qcm",
                point: 5,
                texte: "Dans React 18, quel est l'avantage principal de l'utilisation de 'useTransition' ?",
                options: [
                    "Réduire la taille du bundle final",
                    "Prioriser les rendus urgents par rapport aux transitions non-urgentes",
                    "Forcer le rendu synchrone de tous les composants",
                    "Remplacer complètement useEffect"
                ]
            },
            {
                id: 2,
                type: "qcm",
                point: 5,
                texte: "Quelle est la commande Laravel pour créer un contrôleur API avec les méthodes CRUD ?",
                options: [
                    "php artisan make:controller ApiController",
                    "php artisan generate:api-controller",
                    "php artisan make:controller -api",
                    "php artisan make:controller Controller --resource --api"
                ]
            },
            {
                id: 3,
                type: "code",
                point: 10,
                texte: "Écrivez un composant React fonctionnel nommé 'ToggleStatus' qui utilise un switch booléen et affiche 'ACTIF' en vert ou 'INACTIF' en rouge.",
                language: "javascript",
                placeholder: "import React, { useState } from 'react';\n\nconst ToggleStatus = () => {\n  // Votre code ici\n};"
            }
        ]
    };

    // 2. States de gestion
    const [timeLeft, setTimeLeft] = useState(mockControle.dureeMinutes * 60);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [responses, setResponses] = useState({});
    const [isBlocked, setIsBlocked] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // 3. Logique du Timer & Auto-Submit
    const handleSubmission = useCallback(() => {
        setIsFinished(true);
        console.log("Examen Soumis :", responses);
    }, [responses]);

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

    // 4. Sécurité Anti-Triche Strict
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

    // 5. Gestion des Réponses
    const setAnswer = (qId, val) => {
        setResponses(prev => ({ ...prev, [qId]: val }));
    };

    // --- Rendus de fin ---
    if (isFinished) {
        return (
            <div className="exam-end-screen">
                <div className="success-card glass-glow">
                    <CheckCircle2 size={80} className="text-cyan animation-pulse" />
                    <h2>MISSION TERMINÉE</h2>
                    <p>Votre copie a été scellée et transmise avec succès.</p>
                    <div className="result-meta">
                        <span>ID SESSION: {mockControle.id}</span>
                        <span>DATE: {new Date().toLocaleDateString()}</span>
                    </div>
                    <button className="btn-sci-primary" onClick={() => window.location.href='/etudiant/houda'}>
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

    const currentQuestion = mockControle.questions[currentIdx];

    return (
        <div className="exam-container-secure">
            {/* HUD Central (Header) */}
            <header className="exam-hud glass-glow">
                <div className="hud-part">
                    <Terminal size={18} className="text-cyan" />
                    <div className="hud-info">
                        <span className="hud-label">COURS</span>
                        <span className="hud-text">{mockControle.titre}</span>
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
                {/* Navigation des questions */}
                <aside className="question-sidebar glass-glow">
                    <h3>INDEX QUESTIONS</h3>
                    <div className="q-grid">
                        {mockControle.questions.map((q, idx) => (
                            <button 
                                key={q.id}
                                className={`q-nav-item ${currentIdx === idx ? 'active' : ''} ${responses[q.id] ? 'answered' : ''}`}
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

                {/* Espace de travail */}
                <section className="work-area glass-glow">
                    <div className="question-header">
                        <span className="q-tag">QUESTION {currentIdx + 1} / {mockControle.totalQuestions || mockControle.questions.length}</span>
                        <span className="q-points">[{currentQuestion.point} PTS]</span>
                    </div>

                    <div className="question-body">
                        <p>{currentQuestion.texte}</p>

                        {currentQuestion.type === "qcm" ? (
                            <div className="qcm-options">
                                {currentQuestion.options.map((opt, i) => (
                                    <label key={i} className={`option-card ${responses[currentQuestion.id] === opt ? 'selected' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name={`q-${currentQuestion.id}`}
                                            checked={responses[currentQuestion.id] === opt}
                                            onChange={() => setAnswer(currentQuestion.id, opt)}
                                        />
                                        <div className="opt-marker"></div>
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="code-editor-interface">
                                <div className="editor-top-bar">
                                    <Monitor size={14} /> <span>ide_terminal.exe</span>
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
                                        placeholder={currentQuestion.placeholder}
                                        value={responses[currentQuestion.id] || ""}
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
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                        >
                            <ChevronLeft /> PRÉCÉDENT
                        </button>
                        <button 
                            disabled={currentIdx === mockControle.questions.length - 1}
                            className="btn-nav next" 
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                        >
                            SUIVANT <ChevronRight />
                        </button>
                    </footer>
                </section>
            </main>

            {/* Alertes de sécurité discrètes */}
            <div className="security-status glass-glow">
                <ShieldAlert size={16} className="text-green flash" />
                <span>SYSTÈME DE SURVEILLANCE : ACTIF</span>
            </div>
        </div>
    );
};

export default ExamenEnLigne;
