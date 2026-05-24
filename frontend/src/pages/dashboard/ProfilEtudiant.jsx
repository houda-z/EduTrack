import React, { useState, useEffect } from 'react';
import { Mail, Phone, Book, Calendar, Shield, Award } from 'lucide-react';
import api from '../../services/api';
import './ProfilEtudiant.css';

const ProfilEtudiant = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filiereName, setFiliereName] = useState('');
    const [groupeName, setGroupeName] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get current user data from API
            const userResponse = await api.get('/user');
            if (userResponse.data && userResponse.data.success && userResponse.data.data) {
                const userData = userResponse.data.data;
                setStudent(userData);

                // Get filiere name
                if (userData.filiere_id) {
                    try {
                        const filieresResponse = await api.get('/filieres');
                        if (filieresResponse.data?.data) {
                            const filiere = filieresResponse.data.data.find(f => f.id === userData.filiere_id);
                            if (filiere) {
                                setFiliereName(filiere.nom || '');
                            }
                        }
                    } catch (err) {
                        console.warn('Error fetching filieres:', err);
                    }
                }

                // Get groupe name
                if (userData.groupe_id) {
                    try {
                        const groupesResponse = await api.get('/groupes');
                        if (groupesResponse.data?.data) {
                            const groupe = groupesResponse.data.data.find(g => g.id === userData.groupe_id);
                            if (groupe) {
                                setGroupeName(groupe.nom || '');
                            }
                        }
                    } catch (err) {
                        console.warn('Error fetching groupes:', err);
                    }
                }
            } else {
                // Fallback to localStorage
                const user = JSON.parse(localStorage.getItem('user'));
                setStudent(user);
                setError('Certaines données ne sont pas disponibles');
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            // Fallback to localStorage
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setStudent(user);
            } catch {
                setError('Erreur lors du chargement du profil');
                setStudent(null);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
                <div style={{ width: 40, height: 40, border: '4px solid rgba(34,211,238,0.2)', borderTop: '4px solid cyan', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                Chargement du profil...
            </div>
        );
    }

    if (!student) {
        return (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Erreur lors du chargement du profil</p>
            </div>
        );
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id || 'etudiant'}`;

    return (
        <div className="profile-container">
            <div className="profile-grid">
                {/* Profile Header Card */}
                <div className="profile-main-card glass-glow">
                    <div className="profile-cover"></div>
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            <img src={avatarUrl} alt="Avatar" />
                            <div className="online-status"></div>
                        </div>
                        <div className="profile-name-info">
                            <h1>{student.prenom || ''} {student.name || student.nom || ''}</h1>
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
                                <p>{student.email || 'Non disponible'}</p>
                            </div>
                        </div>
                        {student.phone && (
                            <div className="detail-item">
                                <Phone size={18} />
                                <div>
                                    <label>Téléphone</label>
                                    <p>{student.phone}</p>
                                </div>
                            </div>
                        )}
                        <div className="detail-item">
                            <Book size={18} />
                            <div>
                                <label>Filière</label>
                                <p>{filiereName || 'Non assignée'}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Calendar size={18} />
                            <div>
                                <label>Groupe</label>
                                <p>{groupeName || 'Non assigné'}</p>
                            </div>
                        </div>
                        {student.moyenne !== undefined && (
                            <div className="detail-item">
                                <Award size={18} />
                                <div>
                                    <label>Moyenne Générale</label>
                                    <p>{parseFloat(student.moyenne).toFixed(2)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio or Status */}
                {student.bio && (
                    <div className="details-card glass-glow">
                        <div className="card-header">
                            <Shield size={20} className="text-cyan" />
                            <h3>À Propos</h3>
                        </div>
                        <p style={{ color: '#e2e8f0', marginTop: '12px' }}>{student.bio}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilEtudiant;
