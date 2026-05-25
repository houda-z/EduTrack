import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  PlusCircle,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  X,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import api from '../../services/api';

const Examens = () => {
  const [exams, setExams] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal forms state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Create Examen Fields
  const [titre, setTitre] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [groupeId, setGroupeId] = useState('');
  const [dateExamen, setDateExamen] = useState('');
  const [dureeHeures, setDureeHeures] = useState('1');
  const [dureeMinutes, setDureeMinutes] = useState('0');
  const [typeExamen, setTypeExamen] = useState('qcm');
  const [statutExamen, setStatutExamen] = useState('brouillon');
  const [questions, setQuestions] = useState([]);

  // Question Form Helpers
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [currentQuestionType, setCurrentQuestionType] = useState('qcm');
  const [currentQuestionPoints, setCurrentQuestionPoints] = useState('1');
  const [currentChoices, setCurrentChoices] = useState([
    { texte: '', est_correct: false },
    { texte: '', est_correct: false },
    { texte: '', est_correct: false },
    { texte: '', est_correct: false }
  ]);
  const [currentExpectedOutput, setCurrentExpectedOutput] = useState('');
  const [currentQuestionImage, setCurrentQuestionImage] = useState(null); // base64 for wizard

  // For adding questions to existing exam
  const [addQuestionText, setAddQuestionText] = useState('');
  const [addQuestionType, setAddQuestionType] = useState('qcm');
  const [addQuestionPoints, setAddQuestionPoints] = useState('1');
  const [addQuestionChoices, setAddQuestionChoices] = useState([
    { texte: '', est_correct: false },
    { texte: '', est_correct: false },
    { texte: '', est_correct: false },
    { texte: '', est_correct: false }
  ]);
  const [addQuestionExpectedOutput, setAddQuestionExpectedOutput] = useState('');
  const [addQuestionImage, setAddQuestionImage] = useState(null); // base64 for add modal
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addQuestionMessage, setAddQuestionMessage] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/examens');
      if (res.data && res.data.success) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.warn("API error fetching exams, loading mock:", err);
      setError("Connexion API impossible. Affichage des données fictives.");
      setExams([
        {
          id: 1,
          titre: "Examen Final Algorithmes & Structures",
          filiere: { nom: "Développement Digital" },
          groupe: { nom: "DEV-101" },
          date_examen: "2026-05-24T09:00:00",
          duree_minutes: 120,
          type: "mixte",
          statut: "publie",
          questions: [
            { id: 1, enonce: "Qu'est-ce qu'une complexité O(n log n) ?", type: "qcm" }
          ],
          results: { participants_count: 14, average_score: 13.8 }
        },
        {
          id: 2,
          titre: "Validation module Architecture React",
          filiere: { nom: "Développement Digital" },
          groupe: { nom: "DEV-102" },
          date_examen: "2026-05-28T14:30:00",
          duree_minutes: 60,
          type: "qcm",
          statut: "brouillon",
          questions: [],
          results: { participants_count: 0, average_score: 0 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const filRes = await api.get('/filieres');
      setFilieres(filRes.data || []);
      const grpRes = await api.get('/groupes');
      setGroupes(grpRes.data.data || []);
    } catch (err) {
      console.warn("API Metadata load failure, using mocks:", err);
      setFilieres([
        { id: 1, nom: "Développement Digital" },
        { id: 2, nom: "Systèmes d'Information" }
      ]);
      setGroupes([
        { id: 1, nom: "DEV-101", filiere_id: 1 },
        { id: 2, nom: "DEV-102", filiere_id: 1 },
        { id: 3, nom: "SI-201", filiere_id: 2 }
      ]);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchMetadata();
  }, []);

  // Utility function to format duration display
  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (remaining === 0) return `${hours}h`;
    return `${hours}h ${remaining}min`;
  };

  // Utility function to calculate total minutes from hours/minutes
  const calculateTotalMinutes = () => {
    const h = parseInt(dureeHeures) || 0;
    const m = parseInt(dureeMinutes) || 0;
    return (h * 60) + m;
  };

  const handleAddQuestionToWizard = () => {
    if (!currentQuestionText) {
      alert("L'énoncé de la question est obligatoire.");
      return;
    }

    let newQ = {
      enonce: currentQuestionText,
      type: currentQuestionType,
      points: parseFloat(currentQuestionPoints) || 1,
      choix: [],
      expected_output: '',
      ...(currentQuestionImage ? { image_base64: currentQuestionImage } : {})
    };

    if (currentQuestionType === 'qcm') {
      // Validate choices
      const hasEmptyChoice = currentChoices.some(c => !c.texte);
      const hasCorrectChoice = currentChoices.some(c => c.est_correct);

      if (hasEmptyChoice) {
        alert("Veuillez remplir les 4 choix de réponse.");
        return;
      }
      if (!hasCorrectChoice) {
        alert("Veuillez sélectionner au moins une bonne réponse.");
        return;
      }

      newQ.choix = [...currentChoices];
    } else if (currentQuestionType === 'code') {
      if (!currentExpectedOutput) {
        alert("Veuillez spécifier le résultat attendu pour le code.");
        return;
      }
      newQ.expected_output = currentExpectedOutput;
    }
    // For 'texte' type, no extra validation needed

    setQuestions(prev => [...prev, newQ]);

    // Reset question inputs
    setCurrentQuestionText('');
    setCurrentQuestionPoints('1');
    setCurrentQuestionType('qcm');
    setCurrentExpectedOutput('');
    setCurrentQuestionImage(null);
    setCurrentChoices([
      { texte: '', est_correct: false },
      { texte: '', est_correct: false },
      { texte: '', est_correct: false },
      { texte: '', est_correct: false }
    ]);
  };

  const handleImageToBase64 = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveQuestionFromWizard = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateExamenSubmit = async (e) => {
    e.preventDefault();
    const totalMinutes = calculateTotalMinutes();
    if (!titre || !filiereId || !groupeId || !dateExamen || totalMinutes <= 0) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    const payload = {
      titre,
      filiere_id: parseInt(filiereId),
      groupe_id: parseInt(groupeId),
      date_examen: dateExamen,
      duree_minutes: totalMinutes,
      type: typeExamen,
      statut: statutExamen,
      questions: questions
    };

    try {
      const res = await api.post('/examens', payload);
      if (res.data && res.data.success) {
        alert("Examen créé avec succès !");
        setIsCreateModalOpen(false);
        // Reset form
        setTitre('');
        setFiliereId('');
        setGroupeId('');
        setDateExamen('');
        setDureeHeures('1');
        setDureeMinutes('0');
        setQuestions([]);
        fetchExams();
      }
    } catch (err) {
      console.warn("API Exam create fail, fallback to mock add:", err);
      // Simulate locally
      const mockExam = {
        id: Math.floor(Math.random() * 1000),
        titre,
        filiere: filieres.find(f => f.id === parseInt(filiereId)) || { nom: "Filière Cible" },
        groupe: groupes.find(g => g.id === parseInt(groupeId)) || { nom: "Groupe Cible" },
        date_examen: dateExamen,
        duree_minutes: totalMinutes,
        type: typeExamen,
        statut: statutExamen,
        questions: questions
      };
      setExams(prev => [mockExam, ...prev]);
      setIsCreateModalOpen(false);
      alert("Examen créé (simulation locale).");
    }
  };

  const handleDeleteExamen = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ?")) return;
    try {
      await api.delete(`/examens/${id}`);
      fetchExams();
    } catch (err) {
      setExams(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleChangeExamStatut = async (examId, newStatut) => {
    try {
      const res = await api.patch(`/examens/${examId}/statut`, { statut: newStatut });
      if (res.data && res.data.success) {
        alert(`Examen ${newStatut} avec succès !`);
        fetchExams();
      }
    } catch (err) {
      console.error("Error changing exam status:", err);
      alert("Erreur lors du changement du statut.");
    }
  };

  const handleOpenAddQuestionModal = (exam) => {
    setSelectedExam(exam);
    setIsAddQuestionModalOpen(true);
    // Reset form
    setAddQuestionText('');
    setAddQuestionType('qcm');
    setAddQuestionPoints('1');
    setAddQuestionExpectedOutput('');
    setAddQuestionImage(null);
    setAddQuestionChoices([
      { texte: '', est_correct: false },
      { texte: '', est_correct: false },
      { texte: '', est_correct: false },
      { texte: '', est_correct: false }
    ]);
    setAddQuestionMessage(null);
  };

  const handleAddQuestionChoiceTextChange = (idx, text) => {
    setAddQuestionChoices(prev => prev.map((choice, i) => i === idx ? { ...choice, texte: text } : choice));
  };

  const handleAddQuestionChoiceCorrectChange = (idx) => {
    setAddQuestionChoices(prev => prev.map((choice, i) => i === idx ? { ...choice, est_correct: true } : { ...choice, est_correct: false }));
  };

  const handleSubmitAddQuestion = async (e) => {
    e.preventDefault();
    if (!addQuestionText) {
      setAddQuestionMessage({ type: 'error', text: "L'énoncé de la question est obligatoire." });
      return;
    }

    let payload = {
      enonce: addQuestionText,
      type: addQuestionType,
      points: parseFloat(addQuestionPoints) || 1,
      ...(addQuestionImage ? { image_base64: addQuestionImage } : {})
    };

    if (addQuestionType === 'qcm') {
      const hasEmptyChoice = addQuestionChoices.some(c => !c.texte);
      const hasCorrectChoice = addQuestionChoices.some(c => c.est_correct);

      if (hasEmptyChoice) {
        setAddQuestionMessage({ type: 'error', text: "Veuillez remplir les 4 choix de réponse." });
        return;
      }
      if (!hasCorrectChoice) {
        setAddQuestionMessage({ type: 'error', text: "Veuillez sélectionner au moins une bonne réponse." });
        return;
      }

      payload.choix = [...addQuestionChoices];
    } else if (addQuestionType === 'code') {
      if (!addQuestionExpectedOutput) {
        setAddQuestionMessage({ type: 'error', text: "Veuillez spécifier le résultat attendu pour le code." });
        return;
      }
      payload.expected_output = addQuestionExpectedOutput;
    }
    // For 'texte' type, no additional validation needed

    setAddingQuestion(true);
    try {
      const res = await api.post(`/examens/${selectedExam.id}/questions`, payload);
      if (res.data && res.data.success) {
        setAddQuestionMessage({ type: 'success', text: 'Question ajoutée avec succès !' });
        setTimeout(() => {
          setIsAddQuestionModalOpen(false);
          fetchExams();
        }, 1500);
      }
    } catch (err) {
      console.error("Error adding question:", err);
      setAddQuestionMessage({ type: 'error', text: "Erreur lors de l'ajout de la question." });
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleOpenResultsModal = async (exam) => {
    setSelectedExam(exam);
    setIsResultsModalOpen(true);
    setLoadingResults(true);
    try {
      const res = await api.get(`/examens/${exam.id}/resultats`);
      if (res.data && res.data.success) {
        setResultsData(res.data.data);
      }
    } catch (err) {
      console.warn("API results error, showing mock:", err);
      setResultsData({
        participants_count: 12,
        average_score: 14.25,
        results: [
          { session_id: 1, nom: "Zouhair", prenom: "Houda", statut: "soumis", score: 15.5, started_at: "2026-05-24 09:00", finished_at: "2026-05-24 10:45", nb_sorties: 0 },
          { session_id: 2, nom: "Benjelloun", prenom: "Mehdi", statut: "soumis", score: 17, started_at: "2026-05-24 09:01", finished_at: "2026-05-24 10:15", nb_sorties: 1 },
          { session_id: 3, nom: "Tazi", prenom: "Imane", statut: "bloque", score: 4.5, started_at: "2026-05-24 09:05", finished_at: null, nb_sorties: 5 }
        ]
      });
    } finally {
      setLoadingResults(false);
    }
  };

  const handleChoiceTextChange = (idx, text) => {
    setCurrentChoices(prev => prev.map((choice, i) => i === idx ? { ...choice, texte: text } : choice));
  };

  const handleChoiceCorrectChange = (idx) => {
    // Exclusif (QCM radio behavior or checkbox behavior)
    setCurrentChoices(prev => prev.map((choice, i) => i === idx ? { ...choice, est_correct: true } : { ...choice, est_correct: false }));
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">EXAMENS</h2>
          <p className="text-slate-400 text-sm mt-1">Créez et administrez des QCM ou des tests techniques en direct.</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          Créer un Examen
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest">Chargement des examens...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-bold border border-dashed border-white/10 rounded-2xl bg-white/2">
              <ClipboardList size={40} className="mx-auto text-slate-600 mb-3" />
              Aucun examen programmé. Cliquez sur "Créer un Examen" pour en ajouter un.
            </div>
          ) : (
            exams.map(exam => {
              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {exam.filiere ? exam.filiere.nom : 'Filière'}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {exam.groupe ? exam.groupe.nom : 'Groupe'}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-widest uppercase ${exam.statut === 'publie' || exam.statut === 'actif'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : exam.statut === 'termine'
                          ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                        {exam.statut}
                      </span>
                    </div>

                    {/* Examen Title */}
                    <h3 className="text-base md:text-lg font-black text-white group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">{exam.titre}</h3>

                    {/* Config detail items */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400 py-3 border-t border-b border-white/5 my-4">
                      <div className="flex items-center gap-1.5"><Calendar size={13} className="text-cyan-400" /> {exam.date_examen ? new Date(exam.date_examen).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Non planifié'}</div>
                      <div className="flex items-center gap-1.5"><Clock size={13} className="text-indigo-400" /> {formatDuration(exam.duree_minutes || exam.duree || 0)}</div>
                      <div className="flex items-center gap-1.5 uppercase font-bold text-[10.5px]"><HelpCircle size={13} className="text-purple-400" /> {exam.questions ? exam.questions.length : 0} questions</div>
                      <div className="flex items-center gap-1.5 uppercase font-bold text-[10.5px]"><Award size={13} className="text-yellow-400" /> Type: {exam.type}</div>
                    </div>
                  </div>

                  {/* Results preview / bottom actions */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    {/* Status change buttons */}
                    <div className="flex flex-wrap gap-2">
                      {exam.statut === 'brouillon' && (
                        <button
                          onClick={() => handleChangeExamStatut(exam.id, 'publie')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1"
                        >
                          ▶ Publier
                        </button>
                      )}
                      {exam.statut === 'publie' && (
                        <>
                          <button
                            onClick={() => handleChangeExamStatut(exam.id, 'brouillon')}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 text-xs font-bold text-yellow-300 transition-all flex items-center gap-1"
                          >
                            ⏸ Brouillon
                          </button>
                          <button
                            onClick={() => handleChangeExamStatut(exam.id, 'termine')}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-xs font-bold text-red-300 transition-all flex items-center gap-1"
                          >
                            ⏹ Terminer
                          </button>
                        </>
                      )}
                      {exam.statut === 'termine' && (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-xs font-bold text-slate-300">
                          Terminé
                        </span>
                      )}
                    </div>

                    {/* Main action buttons */}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleOpenAddQuestionModal(exam)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-xs font-bold text-indigo-300 transition-all flex items-center gap-1"
                      >
                        ➕ Ajouter question
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenResultsModal(exam)}
                          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-cyan-300 transition-all flex items-center gap-1"
                        >
                          <Users size={12} />
                          Résultats
                        </button>
                        <button
                          onClick={() => handleDeleteExamen(exam.id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-400 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Results preview */}
                    <div className="flex gap-4 text-[11px] font-bold text-slate-500 pt-2 border-t border-white/5">
                      <div className="flex flex-col">
                        <span>Participants</span>
                        <span className="text-white font-extrabold text-xs">{exam.results?.participants_count || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Moyenne</span>
                        <span className="text-cyan-400 font-extrabold text-xs">{exam.results?.average_score ? `${exam.results.average_score}/20` : '—'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: EXAM RESULTS LIST */}
      {isResultsModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[80vh] overflow-y-auto">

            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div>
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">Résultats de l'Examen</span>
                <h3 className="text-lg md:text-xl font-black text-white">{selectedExam.titre}</h3>
              </div>
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {loadingResults ? (
              <div className="py-16 flex justify-center">
                <div className="w-8 h-8 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Summary boxes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre de participants</span>
                    <span className="text-lg font-black text-white mt-1 block">{resultsData ? resultsData.participants_count : 0}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/2 border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Moyenne Générale Classe</span>
                    <span className="text-lg font-black text-cyan-400 mt-1 block">{resultsData ? `${resultsData.average_score}/20` : '0/20'}</span>
                  </div>
                </div>

                {/* Table of results */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Étudiant</th>
                        <th className="py-3 px-2">Statut</th>
                        <th className="py-3 px-2">Sorties d'écran</th>
                        <th className="py-3 px-2">Heure Début</th>
                        <th className="py-3 px-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData && resultsData.results.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500 font-bold">Aucun participant n'a encore passé cet examen.</td>
                        </tr>
                      ) : (
                        resultsData && resultsData.results.map(row => (
                          <tr key={row.session_id} className="border-b border-white/5 hover:bg-white/2 transition-colors font-medium">
                            <td className="py-3.5 px-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center font-bold text-cyan-400">
                                {row.prenom ? row.prenom[0] : 'E'}
                              </div>
                              <span className="text-white font-bold">{row.prenom} {row.nom}</span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${row.statut === 'soumis'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : row.statut === 'bloque'
                                  ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                }`}>
                                {row.statut}
                              </span>
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`font-bold ${row.nb_sorties > 2 ? 'text-red-400' : 'text-slate-400'}`}>
                                {row.nb_sorties} {row.nb_sorties > 2 ? '(Suspicion triche)' : ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-slate-500 font-semibold">{row.started_at || 'Non démarré'}</td>
                            <td className="py-3.5 px-2 text-right">
                              <span className="text-sm font-black text-cyan-400">{row.score !== null ? `${row.score}/20` : 'Non corrigé'}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE EXAMEN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateExamenSubmit}
            className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up"
          >

            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-black text-white">Nouveau Plan d'Examen</h3>
                <p className="text-xs text-slate-400">Configurez les paramètres globaux et composez vos questions.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step 1: Params */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Titre Examen</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Évaluation finale Javascript..."
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filière</label>
                  <select
                    required
                    value={filiereId}
                    onChange={(e) => setFiliereId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="">Sélectionner...</option>
                    {filieres.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Groupe</label>
                  <select
                    required
                    value={groupeId}
                    onChange={(e) => setGroupeId(e.target.value)}
                    disabled={!filiereId}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold disabled:opacity-50"
                  >
                    <option value="">Sélectionner...</option>
                    {groupes.filter(g => g.filiere_id === parseInt(filiereId)).map(g => (
                      <option key={g.id} value={g.id}>{g.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date Examen</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateExamen}
                    onChange={(e) => setDateExamen(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Durée</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold">Heures</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="12"
                        value={dureeHeures}
                        onChange={(e) => setDureeHeures(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold">Minutes</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="59"
                        step="5"
                        value={dureeMinutes}
                        onChange={(e) => setDureeMinutes(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <select
                    value={typeExamen}
                    onChange={(e) => setTypeExamen(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="qcm">QCM uniquement</option>
                    <option value="code">Test Pratique de Code</option>
                    <option value="mixte">Mixte (QCM & Code)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Statut Initial</label>
                  <select
                    value={statutExamen}
                    onChange={(e) => setStatutExamen(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié immédiatement</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Question builder panel */}
            <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-cyan-400 border-b border-white/5 pb-2">Créateur de Questions</h4>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Énoncé / Consigne</label>
                    <input
                      type="text"
                      placeholder="Tapez la question..."
                      value={currentQuestionText}
                      onChange={(e) => setCurrentQuestionText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Points</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={currentQuestionPoints}
                        onChange={(e) => setCurrentQuestionPoints(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Format</label>
                      <select
                        value={currentQuestionType}
                        onChange={(e) => setCurrentQuestionType(e.target.value)}
                        className="w-full px-2 py-2 rounded-lg bg-slate-800 border border-white/10 text-[11px] text-white focus:outline-none"
                      >
                        <option value="qcm">QCM</option>
                        <option value="code">Code</option>
                        <option value="texte">Réponse texte libre</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Image upload — wizard */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Image illustrative (optionnelle)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageToBase64(e.target.files[0], setCurrentQuestionImage)}
                    className="block w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:text-cyan-300 file:font-bold hover:file:bg-cyan-500/20 file:cursor-pointer cursor-pointer"
                  />
                  {currentQuestionImage && (
                    <div className="relative mt-2 inline-block">
                      <img src={currentQuestionImage} alt="preview" className="max-h-28 rounded-lg border border-white/10 object-contain" />
                      <button type="button" onClick={() => setCurrentQuestionImage(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500">×</button>
                    </div>
                  )}
                </div>

                {/* Conditional choices based on format */}
                {currentQuestionType === 'qcm' ? (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Options de réponses (Sélectionnez la case correcte)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentChoices.map((choice, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/2 border border-white/5">
                          <input
                            type="radio"
                            name="correct-choice-radio"
                            checked={choice.est_correct}
                            onChange={() => handleChoiceCorrectChange(idx)}
                            className="cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder={`Choix ${idx + 1}...`}
                            value={choice.texte}
                            onChange={(e) => handleChoiceTextChange(idx, e.target.value)}
                            className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : currentQuestionType === 'code' ? (
                  <div className="space-y-1 pt-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block">Résultat / Console attendue</label>
                    <textarea
                      rows="2"
                      placeholder="Ex. 42 / Hello World / true..."
                      value={currentExpectedOutput}
                      onChange={(e) => setCurrentExpectedOutput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleAddQuestionToWizard}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1 ml-auto"
                >
                  <Plus size={14} />
                  Insérer Question
                </button>
              </div>
            </div>

            {/* List of currently created wizard questions */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Questions de l'examen ({questions.length})</label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {questions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-600 font-bold border border-dashed border-white/5 rounded-xl">Aucune question insérée. Utilisez le panneau ci-dessus pour composer l'évaluation.</div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/2 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-[10px] text-indigo-400 mr-2">Q{idx + 1} ({q.points} pts) - {q.type.toUpperCase()}</span>
                        <span className="text-white font-semibold">{q.enonce}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionFromWizard(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
              >
                Enregistrer l'Examen
              </button>
            </div>

          </form>
        </div>
      )}
      {/* MODAL 3: ADD QUESTION TO EXISTING EXAM */}
      {isAddQuestionModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitAddQuestion}
            className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up"
          >

            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-black text-white">Ajouter une Question</h3>
                <p className="text-xs text-slate-400">À l'examen: <span className="text-cyan-300">{selectedExam.titre}</span></p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status message */}
            {addQuestionMessage && (
              <div className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${addQuestionMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                <span className={`w-2 h-2 rounded-full ${addQuestionMessage.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`}></span>
                {addQuestionMessage.text}
              </div>
            )}

            {/* Question form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Énoncé / Consigne</label>
                  <input
                    type="text"
                    placeholder="Tapez la question..."
                    value={addQuestionText}
                    onChange={(e) => setAddQuestionText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Points</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={addQuestionPoints}
                      onChange={(e) => setAddQuestionPoints(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Format</label>
                    <select
                      value={addQuestionType}
                      onChange={(e) => setAddQuestionType(e.target.value)}
                      className="w-full px-2 py-2 rounded-lg bg-slate-800 border border-white/10 text-[11px] text-white focus:outline-none"
                    >
                      <option value="qcm">QCM</option>
                      <option value="code">Code</option>
                      <option value="texte">Réponse texte libre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Image upload — add question modal */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Image illustrative (optionnelle)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageToBase64(e.target.files[0], setAddQuestionImage)}
                  className="block w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:text-cyan-300 file:font-bold hover:file:bg-cyan-500/20 file:cursor-pointer cursor-pointer"
                />
                {addQuestionImage && (
                  <div className="relative mt-2 inline-block">
                    <img src={addQuestionImage} alt="preview" className="max-h-28 rounded-lg border border-white/10 object-contain" />
                    <button type="button" onClick={() => setAddQuestionImage(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500">×</button>
                  </div>
                )}
              </div>

              {/* Conditional fields based on question type */}
              {addQuestionType === 'qcm' ? (
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Options de réponses (Sélectionnez la case correcte)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addQuestionChoices.map((choice, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/2 border border-white/5">
                        <input
                          type="radio"
                          name="add-correct-choice-radio"
                          checked={choice.est_correct}
                          onChange={() => handleAddQuestionChoiceCorrectChange(idx)}
                          className="cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder={`Choix ${idx + 1}...`}
                          value={choice.texte}
                          onChange={(e) => handleAddQuestionChoiceTextChange(idx, e.target.value)}
                          className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : addQuestionType === 'code' ? (
                <div className="space-y-1 pt-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Résultat / Console attendue</label>
                  <textarea
                    rows="2"
                    placeholder="Ex. 42 / Hello World / true..."
                    value={addQuestionExpectedOutput}
                    onChange={(e) => setAddQuestionExpectedOutput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              ) : null}
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                disabled={addingQuestion}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={addingQuestion}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all disabled:opacity-50"
              >
                {addingQuestion ? 'En cours...' : 'Ajouter la Question'}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default Examens;