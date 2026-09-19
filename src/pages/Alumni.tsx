import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { Archive, Search, GraduationCap, RotateCcw } from 'lucide-react'; import { useApp } from '../context/AppContext';
export default function Alumni() {
  const { alumni, restoreStudent } = useApp(); const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return alumni; const q = search.toLowerCase();
    return alumni.filter(a => a.name.toLowerCase().includes(q) || a.matricule?.toLowerCase().includes(q));
  }, [alumni, search]);
  return (
    <div>
      <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-1">Anciens élèves</h2><p className="text-slate-400 text-sm">{filtered.length} anciens élèves archivés</p></div>
      <div className="glass-panel rounded-xl p-4 mb-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un ancien élève..." className="w-full input-glass rounded-xl pl-10 pr-4 py-2.5" /></div></div>
      <div className="glass-panel rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>Matricule</th><th>Nom et prénom</th><th>Dernière classe</th><th>Date d'archivage</th><th>Promotion</th><th>Action</th></tr></thead><tbody>
        {filtered.map((a, i) => (<motion.tr key={a.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td className="font-mono text-amber-400/80">{a.matricule}</td><td className="font-medium text-white">{a.name}</td><td><span className="badge-blue">{a.class}</span></td><td>{a.archivedAt||'-'}</td><td>{a.promotion}</td><td><button onClick={() => restoreStudent(a.id)} className="p-2 rounded-lg hover:bg-green-500/10 text-green-400 transition-colors"><RotateCcw size={16} /></button></td></motion.tr>))}
      </tbody></table></div>{filtered.length===0 && <div className="p-12 text-center"><GraduationCap className="mx-auto mb-4 text-slate-600" size={48} /><p className="text-slate-500">Aucun ancien élève trouvé</p></div>}</div>
    </div>
  );
}
