import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Camera, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  // Profile State
  const [profile, setProfile] = useState({
    name: 'Amina Bennis',
    email: 'amina.admin@edutrack.ma',
    avatar: null,
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    maintenanceMode: false
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Simulate API call
    showToast('Profil mis à jour avec succès.');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwords.new !== passwords.confirm) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    if (passwords.new.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    // Simulate API call
    showToast('Mot de passe mis à jour avec succès.');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 mt-12 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Paramètres</h2>
          <p className="text-slate-400">Gérez votre profil, la sécurité et les préférences système.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Section */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <User size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Profil Administrateur</h3>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar Upload */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-500">{profile.name.charAt(0)}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-cyan-500 text-slate-900 rounded-full cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg border-2 border-[#0f172a]">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nom Complet</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Adresse Email</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-white/5">
                <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                  <Save size={18} />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Sécurité</h3>
            </div>

            {passwordError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in">
                <AlertCircle size={20} />
                <p>{passwordError}</p>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className={`w-full bg-black/20 border rounded-xl py-2.5 px-4 text-white focus:outline-none transition-all ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'}`}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
                <button type="submit" className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-5 py-2.5 rounded-xl font-medium transition-all">
                  <Lock size={18} />
                  <span>Mettre à jour le mot de passe</span>
                </button>
              </div>
            </form>
          </section>

        </div>

        {/* Right Column: Preferences */}
        <div className="space-y-8">
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-fuchsia-500/10 rounded-xl text-fuchsia-400 border border-fuchsia-500/20">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-semibold text-white">Préférences Système</h3>
            </div>

            <div className="space-y-6">
              {/* Notification Toggle */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Bell className="text-slate-400" size={20} />
                  <div>
                    <h4 className="font-medium text-white">Notifications Email</h4>
                    <p className="text-xs text-slate-400 mt-1">Alerte lors d'une nouvelle inscription</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => togglePreference('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.emailNotifications ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <AlertCircle className={preferences.maintenanceMode ? 'text-amber-400' : 'text-slate-400'} size={20} />
                  <div>
                    <h4 className="font-medium text-white">Mode Maintenance</h4>
                    <p className="text-xs text-slate-400 mt-1">Restreint l'accès aux étudiants</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => togglePreference('maintenanceMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${preferences.maintenanceMode ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {preferences.maintenanceMode && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-400 animate-in fade-in">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">Le mode maintenance est activé. Seuls les administrateurs peuvent se connecter à la plateforme.</p>
              </div>
            )}
          </section>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
