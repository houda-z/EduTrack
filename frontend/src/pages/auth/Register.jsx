import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant',
    filiere_id: '',
    groupe_id: ''
  });

  const [filieres, setFilieres] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Fetch filieres on mount
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/filieres');
        setFilieres(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des filières:', err);
      }
    };
    fetchFilieres();
  }, []);

  // Fetch groupes when filiere changes
  useEffect(() => {
    const fetchGroupes = async () => {
      if (!formData.filiere_id) {
        setGroupes([]);
        setFormData(prev => ({ ...prev, groupe_id: '' }));
        return;
      }
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/groupes?filiere_id=${formData.filiere_id}`);
        if (response.data && response.data.success) {
          setGroupes(response.data.data);
        } else {
          setGroupes(response.data || []);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des groupes:', err);
        setGroupes([]);
      }
    };
    fetchGroupes();
  }, [formData.filiere_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const nameParts = formData.fullName.trim().split(' ');
    const prenom = nameParts[0] || '';
    const name = nameParts.slice(1).join(' ') || '.';

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        name: name,
        prenom: prenom,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        role: 'etudiant',
        filiere_id: formData.filiere_id ? parseInt(formData.filiere_id) : null,
        groupe_id: formData.groupe_id ? parseInt(formData.groupe_id) : null,
      });

      if (response.status === 201 || response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('user_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        const nom = (user.prenom + user.name).toLowerCase().replace(/\s+/g, '');
        navigate(`/etudiant/${nom}/cours`);
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert("Erreur lors de l'inscription. Vérifiez votre connexion au backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl text-white">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">EduTrack</h1>
          <p className="text-blue-100">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 ml-1">Nom complet</label>
            <input
              type="text"
              name="fullName"
              placeholder="Ex: Ahmed Alaoui"
              className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${errors.name || errors.prenom ? 'border-red-400' : 'border-white/20'} focus:border-white/50 outline-none transition-all placeholder:text-white/30`}
              onChange={handleChange}
              value={formData.fullName}
              required
            />
            {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1 ml-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${errors.email ? 'border-red-400' : 'border-white/20'} focus:border-white/50 outline-none transition-all placeholder:text-white/30`}
              onChange={handleChange}
              value={formData.email}
              required
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 ml-1">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${errors.password ? 'border-red-400' : 'border-white/20'} focus:border-white/50 outline-none transition-all placeholder:text-white/30`}
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 ml-1">Confirmation</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-white/50 outline-none transition-all placeholder:text-white/30"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />
            </div>
          </div>
          {errors.password && <p className="text-red-300 text-xs">{errors.password[0]}</p>}

          {/* Filière dropdown */}
          <div>
            <label className="block text-sm mb-1 ml-1">Filière</label>
            <select
              name="filiere_id"
              className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${errors.filiere_id ? 'border-red-400' : 'border-white/20'} text-white outline-none focus:border-white/50 transition-all`}
              onChange={handleChange}
              value={formData.filiere_id}
              required
            >
              <option value="" style={{ color: 'black', backgroundColor: 'white' }}>
                Choisir votre filière...
              </option>
              {filieres.length > 0 ? (
                filieres.map(f => (
                  <option key={f.id} value={f.id} style={{ color: 'black', backgroundColor: 'white' }}>
                    {f.nom}
                  </option>
                ))
              ) : (
                <option disabled style={{ color: 'black', backgroundColor: 'white' }}>
                  Chargement...
                </option>
              )}
            </select>
            {errors.filiere_id && <p className="text-red-300 text-xs mt-1">{errors.filiere_id[0]}</p>}
          </div>

          {/* Groupe dropdown — populated dynamically based on filière */}
          <div>
            <label className="block text-sm mb-1 ml-1">Groupe</label>
            <select
              name="groupe_id"
              className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${errors.groupe_id ? 'border-red-400' : 'border-white/20'} text-white outline-none focus:border-white/50 transition-all disabled:opacity-50`}
              onChange={handleChange}
              value={formData.groupe_id}
              disabled={!formData.filiere_id}
              required
            >
              <option value="" style={{ color: 'black', backgroundColor: 'white' }}>
                {formData.filiere_id ? 'Choisir votre groupe...' : 'Sélectionnez d\'abord une filière'}
              </option>
              {groupes.map(g => (
                <option key={g.id} value={g.id} style={{ color: 'black', backgroundColor: 'white' }}>
                  {g.nom}
                </option>
              ))}
            </select>
            {errors.groupe_id && <p className="text-red-300 text-xs mt-1">{errors.groupe_id[0]}</p>}
          </div>

          <input type="hidden" name="role" value="etudiant" />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription...
              </span>
            ) : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-blue-100">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-white font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;