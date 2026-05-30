import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nb_cours: 0,
    nb_examens: 0,
    nb_etudiants: 0,
    moyenne_classe: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
      const statsRes = await api.get('/formateur/stats');
      if (statsRes.data && statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch courses for recent activity
      const coursesRes = await api.get('/cours');
      if (coursesRes.data && coursesRes.data.success) {
        setRecentCourses(coursesRes.data.data.slice(0, 3));
      }

      // Fetch exams for recent activity
      const examsRes = await api.get('/examens');
      if (examsRes.data && examsRes.data.success) {
        setRecentExams(examsRes.data.data.slice(0, 3));
      }
    } catch (err) {
      console.warn("API Error, falling back to mock data:", err);
      setError("Connexion à l'API impossible. Affichage des données fictives.");
      
      // Standalone Fallbacks
      setStats({
        nb_cours: 12,
        nb_examens: 5,
        nb_etudiants: 64,
        moyenne_classe: 14.85
      });
      setRecentCourses([
        { id: 1, titre: "Architecture React & Next.js", filiere: { nom: "Développement Digital" }, groupe: { nom: "DEV-101" }, created_at: "2026-05-23T14:30:00" },
        { id: 2, titre: "Modélisation UML Avancée", filiere: { nom: "Systèmes d'Information" }, groupe: { nom: "SI-201" }, created_at: "2026-05-22T09:15:00" }
      ]);
      setRecentExams([
        { id: 1, titre: "QCM Introduction au Cloud", filiere: { nom: "Développement Digital" }, groupe: { nom: "DEV-101" }, type: "qcm", statut: "publie", date_examen: "2026-05-26" },
        { id: 2, titre: "Contrôle Algorithmes en Go", filiere: { nom: "Développement Digital" }, groupe: { nom: "DEV-102" }, type: "code", statut: "brouillon", date_examen: "2026-05-29" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsItems = [
    { label: "Cours Postés", value: stats.nb_cours, icon: <BookOpen className="text-cyan-400" size={24} />, bg: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/20" },
    { label: "Total Étudiants", value: stats.nb_etudiants, icon: <Users className="text-indigo-400" size={24} />, bg: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/20" },
    { label: "Examens Créés", value: stats.nb_examens, icon: <ClipboardList className="text-purple-400" size={24} />, bg: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20" },
    { label: "Moyenne Générale", value: `${stats.moyenne_classe}/20`, icon: <TrendingUp className="text-emerald-400" size={24} />, bg: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TABLEAU DE BORD</h2>
          <p className="text-slate-400 text-sm mt-1">Supervisez vos cours, examens, notes et statistiques globales.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-slate-300"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          
          <Link 
            to="/formateur/cours/creer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
          >
            <PlusCircle size={14} />
            Nouveau Cours
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(34,211,238,0.05)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <span className="text-xs font-bold tracking-widest text-cyan-400/60 uppercase">Chargement des données...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl bg-gradient-to-br ${item.bg} border ${item.border} backdrop-blur-md shadow-lg flex items-center justify-between transition-all hover:scale-[1.02]`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{item.label}</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white">{item.value}</h3>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Courses card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-cyan-400" />
                  <h3 className="font-extrabold tracking-wider text-sm uppercase text-slate-200">Derniers Cours Postés</h3>
                </div>
                <Link to="/formateur/cours" className="text-[11px] font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  VOIR TOUT <ArrowRight size={12} />
                </Link>
              </div>

              <div className="space-y-4">
                {recentCourses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-bold">Aucun cours posté pour le moment.</div>
                ) : (
                  recentCourses.map(course => (
                    <div key={course.id} className="p-4 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-[13.5px] text-white line-clamp-1">{course.titre}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-semibold">
                          <span>{course.filiere ? course.filiere.nom : 'Filière'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40"></span>
                          <span>{course.groupe ? course.groupe.nom : 'Groupe'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-extrabold tracking-wider">
                        {new Date(course.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Exams card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-indigo-400" />
                  <h3 className="font-extrabold tracking-wider text-sm uppercase text-slate-200">Examens Récents & Planifiés</h3>
                </div>
                <Link to="/formateur/examens" className="text-[11px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  VOIR TOUT <ArrowRight size={12} />
                </Link>
              </div>

              <div className="space-y-4">
                {recentExams.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-bold">Aucun examen planifié.</div>
                ) : (
                  recentExams.map(exam => (
                    <div key={exam.id} className="p-4 rounded-xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <h4 className="font-bold text-[13.5px] text-white line-clamp-1">{exam.titre}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-semibold">
                          <span>{exam.filiere ? exam.filiere.nom : 'Filière'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></span>
                          <span className="uppercase text-cyan-400 font-bold">{exam.type}</span>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${
                          exam.statut === 'publie' || exam.statut === 'actif'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : exam.statut === 'termine'
                            ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {exam.statut}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {exam.date_examen ? new Date(exam.date_examen).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'À venir'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
