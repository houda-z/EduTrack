import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { token, user } = response.data;

      localStorage.setItem('user_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'enseignant') {
        navigate('/enseignant/dashboard');
      } else {
        const nom = (user.name).toLowerCase().replace(/\s+/g, '');
        navigate(`/etudiant/${nom}/cours`);
      }

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Vérifiez le backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <Link to="/" className="btn-back">← Accueil</Link>
        <div className="login-head">
          <h2>Portail EduTrack</h2>
          <p>Identifiez-vous pour continuer</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Adresse Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="login-foot">
          <p>Problème de connexion? <span>Contacter le support</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;