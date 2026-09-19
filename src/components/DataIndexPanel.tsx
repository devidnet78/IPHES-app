import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Users, CreditCard, FileText, CheckSquare, Stethoscope,
  Moon, BookOpen, GraduationCap, Archive, Cloud, CloudOff, ArrowRight,
  Search, Filter, BarChart3, Activity, TrendingUp, AlertCircle, ChevronRight, ChevronLeft, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDataIndex, type DataIndex as DataIndexType } from '../lib/api';

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

export default function DataIndexPanel() {
  const { students, payments, grades, subjects, attendance, stages, saturdayPlans, supervisions, engagements, expenses, employees } = useApp();
  const [index, setIndex] = useState<DataIndexType>(getDataIndex());
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => setIndex(getDataIndex()), 5000);
    return () => clearInterval(interval);
  }, []);

  const categories: DataCategory[] = useMemo(() => [
    { key: 'students', label: 'Élèves', icon: Users, count: students.filter(s => s.active !== false).length, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Élèves actifs', route: 'students' },
    { key: 'payments', label: 'Paiements', icon: CreditCard, count: payments.length, color: 'text-amber-600', bgColor: 'bg-amber-50', description: 'Transactions', route: 'payments' },
    { key: 'grades', label: 'Notes', icon: FileText, count: grades.length, color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Notes saisies', route: 'bulletins' },
    { key: 'subjects', label: 'Matières', icon: BookOpen, count: subjects.length, color: 'text-indigo-600', bgColor: 'bg-indigo-50', description: 'Matières', route: 'subjects' },
    { key: 'attendance', label: 'Présences', icon: CheckSquare, count: attendance.length, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Présences', route: 'attendance' },
    { key: 'stages', label: 'Stages', icon: Stethoscope, count: stages.length, color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'Stages', route: 'stages' },
    { key: 'saturday', label: 'Gardes & Perm.', icon: Moon, count: saturdayPlans.length, color: 'text-pink-600', bgColor: 'bg-pink-50', description: 'Plannings', route: 'saturday-plans' },
    { key: 'supervision', label: 'Supervisions', icon: Activity, count: supervisions.length, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Supervisions', route: 'supervision' },
    { key: 'engagements', label: 'Engagements', icon: AlertCircle, count: engagements.length, color: 'text-red-600', bgColor: 'bg-red-50', description: 'Engagements', route: 'commitments' },
    { key: 'expenses', label: 'Dépenses', icon: BarChart3, count: expenses.length, color: 'text-rose-600', bgColor: 'bg-rose-50', description: 'Dépenses', route: 'accounting' },
    { key: 'employees', label: 'Salariés', icon: GraduationCap, count: employees.length, color: 'text-teal-600', bgColor: 'bg-teal-50', description: 'Personnel', route: 'payroll' },
  ], [students, payments, grades, subjects, attendance, stages, saturdayPlans, supervisions, engagements, expenses, employees]);

  const filtered = useMemo(() => {
    let c = categories;
    if (search) {
      const q = search.toLowerCase();
      c = c.filter(x => x.label.toLowerCase().includes(q) || x.description.toLowerCase().includes(q));
    }
    if (filter === 'synced') c = c.filter(x => x.count > 0);
    else if (filter === 'empty') c = c.filter(x => x.count === 0);
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

  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 40, opacity: 1 }}
        className="flex flex-col items-center py-4 bg-white border-l border-[#e8ecf0]"
        style={{ boxShadow: '-2px 0 8px rgba(0,0,0,0.02)' }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors"
          title="Développer l'index"
        >
          <PanelRightOpen size={18} />
        </button>
        <div className="mt-3 space-y-2">
          {categories.slice(0, 5).map((cat, i) => (
            <div key={cat.key} className="relative group">
              <div className={`w-2.5 h-2.5 rounded-full mx-auto ${cat.count > 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#123b68] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {cat.label}: {cat.count}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col bg-white border-l border-[#e8ecf0] overflow-hidden"
      style={{ boxShadow: '-2px 0 12px rgba(0,0,0,0.03)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Database size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#123b68]">Index des données</h3>
            <p className="text-[10px] text-gray-400">{totalRecords} enregistrements</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-md hover:bg-gray-50 text-gray-400 transition-colors"
          title="Réduire"
        >
          <PanelRightClose size={16} />
        </button>
      </div>

      {/* Cloud sync status */}
      <div className="px-4 pt-3">
        <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
          cloudStatus === 'success'
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-amber-50 border-amber-100 text-amber-700'
        }`}>
          {cloudStatus === 'success' ? <Cloud size={14} /> : <CloudOff size={14} />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium truncate">
              {cloudStatus === 'success'
                ? `Sync: ${new Date(index.lastSync).toLocaleDateString('fr-FR')}`
                : 'Aucune sync cloud'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="px-4 pt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-[#123b68]">{activeStudents}</p>
          <p className="text-[10px] text-gray-500">Actifs</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
          <p className="text-sm font-bold text-[#d4af37]">{(totalPaid / 1000).toFixed(0)}k</p>
          <p className="text-[10px] text-gray-500">Encaissé</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]/10 transition-all"
          />
        </div>
      </div>

      {/* Categories list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <AnimatePresence>
          {filtered.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
            >
              <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center shrink-0`}>
                <cat.icon size={15} className={cat.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{cat.label}</p>
                <p className="text-[10px] text-gray-400 truncate">{cat.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${cat.color}`}>{cat.count}</p>
                <div className="w-12 h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((cat.count / Math.max(filtered.find(c => c.key === cat.key)?.count || 1, 50)) * 100, 100)}%`,
                      background: cat.color.replace('text-', '#').replace('blue-600', '#2563eb').replace('amber-600', '#d97706').replace('purple-600', '#7c3aed').replace('indigo-600', '#4f46e5').replace('green-600', '#16a34a').replace('cyan-600', '#0891b2').replace('pink-600', '#db2777').replace('orange-600', '#ea580c').replace('red-600', '#dc2626').replace('rose-600', '#e11d48').replace('teal-600', '#0d9488')
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-gray-400">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#f1f5f9] bg-gray-50/50">
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>Total: {totalRecords}</span>
          <span>Sync: {syncedRecords}</span>
        </div>
      </div>
    </motion.div>
  );
}
