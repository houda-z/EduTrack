<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
    .header { background: #0f172a; color: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
    .header h1 { margin: 0; font-size: 18px; color: #22d3ee; }
    .header p { margin: 4px 0; font-size: 11px; color: #94a3b8; }
    .score-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 12px 20px; margin-bottom: 20px; text-align: center; }
    .score-box .score { font-size: 28px; font-weight: bold; color: #16a34a; }
    .score-box .label { font-size: 11px; color: #64748b; }
    .partie-title { background: #1e293b; color: #22d3ee; padding: 8px 12px; border-radius: 4px; font-weight: bold; margin: 16px 0 8px 0; font-size: 12px; }
    .question-block { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
    .question-header { background: #f8fafc; padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .question-enonce { font-weight: bold; font-size: 11px; }
    .question-meta { font-size: 10px; color: #64748b; margin-top: 3px; }
    .question-body { padding: 10px 14px; }
    .reponse-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .reponse-text { background: #f1f5f9; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 10px; }
    .correct { color: #16a34a; font-weight: bold; }
    .wrong { color: #dc2626; font-weight: bold; }
    .note-badge { display: inline-block; background: #0f172a; color: #22d3ee; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; float: right; }
    .footer { text-align: center; color: #94a3b8; font-size: 9px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10px; }
    th { background: #f1f5f9; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Fiche de Correction — EduTrack</h1>
    <p>Examen: <strong style="color:white">{{ $exam->titre }}</strong></p>
    <p>Étudiant: <strong style="color:white">{{ $etudiant->prenom }} {{ $etudiant->name }}</strong> | Email: {{ $etudiant->email }}</p>
    <p>Filière: {{ $exam->filiere?->nom }} | Groupe: {{ $exam->groupe?->nom }}</p>
    <p>Date correction: {{ now()->format('d/m/Y H:i') }}</p>
  </div>

  <div class="score-box">
    <div class="score">{{ number_format($noteTotale, 2) }} / {{ $totalPoints }}</div>
    <div class="label">NOTE FINALE DE L'EXAMEN</div>
  </div>

  @php $currentPartie = null; $qNum = 1; @endphp
  
  @foreach($allQuestions as $item)
    @php $q = $item['question']; $partie = $item['partie']; $rep = $reponses[$q->id] ?? null; @endphp
    
    @if($partie && $partie !== $currentPartie)
      @php $currentPartie = $partie; @endphp
      <div class="partie-title">📂 {{ $partie }}</div>
    @endif
    
    <div class="question-block">
      <div class="question-header">
        <div class="question-enonce">Q{{ $qNum }}. {{ $q->enonce }}</div>
        <div class="question-meta">
          Type: {{ strtoupper($q->type) }} | Points: {{ $q->points }}
          @if($rep && $rep->note_attribuee !== null)
            <span class="note-badge">{{ $rep->note_attribuee }} / {{ $q->points }}</span>
          @endif
        </div>
      </div>
      <div class="question-body">
        @if($q->type === 'qcm')
          <div class="reponse-label">Réponse de l'étudiant:</div>
          @foreach($q->choix as $choix)
            @php $selected = $rep && $rep->choix_qcm_id == $choix->id; @endphp
            <div style="padding: 3px 0;">
              @if($selected && $choix->est_correct)
                <span class="correct">✓ {{ $choix->texte }} (Correct)</span>
              @elseif($selected && !$choix->est_correct)
                <span class="wrong">✗ {{ $choix->texte }} (Incorrect)</span>
              @elseif($choix->est_correct)
                <span class="correct">● {{ $choix->texte }} (Bonne réponse)</span>
              @else
                <span style="color:#64748b">○ {{ $choix->texte }}</span>
              @endif
            </div>
          @endforeach
        @else
          <div class="reponse-label">Réponse de l'étudiant:</div>
          <div class="reponse-text">{{ $rep?->reponse_texte ?? 'Aucune réponse fournie.' }}</div>
        @endif
      </div>
    </div>
    @php $qNum++; @endphp
  @endforeach

  <div class="footer">
    Document généré automatiquement par EduTrack — {{ now()->format('d/m/Y à H:i') }}
  </div>
</body>
</html>
