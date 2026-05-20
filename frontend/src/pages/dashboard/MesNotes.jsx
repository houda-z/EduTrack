import React from 'react';
import { TrendingUp, FileText, Award, Target, Info } from 'lucide-react';
import './MesNotes.css';

const MesNotes = () => {
    const grades = [
        { id: 1, module: "Algorithmique Avancée", coeff: 4, value: 16.5, status: "Validé", comment: "Excellent travail" },
        { id: 2, module: "Réseaux & Protocoles", coeff: 3, value: 14.0, status: "Validé", comment: "Bonne maîtrise" },
        { id: 3, module: "Base de données SQL", coeff: 3, value: 18.0, status: "Validé", comment: "Exceptionnel" },
        { id: 4, module: "Anglais Technique", coeff: 2, value: 12.0, status: "Validé", comment: "Participation à améliorer" },
        { id: 5, module: "Gestion de Projet", coeff: 3, value: 15.5, status: "Validé", comment: "Sérieux et organisé" }
    ];

    return (
        <div className="grades-container">
            <div className="summary-section">
                <div className="average-card glass-glow">
                    <div className="avg-header">
                        <Award size={30} className="text-purple" />
                        <span>Moyenne Générale</span>
                    </div>
                    <div className="avg-value">15.2</div>
                    <div className="avg-rank">Top 15% de la section</div>
                </div>

                <div className="stats-mini-grid">
                    <div className="mini-stat glass-glow">
                        <Target className="text-cyan" />
                        <div>
                            <span className="label">Modules Validés</span>
                            <span className="value">8/12</span>
                        </div>
                    </div>
                    <div className="mini-stat glass-glow">
                        <TrendingUp className="text-green" />
                        <div>
                            <span className="label">Progression</span>
                            <span className="value">+1.2 pts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grades-table-container glass-glow">
                <div className="table-header">
                    <div className="table-title">
                        <FileText size={20} />
                        <h3>Détail des Résultats</h3>
                    </div>
                    <div className="semester-badge">Semestre 1 - 2026</div>
                </div>

                <table className="grades-table">
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th>Coefficient</th>
                            <th>Note /20</th>
                            <th>Appréciation</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((grade) => (
                            <tr key={grade.id}>
                                <td className="module-name">{grade.module}</td>
                                <td>{grade.coeff}</td>
                                <td className="grade-value pass">{grade.value}</td>
                                <td className="comment">{grade.comment}</td>
                                <td>
                                    <span className="status-pill valid">{grade.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="info-box-cyber">
                <Info size={18} />
                <p>Les résultats provisoires sont affichés en attente de validation par le jury de fin d'année.</p>
            </div>
        </div>
    );
};

export default MesNotes;
