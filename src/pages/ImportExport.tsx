import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, Database, AlertTriangle, CheckCircle, RotateCcw,
  FileJson, FileSpreadsheet, Cloud, ArrowRight, Trash2, History
} from 'lucide-react';
import { useApp, generateId, CLASSES, TARIFFS } from '../context/AppContext';
import { ALL_HISTORICAL_DATA, DEMO_STUDENTS, type HistoricalStudent } from '../data/historicalData';
import { getDataIndex, resetDataIndex, getLocalStorageData } from '../lib/api';

export default function ImportExport() {
  const { students, payments, addStudent, addPayment, resetAll, loadAll } = useApp();
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 6000);
  }, []);

  const exportAll = () => {
    const allData = getLocalStorageData();
    const index = getDataIndex();
    const data = {
      ...allData,
      index,
      exportedAt: new Date().toISOString(),
      app: 'Gestion IPHES Pro',
      version: '2.0',
      _format: 'iphes_backup_v2'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iphes-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('success', 'Données exportées avec succès !');
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data._format && !data.students) {
          showMessage('error', 'Format de fichier non reconnu. Utilisez un backup IPHES.');
          return;
        }
        let count = 0;
        if (data.students) {
          data.students.forEach((s: any) => {
            if (!students.find(x => x.id === s.id || x.matricule === s.matricule)) {
              addStudent(s); count++;
            }
          });
        }
        let payCount = 0;
        if (data.payments) {
          data.payments.forEach((p: any) => {
            if (!payments.find(x => x.id === p.id)) {
              addPayment(p); payCount++;
            }
          });
        }
        if (data.index) {
          localStorage.setItem('iphDataIndex', JSON.stringify(data.index));
        }
        showMessage('success', `Import réussi : ${count} élèves, ${payCount} paiements`);
        loadAll();
      } catch (err: any) {
        showMessage('error', 'Erreur lors de l\'import : fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const importHistorical = async () => {
    setIsImporting(true); setImportProgress(0);
    const allData = Object.entries(ALL_HISTORICAL_DATA) as [string, HistoricalStudent[]][];
    let total = 0;
    allData.forEach(([_, list]) => total += list.length);
    let done = 0;

    for (const [className, list] of allData) {
      for (const [i, item] of list.entries()) {
        const id = generateId();
        addStudent({
          id, matricule: `IPHES-HIST-${className}-${String(i + 1).padStart(3, '0')}`,
          name: item.name, class: item.className, phone: '', guardian: '', guardianPhone: '',
          origin: '', birthDate: '', birthPlace: '', academicYear: '', promotion: '',
          date: '2023-09-01', annualTuition: item.due, scholarshipStatus: 'Non boursier', active: true
        });
        if (item.paid > 0) {
          addPayment({
            id: generateId(), studentId: id, receipt: `HIST-${className}-${i + 1}`,
            date: '2023-09-01', reason: 'Scolarité', amount: item.paid, mode: 'Espèces',
            year: '2023-2024', observation: 'Import historique'
          });
        }
        done++;
        setImportProgress(Math.round((done / total) * 100));
        await new Promise(r => setTimeout(r, 10));
      }
    }
    setIsImporting(false);
    showMessage('success', `${total} élèves historiques importés avec succès !`);
  };

  const importDemo = () => {
    DEMO_STUDENTS.forEach(([cls, name], i) => {
      const id = generateId();
      addStudent({
        id, matricule: `IPHES-DEMO-${String(i + 1).padStart(3, '0')}`,
        name, class: cls, phone: '', guardian: '', guardianPhone: '',
        origin: '', birthDate: '', birthPlace: '', academicYear: '', promotion: '',
        date: new Date().toISOString().split('T')[0], annualTuition: TARIFFS[cls]?.[0] || 0,
        scholarshipStatus: 'Non boursier', active: true
      });
    });
    showMessage('success', `${DEMO_STUDENTS.length} élèves démo importés !`);
  };

  const clearAll = () => {
    if (confirm('ATTENTION : Cette action supprimera TOUTES les données. Êtes-vous sûr ?')) {
      resetAll(); resetDataIndex();
      showMessage('success', 'Toutes les données ont été réinitialisées.');
    }
  };

  const localData = getLocalStorageData();
  const index = getDataIndex();

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Import & Export des données</h2>
          <p className="text-slate-400 text-sm">Migration et sauvegarde de vos données</p>
        </div>
        <div className="flex items-center gap-3">
          <img src="/3d-import.png" alt="" className="w-12 h-12 object-contain opacity-60 hidden md:block" />
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
            <button onClick={() => setMessage(null)} className="ml-auto text-sm opacity-70 hover:opacity-100">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {isImporting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white font-medium">Import en cours...</span>
            <span className="text-sm text-amber-400 font-bold">{importProgress}%</span>
          </div>
          <div className="progress-3d">
            <div style={{ width: `${importProgress}%` }} />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Download size={22} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Exporter les données</h3>
              <p className="text-sm text-slate-400">Sauvegarde JSON complète avec index</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/50 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Élèves</span><span className="text-white font-medium">{localData.students.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Paiements</span><span className="text-white font-medium">{localData.payments.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Notes</span><span className="text-white font-medium">{localData.grades.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Index</span><span className="text-white font-medium">{index.lastSync ? 'Enregistré' : 'Non initialisé'}</span></div>
            </div>
            <button onClick={exportAll} className="w-full btn-gold rounded-xl py-3 flex items-center justify-center gap-2">
              <Download size={18} /> Exporter toutes les données
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Upload size={22} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Importer des données</h3>
              <p className="text-sm text-slate-400">Fichier JSON ou CSV avec index</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".json,.csv" onChange={importFile} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2 mb-3">
            <FileJson size={18} /> Sélectionner un fichier
          </button>
          <p className="text-xs text-slate-500 text-center">Formats acceptés : JSON (backup IPHES v2), CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <History size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Données historiques</h3>
              <p className="text-xs text-slate-400">LSI2, ASB2A, ASB2B</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">Importez les 150+ élèves historiques avec leurs paiements depuis le serveur original.</p>
          <button onClick={importHistorical} disabled={isImporting} className="w-full btn-primary rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {isImporting ? <RotateCcw size={16} className="animate-spin" /> : <><FileSpreadsheet size={16} /> Importer historique</>}
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-6 neon-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Données démo</h3>
              <p className="text-xs text-slate-400">12 élèves ASB2</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">Importez les élèves de démonstration pour tester l'application.</p>
          <button onClick={importDemo} className="w-full btn-primary rounded-xl py-2.5 text-sm flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Importer démo
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Zone danger</h3>
              <p className="text-xs text-slate-400">Réinitialisation</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">Supprimez toutes les données et l'index pour repartir à zéro.</p>
          <button onClick={clearAll} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-all">
            <Trash2 size={16} /> Tout réinitialiser
          </button>
        </div>
      </div>

      {/* Data Index Summary */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-amber-400" /> Index de données complet
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{localData.students.length}</p>
            <p className="text-xs text-slate-400 mt-1">Élèves</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{localData.payments.length}</p>
            <p className="text-xs text-slate-400 mt-1">Paiements</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{localData.grades.length}</p>
            <p className="text-xs text-slate-400 mt-1">Notes</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{localData.subjects.length}</p>
            <p className="text-xs text-slate-400 mt-1">Matières</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{localData.expenses.length}</p>
            <p className="text-xs text-slate-400 mt-1">Dépenses</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-400">{localData.attendance.length}</p>
            <p className="text-xs text-slate-400 mt-1">Présences</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{localData.stages.length}</p>
            <p className="text-xs text-slate-400 mt-1">Stages</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{localData.saturdayPlans.length}</p>
            <p className="text-xs text-slate-400 mt-1">Plannings samedi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
