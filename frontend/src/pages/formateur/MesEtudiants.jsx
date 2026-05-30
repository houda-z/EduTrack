import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Mail, 
  Phone,
  Clock,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';

const MesEtudiants = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudentsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/formateur/mes-etudiants');
      if (res.data && res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.warn("API error fetching students data, using mock:", err);
      setError("Connexion API impossible. Affichage des données fictives.");
      setGroups([
        {
          id: 1,
          nom: "DEV-101",
          filiere: "Développement Digital",
          annee: "1ère année",
          nb_etudiants: 3,
          etudiants: [
            {
              id: 101,
              nom: "Zouhair",
              prenom: "Houda",
              photo: null,
              email: "houda.zouhair@edutrack.ma",
              telephone: "+212 600-112233",
              annee: "1ère année",
              filiere: "Développement Digital",
              groupe: "DEV-101",
              moyenne_generale: 15.82,
              derniere_connexion: "Il y a 10 min",
              cours_consultes: [
                { id: 1, titre: "React Hooks & Functional Components", consulted_at: "2026-05-23 18:22:04", note: 16, commentaire: "Très bon travail !" },
                { id: 2, titre: "Docker & Containerisation Basics", consulted_at: "2026-05-22 14:05:00", note: null, commentaire: "" }
              ],
              examens: [
                { id: 1, examen_titre: "Examen Final Algorithmes & Structures", note: 16.5, commentaire: "Très bien, code propre.", date: "2026-05-24" }
              ]
            },
            {
              id: 102,
              nom: "Benjelloun",
              prenom: "Mehdi",
              photo: null,
              email: "mehdi.benjelloun@edutrack.ma",
              telephone: "+212 611-445566",
              annee: "1ère année",
              filiere: "Développement Digital",
              groupe: "DEV-101",
              moyenne_generale: 14.15,
              derniere_connexion: "Il y a 2h",
              cours_consultes: [
                { id: 1, titre: "React Hooks & Functional Components", consulted_at: "2026-05-23 19:10:00", note: 14, commentaire: "Bien dans l'ensemble." }
              ],
              examens: [
                { id: 1, examen_titre: "Examen Final Algorithmes & Structures", note: 14.3, commentaire: "Bonne logique.", date: "2026-05-24" }
              ]
            },
            {
              id: 103,
              nom: "Tazi",
              prenom: "Imane",
              photo: null,
              email: "imane.tazi@edutrack.ma",
              telephone: "+212 622-778899",
              annee: "1ère année",
              filiere: "Développement Digital",
              groupe: "DEV-101",
              moyenne_generale: 12.5,
              derniere_connexion: "Hier",
              cours_consultes: [],
              examens: []
            }
          ]
        },
        {
          id: 2,
          nom: "SI-201",
          filiere: "Systèmes d'Information",
          annee: "2ème année",
          nb_etudiants: 1,
          etudiants: [
            {
              id: 104,
              nom: "Lahlou",
              prenom: "Saad",
              photo: null,
              email: "saad.lahlou@edutrack.ma",
              telephone: "+212 633-001122",
              annee: "2ème année",
              filiere: "Systèmes d'Information",
              groupe: "SI-201",
              moyenne_generale: 11.2,
              derniere_connexion: "Il y a 3 jours",
              cours_consultes: [
                { id: 2, titre: "Modélisation UML Avancée", consulted_at: "2026-05-21 11:20:00", note: 11, commentaire: "Passable" }
              ],
              examens: []
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">MES ÉTUDIANTS</h2>
        <p className="text-slate-400 text-sm mt-1">Consultez les rosters de vos groupes, suivez les progrès et notez les étudiants.</p>
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
            <span className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest">Chargement des rosters...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Grid View */}
          {!selectedGroup ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all cursor-pointer group flex flex-col justify-between h-48 shadow-xl"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-3 inline-block">
                      {group.filiere}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">{group.nom}</h3>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">{group.annee || '1ère / 2ème Année'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400 font-extrabold">
                    <span className="flex items-center gap-1.5"><Users size={14} className="text-cyan-400" /> {group.nb_etudiants} Étudiants</span>
                    <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">Voir Liste <ChevronRight size={14} /></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Selected Group Roster View */
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedGroup(null)}
                  className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
                >
                  &larr; Retour aux Groupes
                </button>
                <h3 className="text-lg font-black text-white ml-2">ROSTER : {selectedGroup.nom} ({selectedGroup.filiere})</h3>
              </div>

              {/* Roster Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedGroup.etudiants.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 transition-all cursor-pointer flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-cyan-400 uppercase">
                        {student.prenom ? student.prenom[0] : 'E'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[13.5px] text-white">{student.prenom} {student.nom}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-slate-500 font-semibold">
                          <Clock size={12} />
                          <span>Dernier accès: {student.derniere_connexion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Moyenne</span>
                      <span className="text-base font-black text-cyan-400 block mt-0.5">{student.moyenne_generale}/20</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* STUDENT PROFILE DEEP-DIVE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh] overflow-y-auto animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400">
                  {selectedStudent.prenom ? selectedStudent.prenom[0] : 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedStudent.prenom} {selectedStudent.nom}</h3>
                  <span className="text-[10.5px] text-cyan-400 font-bold uppercase tracking-wider">{selectedStudent.filiere} — {selectedStudent.groupe}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Info Box */}
              <div className="sm:col-span-2 space-y-3 p-4 rounded-xl bg-white/2 border border-white/5">
                <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-500">Contact & Info</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-cyan-400" /> {selectedStudent.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-indigo-400" /> {selectedStudent.telephone || 'Non renseigné'}</div>
                  <div className="flex items-center gap-2"><UserCheck size={14} className="text-purple-400" /> {selectedStudent.annee}</div>
                </div>
              </div>
              
              {/* Score Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border border-cyan-500/20 flex flex-col justify-center items-center text-center">
                <TrendingUp size={24} className="text-cyan-400 mb-2" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Moyenne Générale</span>
                <span className="text-2xl font-black text-white mt-1">{selectedStudent.moyenne_generale} <span className="text-xs text-slate-400">/20</span></span>
              </div>
            </div>

            {/* Course interactions list */}
            <div className="space-y-6">
              
              <div className="space-y-3">
                <h4 className="font-extrabold text-[12px] uppercase tracking-wider text-slate-300 border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <BookOpen size={15} className="text-cyan-400" />
                  Cours consultés & Lectures
                </h4>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedStudent.cours_consultes && selectedStudent.cours_consultes.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-600 font-bold">Aucun cours consulté.</div>
                  ) : (
                    selectedStudent.cours_consultes && selectedStudent.cours_consultes.map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-white/2 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{c.titre}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">Consulté le : {new Date(c.consulted_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {c.note !== null ? (
                          <span className="font-black text-cyan-400">{c.note}/20</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 font-bold border border-yellow-500/20">Non noté</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Exam grades */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[12px] uppercase tracking-wider text-slate-300 border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Award size={15} className="text-indigo-400" />
                  Notes d'Examens & Devoirs
                </h4>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedStudent.examens && selectedStudent.examens.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-600 font-bold">Aucun examen noté.</div>
                  ) : (
                    selectedStudent.examens && selectedStudent.examens.map(ex => (
                      <div key={ex.id} className="p-3 rounded-lg bg-white/2 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{ex.examen_titre}</p>
                          {ex.commentaire && <p className="text-[10px] text-slate-500 italic mt-0.5">"{ex.commentaire}"</p>}
                        </div>
                        <span className="font-black text-cyan-400 text-sm">{ex.note}/20</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MesEtudiants;
