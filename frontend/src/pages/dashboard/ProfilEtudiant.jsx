import React from 'react';
import { Mail, Phone, Book, Calendar, Shield, Award } from 'lucide-react';
import './ProfilEtudiant.css';

const ProfilEtudiant = () => {
    const student = {
        nom: "HOUDA",
        prenom: "Z",
        email: "houda.z@ecole.com",
        telephone: "+212 6 00 00 00 00",
        filiere: "Ingénierie du Développement Digital",
        annee: "2ème Année",
        groupe: "G1-DEV",
        id: "2024-0482",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=houda"
    };

    return (
        <div className="profile-container">
            <div className="profile-grid">
                {/* Profile Header Card */}
                <div className="profile-main-card glass-glow">
                    <div className="profile-cover"></div>
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            <img src={student.avatar} alt="Avatar" />
                            <div className="online-status"></div>
                        </div>
                        <div className="profile-name-info">
                            <h1>{student.prenom} {student.nom}</h1>
                            <span className="user-id">ID: #{student.id}</span>
                        </div>
                    </div>
                </div>

                {/* Account Details */}
                <div className="details-card glass-glow">
                    <div className="card-header">
                        <Shield size={20} className="text-purple" />
                        <h3>Informations de Compte</h3>
                    </div>
                    <div className="details-list">
                        <div className="detail-item">
                            <Mail size={18} />
                            <div>
                                <label>Email Institutionnel</label>
                                <p>{student.email}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Phone size={18} />
                            <div>
                                <label>Téléphone</label>
                                <p>{student.telephone}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Book size={18} />
                            <div>
                                <label>Filière</label>
                                <p>{student.filiere}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Calendar size={18} />
                            <div>
                                <label>Année d'étude</label>
                                <p>{student.annee}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Badges */}
                <div className="badges-card glass-glow">
                    <div className="card-header">
                        <Shield size={20} className="text-cyan" />
                        <h3>Certifications & Badges</h3>
                    </div>
                    <div className="badges-grid">
                        <div className="badge-item gold">
                            <Award />
                            <span>Major de Promo</span>
                        </div>
                        <div className="badge-item cyan">
                            <Shield />
                            <span>Sécurité Web</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilEtudiant;
