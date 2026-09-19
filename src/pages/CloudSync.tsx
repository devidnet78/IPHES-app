import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, CloudOff, RefreshCw, Upload, Download, Database,
  CheckCircle, AlertTriangle, Users, CreditCard, FileText,
  BarChart3, ArrowUpDown, Shield, Wifi, WifiOff, Server
} from 'lucide-react';
import {
  apiLogin, getApiToken, clearApiToken, getDataIndex, saveDataIndex,
  getStudentsFromServer, getPaymentsFromServer, pushStudentToServer,
  pushPaymentToServer, getLocalStorageData, type DataIndex
} from '../lib/api';
import { useApp, CLASSES } from '../context/AppContext';
import Modal from '../components/Modal';

export default function CloudSync() {
  const { students, payments, grades, addStudent, addPayment, loadAll } = useApp();
  const [index, setIndex] = useState<DataIndex>(getDataIndex());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ role: 'direction', password: '', className: '' });
  const [syncDetails, setSyncDetails] = useState<{
    studentsPushed: number; studentsPulled: number;
    paymentsPushed: number; paymentsPulled: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    setIsConnected(!!getApiToken());
  }, []);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await apiLogin(loginForm.role, loginForm.password, loginForm.className || undefined);
      setIsConnected(true);
      setLoginModal(false);
      showMessage('success', 'Connecté au serveur cloud avec succès !');
    } catch (e: any) {
      showMessage('error', e.message || 'Échec de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearApiToken();
    setIsConnected(false);
    showMessage('info', 'Déconnecté du serveur cloud');
  };

  const syncToCloud = async () => {
    if (!isConnected) { showMessage('error', 'Connectez-vous d\'abord au serveur'); return; }
    setIsLoading(true);
    const details = { studentsPushed: 0, studentsPulled: 0, paymentsPushed: 0, paymentsPulled: 0, errors: [] as string[] };
    try {
      const serverStudents = await getStudentsFromServer();
      const serverMap = new Map(serverStudents.map(s => [s.matricule, s.id]));
      const localStudentMap = new Map<string, number>();

      for (const s of students) {
        const ok = await pushStudentToServer(s);
        if (ok) details.studentsPushed++;
        else details.errors.push(`Élève ${s.name} : échec envoi`);
      }

      for (const p of payments) {
        const sid = serverMap.get(students.find(s => s.id === p.studentId)?.matricule || '');
        if (sid) {
          localStudentMap.set(p.studentId, sid);
        }
      }

      for (const p of payments) {
        const ok = await pushPaymentToServer(p, localStudentMap);
        if (ok) details.paymentsPushed++;
      }

      const newIndex: DataIndex = {
        ...index,
        lastSync: new Date().toISOString(),
        syncStatus: 'success',
        stats: {
          ...index.stats,
          studentsPushed: index.stats.studentsPushed + details.studentsPushed,
          paymentsPushed: index.stats.paymentsPushed + details.paymentsPushed
        },
        errors: details.errors
      };
      saveDataIndex(newIndex);
      setIndex(newIndex);
      setSyncDetails(details);
      showMessage('success', `Sync vers cloud : ${details.studentsPushed} élèves, ${details.paymentsPushed} paiements`);
    } catch (e: any) {
      showMessage('error', e.message || 'Erreur de synchronisation');
      const newIndex: DataIndex = { ...index, syncStatus: 'error', errors: [e.message || 'Erreur'] };
      saveDataIndex(newIndex);
      setIndex(newIndex);
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async () => {
    if (!isConnected) { showMessage('error', 'Connectez-vous d\'abord au serveur'); return; }
    setIsLoading(true);
    const details = { studentsPushed: 0, studentsPulled: 0, paymentsPushed: 0, paymentsPulled: 0, errors: [] as string[] };
    try {
      const serverStudents = await getStudentsFromServer();
      const serverPayments = await getPaymentsFromServer();
      const existingMats = new Set(students.map(s => s.matricule));

      let countS = 0, countP = 0;
      for (const ss of serverStudents) {
        if (!existingMats.has(ss.matricule)) {
          const newStudent = {
            id: `server-${ss.id}-${Date.now()}`,
            matricule: ss.matricule,
            name: ss.name,
            class: ss.class_name,
            phone: ss.phone || '',
            guardian: ss.guardian || '',
            guardianPhone: ss.guardian_phone || '',
            origin: ss.origin || '',
            birthDate: ss.birth_date || '',
            birthPlace: ss.birth_place || '',
            academicYear: ss.academic_year || '',
            promotion: ss.promotion || '',
            date: ss.enrollment_date || new Date().toISOString().split('T')[0],
            annualTuition: ss.annual_tuition || 0,
            scholarshipStatus: ss.scholarship_status || 'Non boursier',
            active: ss.active !== 0,
            remoteId: String(ss.id)
          };
          addStudent(newStudent as any);
          countS++;
        }
      }

      const studentMap = new Map(students.map(s => [s.id, s]));
      const existingReceipts = new Set(payments.map(p => p.receipt));
      for (const sp of serverPayments) {
        if (!existingReceipts.has(sp.receipt_no)) {
          const student = students.find(s => s.remoteId === String(sp.student_id));
          if (student) {
            addPayment({
              id: `server-${sp.id}-${Date.now()}`,
              studentId: student.id,
              receipt: sp.receipt_no,
              date: sp.payment_date,
              reason: sp.reason,
              amount: sp.amount,
              mode: sp.payment_mode,
              year: sp.year_name || '',
              observation: sp.observation || ''
            });
            countP++;
          }
        }
      }

      details.studentsPulled = countS;
      details.paymentsPulled = countP;
      const newIndex: DataIndex = {
        ...index,
        lastSync: new Date().toISOString(),
        syncStatus: 'success',
        stats: {
          ...index.stats,
          studentsPulled: index.stats.studentsPulled + countS,
          paymentsPulled: index.stats.paymentsPulled + countP
        },
        errors: []
      };
      saveDataIndex(newIndex);
      setIndex(newIndex);
      setSyncDetails(details);
      loadAll();
      showMessage('success', `Sync depuis cloud : ${countS} élèves, ${countP} paiements importés`);
    } catch (e: any) {
      showMessage('error', e.message || 'Erreur de récupération');
      const newIndex: DataIndex = { ...index, syncStatus: 'error', errors: [e.message || 'Erreur'] };
      saveDataIndex(newIndex);
      setIndex(newIndex);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalDataSummary = () => {
    const data = getLocalStorageData();
    return {
      students: data.students.length,
      payments: data.payments.length,
      grades: data.grades.length,
      subjects: data.subjects.length,
      expenses: data.expenses.length,
      attendance: data.attendance.length,
      stages: data.stages.length,
      supervisions: data.supervisions.length,
      saturdayPlans: data.saturdayPlans.length
    };
  };

  const localData = getLocalDataSummary();

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Synchronisation Cloud</h2>
          <p className="text-slate-400 text-sm">Index et synchronisation avec les serveurs</p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
              <Wifi size={16} /> Connecté
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <WifiOff size={16} /> Déconnecté
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : message.type === 'error' ? <AlertTriangle size={20} /> : <Cloud size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection card */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
              <Server size={24} className={isConnected ? 'text-green-400' : 'text-slate-500'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">État de la connexion</h3>
              <p className="text-sm text-slate-400">
                {isConnected ? 'Connecté au serveur central' : 'Non connecté au serveur'}
              </p>
            </div>
          </div>
          <div>
            {isConnected ? (
              <button onClick={handleDisconnect} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
                <CloudOff size={16} /> Déconnecter
              </button>
            ) : (
              <button onClick={() => setLoginModal(true)} className="btn-gold rounded-xl px-5 py-2.5 text-sm flex items-center gap-2">
                <Cloud size={16} /> Se connecter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Upload size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Envoyer vers le cloud</h3>
              <p className="text-sm text-slate-400">Pousse les données locales vers le serveur</p>
            </div>
          </div>
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 text-sm">
            <div className="flex justify-between text-slate-400"><span>Élèves à envoyer</span><span className="text-white">{students.length}</span></div>
            <div className="flex justify-between text-slate-400 mt-1"><span>Paiements à envoyer</span><span className="text-white">{payments.length}</span></div>
          </div>
          <button onClick={syncToCloud} disabled={isLoading || !isConnected} className="w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <><Upload size={18} /> Synchroniser vers le cloud</>}
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Download size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Récupérer depuis le cloud</h3>
              <p className="text-sm text-slate-400">Importe les données du serveur</p>
            </div>
          </div>
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 text-sm">
            <div className="flex justify-between text-slate-400"><span>Dernière sync</span><span className="text-white">{index.lastSync ? new Date(index.lastSync).toLocaleString('fr-FR') : 'Jamais'}</span></div>
            <div className="flex justify-between text-slate-400 mt-1"><span>Élèves récupérés</span><span className="text-white">{index.stats.studentsPulled}</span></div>
          </div>
          <button onClick={syncFromCloud} disabled={isLoading || !isConnected} className="w-full btn-gold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <><Download size={18} /> Récupérer depuis le cloud</>}
          </button>
        </div>
      </div>

      {/* Index stats */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-amber-400" /> Index de données
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{localData.students}</p>
            <p className="text-xs text-slate-400 mt-1">Élèves locaux</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{localData.payments}</p>
            <p className="text-xs text-slate-400 mt-1">Paiements locaux</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{index.stats.studentsPushed}</p>
            <p className="text-xs text-slate-400 mt-1">Élèves envoyés</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{index.stats.studentsPulled}</p>
            <p className="text-xs text-slate-400 mt-1">Élèves récupérés</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{localData.grades}</p>
            <p className="text-xs text-slate-400 mt-1">Notes</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{localData.subjects}</p>
            <p className="text-xs text-slate-400 mt-1">Matières</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-400">{localData.attendance}</p>
            <p className="text-xs text-slate-400 mt-1">Présences</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{localData.stages}</p>
            <p className="text-xs text-slate-400 mt-1">Stages</p>
          </div>
        </div>
      </div>

      {/* Sync details */}
      {syncDetails && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Détails de la dernière synchronisation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-xl font-bold text-blue-400">{syncDetails.studentsPushed}</p>
              <p className="text-xs text-slate-400">Élèves envoyés</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-xl font-bold text-green-400">{syncDetails.studentsPulled}</p>
              <p className="text-xs text-slate-400">Élèves récupérés</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xl font-bold text-amber-400">{syncDetails.paymentsPushed}</p>
              <p className="text-xs text-slate-400">Paiements envoyés</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-xl font-bold text-purple-400">{syncDetails.paymentsPulled}</p>
              <p className="text-xs text-slate-400">Paiements récupérés</p>
            </div>
          </div>
          {syncDetails.errors.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 mb-2">Erreurs ({syncDetails.errors.length}) :</p>
              <ul className="text-xs text-red-300 space-y-1">
                {syncDetails.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                {syncDetails.errors.length > 5 && <li>• ... et {syncDetails.errors.length - 5} autres</li>}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <Modal isOpen={loginModal} onClose={() => setLoginModal(false)} title="Connexion au serveur cloud">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Rôle</label>
            <select value={loginForm.role} onChange={e => setLoginForm({ ...loginForm, role: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3">
              <option value="direction">Direction</option>
              <option value="coordinator">Coordinateur</option>
              <option value="responsable">Responsable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mot de passe</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3" placeholder="Mot de passe..." />
          </div>
          {loginForm.role === 'responsable' && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Classe</label>
              <select value={loginForm.className} onChange={e => setLoginForm({ ...loginForm, className: e.target.value })} className="w-full input-glass rounded-xl px-4 py-3">
                <option value="">Choisir une classe...</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setLoginModal(false)} className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Annuler</button>
          <button onClick={handleLogin} disabled={isLoading} className="btn-gold rounded-xl px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <><Cloud size={18} /> Connecter</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
