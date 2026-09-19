import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Search, Plus, Trash2, CreditCard, Printer, BarChart3, BookOpen } from 'lucide-react'; import { useApp, generateId, CLASSES, TARIFFS } from '../context/AppContext'; import Modal from '../components/Modal';
import { generateReceiptHTML, openPrintWindow } from '../lib/receipt';

export default function Payments() {
  const { students, payments, addPayment, deletePayment } = useApp(); const [search, setSearch] = useState(''); const [isModal, setIsModal] = useState(false);
  const [form, setForm] = useState({ studentId:'', receipt:'', date:'', reason1:'Inscription', reason2:'', amount1:'', amount2:'', mode:'Espèces', year:'1ère année', observation:'' });
  const filtered = useMemo(() => { let r = payments; if (search) { const q = search.toLowerCase(); r = r.filter(p => { const s = students.find(x => x.id === p.studentId); return p.receipt.toLowerCase().includes(q) || s?.name?.toLowerCase().includes(q) || s?.matricule?.toLowerCase().includes(q); }); } return r.sort((a,b) => b.date.localeCompare(a.date)); }, [payments, search, students]);
  const handleSubmit = () => { if (!form.studentId) return; const a1 = Number(form.amount1)||0, a2 = Number(form.amount2)||0; const total = a1 + a2; addPayment({ id: generateId(), studentId: form.studentId, receipt: form.receipt || `R${String(payments.length+1).padStart(5,'0')}`, date: form.date || new Date().toISOString().split('T')[0], reason: form.reason1, reason2: form.reason2, amount: total, amount1: a1, amount2: a2, mode: form.mode, year: form.year, observation: form.observation }); setIsModal(false); setForm({ studentId:'', receipt:'', date:'', reason1:'Inscription', reason2:'', amount1:'', amount2:'', mode:'Espèces', year:'1ère année', observation:'' }); };
  const totalMonth = filtered.filter(p => p.date.startsWith(new Date().toISOString().slice(0,7))).reduce((s,p) => s+p.amount,0);
  const totalAll = filtered.reduce((s,p) => s+p.amount,0);

  const printReceipt = (p: any) => {
    const s = students.find(x => x.id === p.studentId);
    const html = generateReceiptHTML(p, s);
    openPrintWindow(html);
  };

  const printSituationClass = () => {
    const classStats = CLASSES.map(cls => {
      const clsStudents = students.filter(s => s.active !== false && s.class === cls);
      if (!clsStudents.length) return null;
      const t = TARIFFS[cls] || [0,0,0]; const totalDue = t[0] + t[1] + t[2];
      let classDue = 0, classPaid = 0, classBalance = 0;
      const rows = clsStudents.map(s => {
        const paid = payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0);
        const due = s.annualTuition || totalDue; const rest = Math.max(0, due - paid);
        classDue += due; classPaid += paid; classBalance += rest;
        const ps = payments.filter(p => p.studentId === s.id);
        const details = ps.map(p => `${p.date}: ${p.reason} ${p.amount.toLocaleString('fr-FR')}F`).join('<br>');
        const yBreak = ps.map(p => p.year).filter((v,i,a) => a.indexOf(v)===i).join(', ');
        return { s, ps, sum: { due, paid, rest }, details, yBreak };
      });
      return { cls, rows, classDue, classPaid, classBalance };
    }).filter(Boolean);
    const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';
    let body = '';
    classStats.forEach(({ cls, rows, classDue, classPaid, classBalance }: any) => {
      body += `<h2 style="color:#123b68;margin-top:30px">Classe ${cls}</h2><table><thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th><th>Nb paiements</th><th>Total dû</th><th>Total payé</th><th>Reste</th><th>Détail</th></tr></thead><tbody>`;
      body += rows.map((x: any) => `<tr><td>${x.s.matricule}</td><td>${x.s.name}</td><td>${x.s.class}</td><td>${x.ps.length}</td><td>${fmt(x.sum.due)}</td><td><b>${fmt(x.sum.paid)}</b></td><td style="color:red"><b>${fmt(x.sum.rest)}</b></td><td>${x.details||'-'}<hr style="margin:4px 0;border:0;border-top:1px solid #ccc">${x.yBreak}</td></tr>`).join('');
      body += `<tfoot><tr><th colspan="4">TOTAUX ${cls}</th><th>${fmt(classDue)}</th><th>${fmt(classPaid)}</th><th style="color:red">${fmt(classBalance)}</th><th></th></tr></tfoot></tbody></table>`;
    });
    const w = window.open('about:blank', '_blank');
    if (w) { w.document.write(`<html><head><title>Situation paiements par classe</title><style>body{font-family:Arial;padding:22px}h1{text-align:center;color:#123b68}h2{color:#123b68}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #222;padding:7px;vertical-align:top}th{background:#eaf1fa}p{font-size:13px}.print{display:block;margin:20px auto;padding:10px 20px;background:#123b68;color:#fff;border:0;border-radius:5px;font-weight:bold}@media print{.print{display:none}}</style></head><body><h1>IPHES — SITUATION DES PAIEMENTS PAR CLASSE</h1><p><b>Règle :</b> Total dû = versement A1 + reste A1 + reste A2. Total payé = versement A1 + payé A2. Reste = reste A1 + reste A2.</p>${body}<button class="print" onclick="window.print()">Imprimer</button></body></html>`); w.document.close(); }
  };

  const printSituationCycle = () => {
    const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';
    const a = students.filter(s => s.active !== false);
    const rows = a.map(s => {
      const cells = [1,2,3].map(y => {
        const due = s.annualTuition || (TARIFFS[s.class] || [0,0,0]).reduce((a,b)=>a+b,0);
        const paid = payments.filter(p => p.studentId === s.id && p.year === `${y}ère année`).reduce((x,p) => x+p.amount,0);
        const rest = Math.max(0, due - paid);
        return { due, paid, rest };
      });
      const total = cells.reduce((x,c) => x+c.rest, 0);
      return { s, cells, total };
    });
    const body = rows.map(x => `<tr><td>${x.s.matricule}</td><td>${x.s.name}</td><td>${x.s.class}</td><td>${fmt(x.cells[0].due)}</td><td>${fmt(x.cells[0].paid)}</td><td>${fmt(x.cells[0].rest)}</td><td>${fmt(x.cells[1].due)}</td><td>${fmt(x.cells[1].paid)}</td><td>${fmt(x.cells[1].rest)}</td><td>${fmt(x.cells[2].due)}</td><td>${fmt(x.cells[2].paid)}</td><td>${fmt(x.cells[2].rest)}</td><td><b>${fmt(x.total)}</b></td></tr>`).join('');
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<html><head><title>Situation paiement cycle IPHES</title><style>@page{size:A4 landscape;margin:8mm}body{font-family:Arial}h1{text-align:center;color:#123b68}table{border-collapse:collapse;width:100%;font-size:9px}th,td{border:1px solid #222;padding:5px;text-align:center}th{background:#eaf1fa}.print{display:block;margin:15px auto;padding:9px 18px}@media print{.print{display:none}}</style></head><body><h1>IPHES — SITUATION DES PAIEMENTS DU CYCLE</h1><p>Situation globale des trois années de formation</p><table><thead><tr><th rowspan="2">Matricule</th><th rowspan="2">Nom et prénom</th><th rowspan="2">Classe</th><th colspan="3">1ère année</th><th colspan="3">2ème année</th><th colspan="3">3ème année</th><th rowspan="2">Reste total</th></tr><tr><th>Dû</th><th>Payé</th><th>Reste</th><th>Dû</th><th>Payé</th><th>Reste</th><th>Dû</th><th>Payé</th><th>Reste</th></tr></thead><tbody>${body}</tbody></table><button class="print" onclick="window.print()">Imprimer</button></body></html>`); w.document.close(); }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold text-[#123b68] mb-0.5">Paiements</h2><p className="text-sm text-gray-500">{filtered.length} paiements · {totalMonth.toLocaleString('fr-FR')} F ce mois</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={printSituationClass} className="btn-primary rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5"><BarChart3 size={14} /> Situation par classe</button>
          <button onClick={printSituationCycle} className="btn-primary rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5"><BookOpen size={14} /> Situation cycle 3 ans</button>
          <button onClick={() => setIsModal(true)} className="btn-gold rounded-lg px-4 py-2 flex items-center gap-1.5 text-xs"><Plus size={16} /> Enregistrer</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="glass-card rounded-lg p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><CreditCard size={18} className="text-blue-600" /></div><div><p className="text-xs text-gray-500">Paiements</p><p className="text-lg font-bold text-[#123b68]">{filtered.length}</p></div></div>
        <div className="glass-card rounded-lg p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center"><CreditCard size={18} className="text-amber-600" /></div><div><p className="text-xs text-gray-500">Ce mois</p><p className="text-lg font-bold text-[#123b68]">{totalMonth.toLocaleString('fr-FR')} F</p></div></div>
        <div className="glass-card rounded-lg p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CreditCard size={18} className="text-green-600" /></div><div><p className="text-xs text-gray-500">Total encaissé</p><p className="text-lg font-bold text-[#123b68]">{totalAll.toLocaleString('fr-FR')} F</p></div></div>
      </div>
      <div className="glass-panel rounded-lg p-3 mb-4"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par reçu, matricule ou nom..." className="w-full input-glass rounded-lg px-3 py-2 text-sm" /></div>
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead><tr><th>N° reçu</th><th>Date</th><th>Matricule</th><th>Élève</th><th>Motif</th><th>Montant</th><th>Mode</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p, i) => { const s = students.find(x => x.id === p.studentId); return (<motion.tr key={p.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.02 }}><td className="font-mono text-[#123b68] font-semibold text-xs">{p.receipt}</td><td className="text-gray-600">{p.date}</td><td className="font-mono text-blue-600 text-xs">{s?.matricule||'—'}</td><td className="font-medium text-gray-800">{s?.name||'—'}</td><td><span className="badge-blue">{p.reason}</span>{p.reason2 && <span className="badge-amber ml-1">{p.reason2}</span>}</td><td className="font-semibold text-green-600">{p.amount.toLocaleString('fr-FR')} F</td><td><span className="badge-green">{p.mode}</span></td><td><button onClick={() => printReceipt(p)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors" title="Imprimer le reçu"><Printer size={15} /></button><button onClick={() => deletePayment(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"><Trash2 size={15} /></button></td></motion.tr>); })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center"><CreditCard className="mx-auto mb-3 text-gray-300" size={40} /><p className="text-gray-400 text-sm">Aucun paiement enregistré</p></div>}
      </div>
      <Modal isOpen={isModal} onClose={() => setIsModal(false)} title="Enregistrer un paiement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Élève *</label><select value={form.studentId} onChange={e => setForm({...form,studentId:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option value="">Choisir...</option>{students.filter(s => s.active!==false).map(s => <option key={s.id} value={s.id}>{s.matricule} — {s.name} ({s.class})</option>)}</select></div>
          <div><label className="block text-xs text-gray-500 mb-1">N° reçu</label><input value={form.receipt} onChange={e => setForm({...form,receipt:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Auto-généré" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" /></div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Année</label><select value={form.year} onChange={e => setForm({...form,year:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option>1ère année</option><option>2ème année</option><option>3ème année</option></select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Motif 1</label><select value={form.reason1} onChange={e => setForm({...form,reason1:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option>Inscription</option><option>Scolarité</option><option>Inscription + scolarité</option></select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Montant 1</label><input type="number" value={form.amount1} onChange={e => setForm({...form,amount1:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="0" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Motif 2</label><select value={form.reason2} onChange={e => setForm({...form,reason2:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option value="">Aucun</option><option>Tenue scolaire</option><option>Badge</option><option>Hidjab</option><option>Kit de stage</option><option>Casier judiciaire</option><option>Visite contre-visite</option><option>Autre frais</option></select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Montant 2</label><input type="number" value={form.amount2} onChange={e => setForm({...form,amount2:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="0" /></div>
          <div className="md:col-span-2"><div className="glass-card rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total payé</p><p className="text-xl font-bold text-[#d4af37]">{(Number(form.amount1||0)+Number(form.amount2||0)).toLocaleString('fr-FR')} F</p></div></div>
          <div><label className="block text-xs text-gray-500 mb-1">Mode</label><select value={form.mode} onChange={e => setForm({...form,mode:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option>Espèces</option><option>Mobile Money</option><option>Virement</option></select></div>
          <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-1">Observation</label><input value={form.observation} onChange={e => setForm({...form,observation:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Observation..." /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5"><button onClick={() => setIsModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm transition-colors">Annuler</button><button onClick={handleSubmit} className="btn-gold rounded-lg px-5 py-2 text-sm">Enregistrer</button></div>
      </Modal>
    </div>
  );
}
