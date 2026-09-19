import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Receipt, Search, Printer, Download } from 'lucide-react'; import { useApp } from '../context/AppContext';
import { generateReceiptHTML, openPrintWindow } from '../lib/receipt';

export default function Receipts() {
  const { payments, students } = useApp(); const [search, setSearch] = useState('');
  const filtered = useMemo(() => { if (!search) return payments; const q = search.toLowerCase(); return payments.filter(p => { const s = students.find(x => x.id === p.studentId); return p.receipt.toLowerCase().includes(q) || s?.name?.toLowerCase().includes(q) || s?.matricule?.toLowerCase().includes(q); }); }, [payments, search, students]);

  const printReceipt = (p: any) => {
    const s = students.find(x => x.id === p.studentId);
    const html = generateReceiptHTML(p, s);
    openPrintWindow(html);
  };

  const exportReceipts = () => {
    const data = { payments, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `receipts-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-white mb-1">Archives des reçus</h2><p className="text-slate-400 text-sm">{filtered.length} reçus enregistrés</p></div><div className="flex items-center gap-2"><button onClick={exportReceipts} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><Download size={16} /> Exporter</button></div></div>
      <div className="glass-panel rounded-xl p-4 mb-6"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher reçu, matricule ou élève..." className="w-full input-glass rounded-xl px-4 py-2.5" /></div>
      <div className="glass-panel rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>N° reçu</th><th>Date</th><th>Matricule</th><th>Élève</th><th>Motif</th><th>Montant</th><th>Action</th></tr></thead><tbody>
        {filtered.map((p, i) => { const s = students.find(x => x.id === p.studentId); return (<motion.tr key={p.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td className="font-mono text-amber-400/80">{p.receipt}</td><td>{p.date}</td><td className="font-mono text-blue-400">{s?.matricule||'—'}</td><td className="font-medium text-white">{s?.name||'—'}</td><td><span className="badge-blue">{p.reason}</span>{p.reason2 && <span className="badge-amber ml-1">{p.reason2}</span>}</td><td className="font-semibold text-green-400">{p.amount.toLocaleString('fr-FR')} F</td><td><button onClick={() => printReceipt(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"><Printer size={16} /></button></td></motion.tr>); })}
      </tbody></table></div>{filtered.length===0 && <div className="p-12 text-center"><Receipt className="mx-auto mb-4 text-slate-600" size={48} /><p className="text-slate-500">Aucun reçu trouvé</p></div>}</div>
    </div>
  );
}
