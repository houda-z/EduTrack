import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // محاكاة لما سيقوم به الـ Backend (بنات الفريق غيكملوا هاد الجزء)
    const { email } = credentials;
    let role = 'etudiant'; // الافتراضي

    if (email.includes('admin')) role = 'admin';
    if (email.includes('prof')) role = 'prof';

    // توجيه المستخدم حسب دوره المسترجع من الـ Database
    navigate(`/${role}/dashboard`);
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
            <input 
              type="email" 
              name="email"
              placeholder="" 
              onChange={handleChange}
              required 
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input 
              type="password" 
              name="password"
              placeholder="" 
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit" className="btn-submit">Se connecter</button>
        </form>
        
        <div className="login-foot">
          <p>Problème de connexion? <span>Contacter le support</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;