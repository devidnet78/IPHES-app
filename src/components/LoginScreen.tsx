import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, GraduationCap, Lock, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { useApp, CLASSES } from '../context/AppContext';

const coordPasswords: Record<string, string[]> = {
  'coordASB1': ['ASB1A','ASB1B'], 'coordASB2': ['ASB2A','ASB2B'], 'coordASB3': ['ASB3A','ASB3B'],
  'coordLSI1': ['LSI1'], 'coordSUP': ['LSI2','LSO2','LSI3','LSO3'],
};

const dePasswords = ['deIPHES', 'DE-IPHES', 'directeurDE', 'D.E.', 'de2026', 'DE2026'];

const respPasswords: Record<string, string> = {
  'ASB1A':'respASB1A','ASB1B':'respASB1B','ASB2A':'respASB2A','ASB2B':'respASB2B',
  'ASB3A':'respASB3A','ASB3B':'respASB3B','LSI1':'respLSI1','LSI2':'respLSI2',
  'LSI3':'respLSI3','LSO2':'respLSO2','LSO3':'respLSO3','LBM1':'respLBM1','LBM2':'respLBM2','LBM3':'respLBM3',
};

type Tab = 'director' | 'coordinator' | 'de' | 'responsible';

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'director', label: 'Direction', icon: Shield },
  { key: 'coordinator', label: 'Coordinateur', icon: Users },
  { key: 'de', label: 'D.E.', icon: GraduationCap },
  { key: 'responsible', label: 'Responsable', icon: BookOpen },
];

export default function LoginScreen() {
  const { setCurrentRole, setCurrentClass, setAllowedClasses } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('director');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (activeTab === 'director') {
      if (password.trim() === 'iphes') { setCurrentRole('director'); setCurrentClass(''); setAllowedClasses([]); }
      else { setError('Mot de passe incorrect'); setLoading(false); return; }
    } else if (activeTab === 'coordinator') {
      const entry = Object.entries(coordPasswords).find(([k]) => k === password.trim());
      if (entry) { setCurrentRole('coordinator'); setCurrentClass(''); setAllowedClasses(entry[1]); }
      else { setError('Code coordinateur invalide'); setLoading(false); return; }
    } else if (activeTab === 'de') {
      if (dePasswords.includes(password.trim())) { setCurrentRole('de'); setCurrentClass(''); setAllowedClasses([]); }
      else { setError('Mot de passe D.E. invalide'); setLoading(false); return; }
    } else if (activeTab === 'responsible') {
      const expected = respPasswords[selectedClass];
      if (!selectedClass) { setError('Choisissez une classe'); setLoading(false); return; }
      if (password.trim() === expected) { setCurrentRole('responsible'); setCurrentClass(selectedClass); setAllowedClasses([selectedClass]); }
      else { setError('Mot de passe incorrect pour cette classe'); setLoading(false); return; }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #f4f5f7 0%, #eef1f6 50%, #e8ecf2 100%)' }}>
      {/* Subtle dots background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-[#123b68]"
            style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, opacity: 0.15 + Math.random()*0.15 }}
          />
        ))}
      </div>

      <div className="flex w-full max-w-5xl mx-4 gap-8 items-center relative z-10">
        {/* Left: 3D branding image */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1">
          <motion.div
            className="relative mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src="/3d-campus-hero.png" alt="IPHES Campus" className="w-56 h-40 object-contain drop-shadow-xl" />
            <div className="absolute inset-0 bg-[#123b68]/5 rounded-full blur-3xl -z-10 scale-150" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#123b68] mb-2">IPHES</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
            Institut Privé des Hautes Études de la Santé<br />
            <span className="text-xs text-gray-400">Gestion scolaire et administrative</span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-xl font-bold text-[#123b68]">150+</p>
              <p className="text-xs text-gray-500">Élèves</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-xl font-bold text-[#d4af37]">12</p>
              <p className="text-xs text-gray-500">Classes</p>
            </div>
          </div>
        </div>

        {/* Right: login card with 3D image on top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-[#e8ecf0] shadow-xl shadow-black/5 overflow-hidden">
            {/* 3D Logo Section - centered at top */}
            <div className="p-5 text-center relative">
              {/* 3D Image floating above card */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[#123b68]/8 to-[#d4af37]/8 rounded-3xl blur-xl scale-110" />
                <motion.div
                  className="relative inline-block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <img
                    src="/3d-campus-hero.png"
                    alt="IPHES 3D"
                    className="w-32 h-32 object-contain mx-auto drop-shadow-2xl relative z-10"
                  />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-[#123b68] mt-1">Connexion</h2>
              <p className="text-xs text-gray-400 mt-1">Sélectionnez votre profil</p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-[#f8fafc] border border-[#eef1f5]">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setError(''); setPassword(''); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-[#123b68] text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {activeTab === 'responsible' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Classe</label>
                      <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3 text-sm">
                        <option value="">Choisir une classe...</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                      {activeTab === 'director' ? 'Mot de passe' : activeTab === 'coordinator' ? 'Code' : activeTab === 'de' ? 'Mot de passe D.E.' : 'Mot de passe'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder={activeTab === 'director' ? 'iphes' : 'Entrez le mot de passe...'}
                        className="w-full input-glass rounded-xl px-4 py-3 pr-12 text-sm"
                      />
                      <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                      {error}
                    </motion.p>
                  )}

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full btn-gold rounded-xl py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                    ) : (<><span>Connexion</span><ArrowRight size={18} /></>)}
                  </button>
                </motion.div>
              </AnimatePresence>

              <div className="pt-2">
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  {activeTab === 'director' && 'Accès complet au tableau de bord et à toutes les fonctionnalités'}
                  {activeTab === 'coordinator' && 'Accès aux bulletins et stages de votre niveau'}
                  {activeTab === 'de' && 'Accès pédagogique : élèves, bulletins, matières, présences, stages'}
                  {activeTab === 'responsible' && 'Accès à la liste et aux présences de votre classe'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] text-gray-400">© 2024 IPHES — Institut Privé des Hautes Études de la Santé · Niamey, Niger</p>
      </div>
    </div>
  );
}
