import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Calendar, AlertTriangle, Phone, Printer } from 'lucide-react'; import { useApp, TARIFFS } from '../context/AppContext';

export default function Deadlines() {
  const { students, payments, engagements } = useApp();
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  const deadlines = useMemo(() => {
    return students.filter(s => s.active !== false).map(s => {
      const t = TARIFFS[s.class] || [0, 0, 0]; const totalDue = t[0] + t[1] + t[2];
      const paid = payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0);
      const rest = Math.max(0, totalDue - paid);
      const eng = engagements.find(e => e.studentId === s.id && e.status === 'Actif');
      return { student: s, rest, paid: paid, totalDue, eng };
    }).filter(d => d.rest > 0).sort((a,b) => b.rest - a.rest);
  }, [students, payments, engagements]);

  const sendWA = (s: any, balance: number) => {
    const text = `Bonjour,\n\nCeci est un rappel de l'IPHES concernant les frais de scolarité de *${s.name}* (${s.matricule}).\n\nMontant dû : *${balance.toLocaleString('fr-FR')} F CFA*\n\nMerci de régulariser votre situation dans les plus brefs délais.\n\nCordialement,\nIPHES - Direction`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const printMessages = () => {
    const html = `<html><head><title>Messages d'échéances</title><style>body{font-family:Arial;padding:40px}h1{text-align:center;color:#123b68}p{font-size:14px;line-height:1.6;border:1px solid #ccc;padding:15px;margin:15px 0;border-radius:5px}.name{font-weight:bold;color:#123b68}@media print{body{padding:20px}}</style></head><body><h1>IPHES — Messages de relance des échéances</h1><p style="text-align:center;font-size:12px;color:#666">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>${deadlines.map(d => `<p><span class="name">${d.student.name}</span> (${d.student.matricule}) — Classe ${d.student.class}<br><br>Bonjour,<br><br>Ceci est un rappel de l'IPHES concernant les frais de scolarité de <b>${d.student.name}</b> (${d.student.matricule}).<br><br>Montant dû : <b>${d.rest.toLocaleString('fr-FR')} F CFA</b><br><br>Merci de régulariser votre situation dans les plus brefs délais.<br><br>Cordialement,<br>IPHES - Direction</p>`).join('')}</body></html>`;
    const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-white mb-1">Échéances de paiement</h2><p className="text-slate-400 text-sm">{deadlines.length} échéances dépassées</p></div><div className="flex items-center gap-2"><button onClick={printMessages} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><Printer size={16} /> Imprimer messages</button></div></div>
      <div className="glass-panel rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>Élève</th><th>Matricule</th><th>Classe</th><th>Montant dû</th><th>Payé</th><th>Reste</th><th>Engagement</th><th>WhatsApp</th></tr></thead><tbody>
        {deadlines.map((d, i) => (<motion.tr key={d.student.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td className="font-medium text-white">{d.student.name}</td><td className="font-mono text-blue-400">{d.student.matricule}</td><td><span className="badge-blue">{d.student.class}</span></td><td className="font-semibold">{d.totalDue.toLocaleString('fr-FR')} F</td><td>{d.paid.toLocaleString('fr-FR')} F</td><td className="text-red-400 font-bold">{d.rest.toLocaleString('fr-FR')} F</td><td>{d.eng ? <span className="badge-amber">{d.eng.deadline}</span> : <span className="text-slate-500">—</span>}</td><td><button onClick={() => sendWA(d.student, d.rest)} className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"><Phone size={16} /></button></td></motion.tr>))}
      </tbody></table></div>{deadlines.length===0 && <div className="p-12 text-center"><Calendar className="mx-auto mb-4 text-slate-600" size={48} /><p className="text-slate-500">Aucune échéance dépassée</p></div>}</div>
    </div>
  );
}
