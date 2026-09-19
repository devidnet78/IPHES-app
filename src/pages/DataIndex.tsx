import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Users, CreditCard, FileText, CheckSquare, Stethoscope,
  Moon, BookOpen, GraduationCap, Archive, Cloud, CloudOff, ArrowRight,
  Search, Filter, Download, BarChart3, Activity, TrendingUp, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDataIndex, type DataIndex } from '../lib/api';

interface DataCategory {
  key: string;
  label: string;
  icon: any;
  count: number;
  color: string;
  bgColor: string;
  description: string;
  route: string;
}

export default function DataIndex() {
  const { students, payments, grades, subjects, attendance, stages, saturdayPlans, supervisions, engagements, expenses, employees } = useApp();
  const [index, setIndex] = useState<DataIndex>(getDataIndex());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => setIndex(getDataIndex()), 5000);
    return () => clearInterval(interval);
  }, []);

  const categories: DataCategory[] = useMemo(() => [
    { key: 'students', label: 'Élèves', icon: Users, count: students.filter(s => s.active !== false).length, color: 'text-blue-400', bgColor: 'bg-blue-500/20', description: 'Élèves actifs inscrits', route: 'students' },
    { key: 'payments', label: 'Paiements', icon: CreditCard, count: payments.length, color: 'text-amber-400', bgColor: 'bg-amber-500/20', description: 'Transactions enregistrées', route: 'payments' },
    { key: 'grades', label: 'Notes', icon: FileText, count: grades.length, color: 'text-purple-400', bgColor: 'bg-purple-500/20', description: 'Notes saisies', route: 'bulletins' },
    { key: 'subjects', label: 'Matières', icon: BookOpen, count: subjects.length, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', description: 'Matières du catalogue', route: 'subjects' },
    { key: 'attendance', label: 'Présences', icon: CheckSquare, count: attendance.length, color: 'text-green-400', bgColor: 'bg-green-500/20', description: 'Enregistrements de présence', route: 'attendance' },
    { key: 'stages', label: 'Stages', icon: Stethoscope, count: stages.length, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', description: 'Affectations de stage', route: 'stages' },
    { key: 'saturday', label: 'Gardes & Perm.', icon: Moon, count: saturdayPlans.length, color: 'text-pink-400', bgColor: 'bg-pink-500/20', description: 'Plannings samedi', route: 'saturday-plans' },
    { key: 'supervision', label: 'Supervisions', icon: Activity, count: supervisions.length, color: 'text-orange-400', bgColor: 'bg-orange-500/20', description: 'Visites de terrain', route: 'supervision' },
    { key: 'engagements', label: 'Engagements', icon: AlertCircle, count: engagements.length, color: 'text-red-400', bgColor: 'bg-red-500/20', description: 'Engagements parentaux', route: 'commitments' },
    { key: 'expenses', label: 'Dépenses', icon: BarChart3, count: expenses.length, color: 'text-rose-400', bgColor: 'bg-rose-500/20', description: 'Dépenses comptables', route: 'accounting' },
    { key: 'employees', label: 'Salariés', icon: GraduationCap, count: employees.length, color: 'text-teal-400', bgColor: 'bg-teal-500/20', description: 'Personnel administratif', route: 'payroll' },
  ], [students, payments, grades, subjects, attendance, stages, saturdayPlans, supervisions, engagements, expenses, employees]);

  const filtered = useMemo(() => {
    let c = categories;
    if (search) {
      const q = search.toLowerCase();
      c = c.filter(x => x.label.toLowerCase().includes(q) || x.description.toLowerCase().includes(q));
    }
    if (filter === 'synced') {
      c = c.filter(x => x.count > 0);
    } else if (filter === 'empty') {
      c = c.filter(x => x.count === 0);
    }
    return c;
  }, [categories, search, filter]);

  const totalRecords = categories.reduce((s, c) => s + c.count, 0);
  const syncedRecords = index.stats.studentsPushed + index.stats.paymentsPushed + index.stats.gradesPushed;
  const cloudStatus = index.lastSync ? 'success' : 'none';

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.active !== false).length;
  const archivedStudents = students.filter(s => s.active === false).length;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Index des données</h2>
        <p className="text-slate-400 text-sm">Vue centrale de toutes les données de l'application</p>
      </div>

      {/* Cloud sync status banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          cloudStatus === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}
      >
        {cloudStatus === 'success' ? <Cloud size={20} /> : <CloudOff size={20} />}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {cloudStatus === 'success'
              ? `Dernière synchronisation : ${new Date(index.lastSync).toLocaleString('fr-FR')}`
              : 'Aucune synchronisation avec le cloud effectuée'}
          </p>
          <p className="text-xs opacity-80">
            {cloudStatus === 'success'
              ? `${index.stats.studentsPushed} élèves envoyés, ${index.stats.paymentsPushed} paiements envoyés`
              : 'Connectez-vous au cloud pour synchroniser vos données'}
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors">
          Cloud Sync
        </button>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{totalRecords}</p>
          <p className="text-xs text-slate-400 mt-1">Enregistrements totaux</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-blue-400">{activeStudents}</p>
          <p className="text-xs text-slate-400 mt-1">Élèves actifs</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{(totalPaid / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-400 mt-1">Total encaissé (F)</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{syncedRecords}</p>
          <p className="text-xs text-slate-400 mt-1">Données sync. cloud</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="w-full input-glass rounded-xl pl-10 pr-4 py-2.5"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-glass rounded-xl px-4 py-2.5">
          <option value="all">Toutes les catégories</option>
          <option value="synced">Avec données</option>
          <option value="empty">Vides</option>
        </select>
        <button className="btn-primary rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
          <Download size={16} /> Exporter index
        </button>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card card-3d rounded-2xl p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center`}>
                  <cat.icon size={22} className={cat.color} />
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${cat.color}`}>{cat.count}</p>
                  <p className="text-xs text-slate-500">enregistrements</p>
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">{cat.label}</h3>
              <p className="text-sm text-slate-400 mb-3">{cat.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cat.count > 0 ? (
                    <span className="badge-green text-xs">Actif</span>
                  ) : (
                    <span className="badge-red text-xs">Vide</span>
                  )}
                  {cat.key === 'students' && archivedStudents > 0 && (
                    <span className="badge-amber text-xs">{archivedStudents} archivés</span>
                  )}
                </div>
                <ArrowRight size={18} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
              {/* Progress bar for visual */}
              {cat.count > 0 && (
                <div className="mt-3 progress-3d">
                  <div
                    style={{ width: `${Math.min(cat.count / 50 * 100, 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Database className="mx-auto mb-4 text-slate-600" size={48} />
          <p className="text-slate-500">Aucune catégorie ne correspond à votre recherche</p>
        </div>
      )}

      {/* Data migration hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-panel rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-amber-400" /> Migration des données
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400 font-medium mb-1">1. Import local</p>
            <p className="text-xs text-slate-400">Importez vos données historiques depuis le backup JSON ou les données historiques ASB2/LSI2.</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-400 font-medium mb-1">2. Synchronisation cloud</p>
            <p className="text-xs text-slate-400">Connectez-vous au serveur central pour synchroniser vos données avec le cloud.</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400 font-medium mb-1">3. Index auto</p>
            <p className="text-xs text-slate-400">L'index de données est mis à jour automatiquement à chaque synchronisation.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
