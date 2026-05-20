import { Bell, Eye, EyeOff, Mail, Globe, Save, RefreshCw, Shield, Smartphone } from 'lucide-react';
import './ParametresEtudiant.css';

const ParametresEtudiant = () => {
    return (
        <div className="settings-container">


            <div className="settings-grid">
                <div className="settings-card glass-glow">
                    <div className="card-header">
                        <Shield className="text-purple" />
                        <h3>Sécurité & Mot de Passe</h3>
                    </div>
                    
                    <form className="settings-form">
                        <div className="input-group-cyber">
                            <label>Mot de passe actuel</label>
                            <div className="input-with-icon">
                                <input type="password" placeholder="••••••••••••" />
                                <Eye size={18} className="input-icon" />
                            </div>
                        </div>

                        <div className="input-group-cyber">
                            <label>Nouveau mot de passe</label>
                            <div className="input-with-icon">
                                <input type="password" placeholder="••••••••••••" />
                                <EyeOff size={18} className="input-icon" />
                            </div>
                        </div>

                        <div className="input-group-cyber">
                            <label>Confirmer nouveau mot de passe</label>
                            <div className="input-with-icon">
                                <input type="password" placeholder="••••••••••••" />
                            </div>
                        </div>

                        <button type="submit" className="cyber-btn-fill">
                            <Save size={18} />
                            METTRE À JOUR
                        </button>
                    </form>
                </div>

                <div className="settings-card glass-glow">
                    <div className="card-header">
                        <Bell className="text-cyan" />
                        <h3>Préférences de Notification</h3>
                    </div>

                    <div className="notifications-list">
                        <div className="notif-item">
                            <div className="notif-info">
                                <h4>Alertes d'Examens</h4>
                                <p>Recevoir un rappel 24h avant un examen.</p>
                            </div>
                            <label className="cyber-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notif-item">
                            <div className="notif-info">
                                <h4>Nouvelles Notes</h4>
                                <p>Notification immédiate lors de la publication d'une note.</p>
                            </div>
                            <label className="cyber-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notif-item">
                            <div className="notif-info">
                                <h4>Emails Hebdomadaires</h4>
                                <p>Résumé de votre progression chaque lundi.</p>
                            </div>
                            <label className="cyber-switch">
                                <input type="checkbox" />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-card glass-glow">
                    <div className="card-header">
                        <Globe className="text-purple" />
                        <h3>Préférences de l'Interface</h3>
                    </div>
                    
                    <div className="notif-item">
                        <div className="notif-info">
                            <h4>Langue de l'interface</h4>
                            <p>Français (Par défaut)</p>
                        </div>
                        <button className="text-btn">Modifier</button>
                    </div>

                    <div className="notif-item">
                        <div className="notif-info">
                            <h4>Thème Dynamique</h4>
                            <p>Basculer entre Cyber-Noir et futuriste.</p>
                        </div>
                        <button className="text-btn">Thème Noir</button>
                    </div>
                </div>

                <div className="settings-card glass-glow">
                    <div className="card-header">
                        <RefreshCw className="text-cyan" />
                        <h3>Sessions Actives</h3>
                    </div>
                    <div className="session-item">
                        <Smartphone size={20} className="text-muted" />
                        <div className="session-info">
                            <h4>iPhone 15 Pro - App</h4>
                            <p>En ligne actuellement • Casablanca</p>
                        </div>
                    </div>
                    <div className="session-item">
                        <Mail size={20} className="text-muted" />
                        <div className="session-info">
                            <h4>Chrome - Windows PC</h4>
                            <p>Dernière activité: il y a 2h • Rabat</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParametresEtudiant;
