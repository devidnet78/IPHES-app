import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Bell, MessageCircle, Search, Phone } from 'lucide-react'; import { useApp, TARIFFS, CLASSES } from '../context/AppContext';
export default function Reminders() {
  const { students, payments } = useApp(); const [search, setSearch] = useState(''); const [classFilter, setClassFilter] = useState('');
  const reminders = useMemo(() => {
    return students.filter(s => s.active !== false).map(s => {
      const t = TARIFFS[s.class] || [0, 0, 0]; const totalDue = t[0] + t[1] + t[2]; const paid = payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0); const balance = totalDue - paid;
      return { student: s, totalDue, paid, balance };
    }).filter(r => r.balance > 0).filter(r => { if (classFilter && r.student.class !== classFilter) return false; if (search) return r.student.name.toLowerCase().includes(search.toLowerCase()); return true; });
  }, [students, payments, classFilter, search]);
  const sendWA = (s: typeof students[0], balance: number) => { const msg = `Bonjour, c'est l'administration IPHES. Le solde de scolarité de ${s.name} (${s.class}) est de ${balance.toLocaleString('fr-FR')} FCFA. Merci de régulariser votre situation.`; const phone = s.phone?.replace(/[^0-9]/g, '') || ''; if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank'); };
  const sendGroup = () => { const msg = reminders.map(r => `${r.student.name}: ${r.balance.toLocaleString('fr-FR')} F`).join('\n'); window.open(`https://wa.me/?text=${encodeURIComponent('Rappel IPHES - Solde scolarité:\n' + msg)}`, '_blank'); };
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-white mb-1">Relances WhatsApp</h2><p className="text-slate-400 text-sm">{reminders.length} élèves avec solde impayé</p></div><button onClick={sendGroup} className="btn-gold rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm"><MessageCircle size={18} /> Message groupe</button></div>
      <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un élève..." className="w-full input-glass rounded-xl pl-10 pr-4 py-2.5" /></div><select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input-glass rounded-xl px-4 py-2.5"><option value="">Toutes les classes</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="glass-panel rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>Élève</th><th>Classe</th><th>Téléphone</th><th>Total dû</th><th>Payé</th><th>Solde</th><th>Action</th></tr></thead><tbody>
        {reminders.map((r, i) => (<motion.tr key={r.student.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td className="font-medium text-white">{r.student.name}</td><td><span className="badge-blue">{r.student.class}</span></td><td>{r.student.phone}</td><td className="font-semibold">{r.totalDue.toLocaleString('fr-FR')} F</td><td className="text-green-400">{r.paid.toLocaleString('fr-FR')} F</td><td className="text-red-400 font-bold">{r.balance.toLocaleString('fr-FR')} F</td><td><button onClick={() => sendWA(r.student, r.balance)} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"><Phone size={16} /></button></td></motion.tr>))}
      </tbody></table></div>{reminders.length===0 && <div className="p-12 text-center"><Bell className="mx-auto mb-4 text-slate-600" size={48} /><p className="text-slate-500">Aucun relance nécessaire</p></div>}</div>
    </div>
  );
}
