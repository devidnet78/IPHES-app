import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Users, DollarSign, AlertTriangle, Clock, TrendingUp, BookOpen, GraduationCap, Wallet, Activity, Receipt, CreditCard, Stethoscope } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = ['#d4af37', '#123b68', '#22c55e', '#ef4444', '#8b5cf6', '#f59e0b'];
const PIE_COLORS = ['#d4af37', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as const } } };

export default function Dashboard() {
  const { students, payments, expenses, stages, attendance, grades } = useApp();

  const stats = useMemo(() => {
    const active = students.filter(s => s.active !== false).length;
    const archived = students.filter(s => s.active === false).length;
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalPaid - totalExp;
    const overdue = students.filter(s => {
      const t = [27500, 165000, 35000]; const totalDue = t[0] + t[1] + t[2];
      const paid = payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0);
      return totalDue - paid > 0;
    }).length;
    return { active, archived, totalPaid, totalExp, balance, overdue, stageCount: stages.length, attendanceCount: attendance.length };
  }, [students, payments, expenses, stages, attendance]);

  const paymentData = useMemo(() => {
    const months: Record<string, number> = {};
    payments.forEach(p => { const m = p.date.slice(0, 7); months[m] = (months[m] || 0) + p.amount; });
    return Object.entries(months).sort().slice(-6).map(([m, v]) => ({ month: m, amount: Math.round(v / 1000) }));
  }, [payments]);

  const expenseData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    return Object.entries(cats).map(([n, v]) => ({ name: n, value: v }));
  }, [expenses]);

  const classData = useMemo(() => {
    const c: Record<string, number> = {};
    students.filter(s => s.active !== false).forEach(s => { c[s.class] = (c[s.class] || 0) + 1; });
    return Object.entries(c).map(([n, v]) => ({ name: n, value: v })).slice(0, 6);
  }, [students]);

  const trendData = useMemo(() => {
    const months = [...new Set([...payments.map(p => p.date.slice(0, 7)), ...expenses.map(e => e.date.slice(0, 7))])].sort().slice(-6);
    return months.map(m => ({
      month: m,
      encaissements: Math.round(payments.filter(p => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0) / 1000),
      depenses: Math.round(expenses.filter(e => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0) / 1000),
    }));
  }, [payments, expenses]);

  const radarData = useMemo(() => [
    { subject: 'Élèves', A: stats.active, fullMark: Math.max(stats.active * 1.2, 100) },
    { subject: 'Paiements', A: Math.round(stats.totalPaid / 10000), fullMark: Math.max(Math.round(stats.totalPaid / 10000) * 1.2, 50) },
    { subject: 'Stages', A: stats.stageCount, fullMark: Math.max(stats.stageCount * 1.2, 20) },
    { subject: 'Présences', A: stats.attendanceCount, fullMark: Math.max(stats.attendanceCount * 1.2, 50) },
    { subject: 'Notes', A: grades.length, fullMark: Math.max(grades.length * 1.2, 50) },
  ], [stats, grades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#123b68', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', color: '#fff' }}>
        <p className="font-semibold text-[#d4af37] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i}><span style={{ color: p.color }}>●</span> {p.name}: <b>{p.value}{p.name === 'amount' ? 'k' : ''} F</b></p>
        ))}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, sub, color, delay }: any) => (
    <motion.div variants={itemVariants} className="glass-card rounded-xl p-5 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -mr-6 -mt-6 transition-transform group-hover:scale-125 duration-500`} style={{ background: color }} />
      <div className="relative flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          <p className="text-xl font-bold text-[#123b68]">{value}</p>
          {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#123b68] mb-0.5">Tableau de bord</h2>
          <p className="text-sm text-gray-500">Vue d'ensemble de l'institut</p>
        </div>
        <div className="hidden md:block w-24 h-16 opacity-50">
          <img src="/3d-dashboard.png" alt="" className="w-full h-full object-contain" />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Élèves actifs" value={stats.active} sub={`${stats.archived} archivés`} color="#123b68" delay={0} />
        <StatCard icon={DollarSign} label="Total encaissé" value={`${(stats.totalPaid / 1000).toFixed(0)}k F`} color="#d4af37" delay={0.1} />
        <StatCard icon={Wallet} label="Solde caisse" value={`${(stats.balance / 1000).toFixed(0)}k F`} color="#22c55e" delay={0.2} />
        <StatCard icon={AlertTriangle} label="Soldes impayés" value={stats.overdue} color="#ef4444" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#123b68] text-sm">Encaissements mensuels</h3>
              <p className="text-[10px] text-gray-400">En milliers de F CFA</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={36} fill="#123b68" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Activity size={18} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#123b68] text-sm">Activité globale</h3>
              <p className="text-[10px] text-gray-400">Vue synthétique</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis stroke="#e2e8f0" fontSize={9} />
                <Radar name="IPHES" dataKey="A" stroke="#123b68" strokeWidth={2} fill="rgba(18, 59, 104, 0.08)" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#123b68] text-sm">Dépenses par catégorie</h3>
              <p className="text-[10px] text-gray-400">Répartition financière</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={30} iconSize={8} formatter={(value: any) => <span className="text-gray-500 text-[10px]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <GraduationCap size={18} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#123b68] text-sm">Répartition par classe</h3>
              <p className="text-[10px] text-gray-400">Élèves actifs</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classData} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {classData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Clock size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#123b68] text-sm">Tendances</h3>
              <p className="text-[10px] text-gray-400">Encaissements vs dépenses</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value: any) => <span className="text-gray-500 text-[10px]">{value}</span>} />
                <Line type="monotone" dataKey="encaissements" stroke="#d4af37" strokeWidth={2.5} dot={{ fill: '#d4af37', r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="flex justify-center opacity-30">
        <img src="/3d-campus-hero.png" alt="" className="w-36 h-24 object-contain" />
      </motion.div>
    </motion.div>
  );
}
