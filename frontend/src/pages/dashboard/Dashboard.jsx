import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Activity, Award } from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    etudiants: 0,
    professeurs: 0,
    examensActifs: 0,
    tauxReussite: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Requête API via notre service configuré
        const response = await api.get('/admin/stats').catch(() => ({
          data: { etudiants: 1250, professeurs: 45, examensActifs: 12, tauxReussite: 85 }
        }));
        
        setStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <header className="mb-10 mt-12 md:mt-0 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Tableau de Bord Admin</h2>
          <p className="text-slate-400">Vue d'ensemble et gestion de la plateforme.</p>
        </div>
      </header>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1 */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Étudiants</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '...' : stats.etudiants}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Professeurs</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '...' : stats.professeurs}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-fuchsia-500/50 hover:bg-white/10 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl group-hover:bg-fuchsia-500/30 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Examens Actifs</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '...' : stats.examensActifs}</h3>
            </div>
            <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Taux de réussite</p>
              <h3 className="text-3xl font-bold text-white">{loading ? '...' : `${stats.tauxReussite}%`}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Award size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Area */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl min-h-[400px]">
        <h3 className="text-xl font-semibold mb-6 text-white">Activité Récente</h3>
        <div className="flex items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
          <p className="text-slate-500">Sélectionnez une option dans le menu pour commencer la gestion.</p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
