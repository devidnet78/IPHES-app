import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Plus, Trash2, Calculator, TrendingUp, Wallet } from 'lucide-react'; import { useApp, generateId } from '../context/AppContext'; import Modal from '../components/Modal'; import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
const COLORS = ['#d4af37','#ef4444','#1e40af','#22c55e','#8b5cf6','#f59e0b'];
export default function Accounting() {
  const { expenses, addExpense, deleteExpense } = useApp(); const [search, setSearch] = useState(''); const [month, setMonth] = useState(''); const [isModal, setIsModal] = useState(false);
  const [form, setForm] = useState({ date:'', category:'Salaires', label:'', beneficiary:'', amount:'', mode:'Espèces' });
  const filtered = useMemo(() => { let r = expenses; if (search) r = r.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.beneficiary.toLowerCase().includes(search.toLowerCase())); if (month) r = r.filter(e => e.date.startsWith(month)); return r; }, [expenses, search, month]);
  const totals = useMemo(() => { const t = filtered.reduce((s, e) => s + e.amount, 0); const bc = filtered.reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a; }, {} as Record<string, number>); return { total: t, byCategory: bc }; }, [filtered]);
  const pieData = useMemo(() => Object.entries(totals.byCategory).map(([n, v]) => ({ name: n, value: v / 1000 })), [totals]);
  const handleSubmit = () => { if (!form.label || !form.amount) return; addExpense({ id: generateId(), date: form.date || new Date().toISOString().split('T')[0], category: form.category, label: form.label, beneficiary: form.beneficiary, amount: Number(form.amount), mode: form.mode }); setIsModal(false); setForm({ date:'', category:'Salaires', label:'', beneficiary:'', amount:'', mode:'Espèces' }); };
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-white mb-1">Comptabilité</h2><p className="text-slate-400 text-sm">Suivi des dépenses et recettes</p></div><button onClick={() => setIsModal(true)} className="btn-gold rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm"><Plus size={18} /> Dépense</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="glass-card rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-4"><TrendingUp size={20} className="text-green-400" /></div><p className="text-2xl font-bold text-white">{totals.total.toLocaleString('fr-FR')} F</p><p className="text-sm text-slate-400">Total dépenses</p></div>
        <div className="glass-card rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4"><Wallet size={20} className="text-blue-400" /></div><p className="text-2xl font-bold text-white">{filtered.length}</p><p className="text-sm text-slate-400">Nombre de dépenses</p></div>
        <div className="glass-card rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4"><Calculator size={20} className="text-amber-400" /></div><p className="text-2xl font-bold text-white">{Object.keys(totals.byCategory).length}</p><p className="text-sm text-slate-400">Catégories</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-4"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="flex-1 input-glass rounded-xl px-4 py-2.5" /><input type="month" value={month} onChange={e => setMonth(e.target.value)} className="input-glass rounded-xl px-4 py-2.5" /></div>
          <div className="glass-panel rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>Date</th><th>Catégorie</th><th>Libellé</th><th>Bénéficiaire</th><th>Montant</th><th>Mode</th><th></th></tr></thead><tbody>
            {filtered.map((e, i) => (<motion.tr key={e.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td>{e.date}</td><td><span className="badge-blue">{e.category}</span></td><td className="text-white">{e.label}</td><td>{e.beneficiary}</td><td className="font-semibold text-red-400">{e.amount.toLocaleString('fr-FR')} F</td><td>{e.mode}</td><td><button onClick={() => deleteExpense(e.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button></td></motion.tr>))}
          </tbody></table></div></div>
        </div>
        <div className="glass-panel rounded-2xl p-6"><h3 className="text-lg font-semibold text-white mb-4">Répartition</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData.length?pieData:[{name:'N/A',value:1}]} cx="50%" cy="50%" outerRadius={80} dataKey="value">{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'#e2e8f0'}} /><Legend formatter={(value: any) => <span className="text-slate-300 text-sm">{value}</span>} /></PieChart></ResponsiveContainer></div></div>
      </div>
      <Modal isOpen={isModal} onClose={() => setIsModal(false)} title="Nouvelle dépense">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-slate-400 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Catégorie</label><select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3"><option>Salaires</option><option>Fournitures</option><option>Loyer</option><option>Services</option><option>Transport</option><option>Autre</option></select></div>
          <div className="md:col-span-2"><label className="block text-sm text-slate-400 mb-1">Libellé *</label><input value={form.label} onChange={e => setForm({...form,label:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3" placeholder="Description" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Bénéficiaire</label><input value={form.beneficiary} onChange={e => setForm({...form,beneficiary:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3" placeholder="Nom" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Montant (FCFA) *</label><input type="number" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3" placeholder="0" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Mode</label><select value={form.mode} onChange={e => setForm({...form,mode:e.target.value})} className="w-full input-glass rounded-xl px-4 py-3"><option>Espèces</option><option>Virement</option><option>Chèque</option></select></div>
        </div>
        <div className="flex justify-end gap-3 mt-6"><button onClick={() => setIsModal(false)} className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Annuler</button><button onClick={handleSubmit} className="btn-gold rounded-xl px-6 py-2.5">Enregistrer</button></div>
      </Modal>
    </div>
  );
}
