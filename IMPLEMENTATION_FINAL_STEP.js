/**
 * FINAL STEP - Update handleSubmission in ExamenEnLigne.jsx
 * 
 * Location: frontend/src/pages/dashboard/ExamenEnLigne.jsx (line ~94)
 * Replace the existing handleSubmission function with this code:
 */

const handleSubmission = useCallback(async () => {
  // Confirmation before submission
  const confirmed = window.confirm(
    'Etes-vous sur de vouloir soumettre votre examen ? Vous ne pourrez pas le modifier apres.'
  );
  if (!confirmed) return;

  setIsFinished(true);

  // Prepare answers object for API
  const submitAnswers = {};
  questions.forEach((q) => {
    if (answers[q.id] !== undefined) {
      submitAnswers[q.id] = answers[q.id];
    }
  });

  try {
    // Submit to backend API
    const response = await api.post(`/examens/${examId}/soumettre`, {
      answers: submitAnswers
    });

    if (response.data && response.data.success) {
      // Calculate score for display
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

      // Navigate after successful submission
      navigate(`/etudiant/${nom}/examens`, {
        state: {
          examCompleted: true,
          score,
          totalPoints,
          examTitre: titre,
        },
      });
    } else {
      alert('Erreur lors de la soumission.');
      setIsFinished(false);
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Erreur lors de la soumission. Veuillez reessayer.');
    setIsFinished(false);
  }
}, [answers, questions, navigate, nom, titre, examId]);
