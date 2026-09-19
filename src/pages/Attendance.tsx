import { useState, useMemo } from 'react'; import { motion } from 'framer-motion'; import { CheckSquare, Save, Calendar, Clock } from 'lucide-react'; import { useApp, CLASSES, generateId } from '../context/AppContext';
export default function Attendance() {
  const { students, attendance, addAttendance, allowedClasses, currentRole } = useApp(); const [date, setDate] = useState(new Date().toISOString().split('T')[0]); const [classFilter, setClassFilter] = useState(''); const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const avail = currentRole === 'responsible' ? allowedClasses : CLASSES;
  const cStudents = useMemo(() => classFilter ? students.filter(s => s.class === classFilter && s.active !== false) : [], [students, classFilter]);
  const existing = useMemo(() => attendance.filter(a => a.date === date && a.className === classFilter), [attendance, date, classFilter]);
  const getStatus = (sid: string) => { if (statusMap[sid]) return statusMap[sid]; const ex = existing.find(a => a.studentId === sid); return ex?.status || 'present'; };
  const setStatus = (sid: string, st: string) => setStatusMap(prev => ({ ...prev, [sid]: st }));
  const handleSave = () => { cStudents.forEach(s => { const st = getStatus(s.id) as any; if (st === 'present') return; const ex = existing.find(a => a.studentId === s.id); addAttendance({ id: ex?.id || generateId(), date, className: classFilter, studentId: s.id, status: st }); }); alert('Feuille de présence enregistrée !'); };
  const statusOpts = [{ v: 'present', l: 'Présent', c: 'badge-green' }, { v: 'late', l: 'Retard', c: 'badge-amber' }, { v: 'absent-morning', l: 'Absent matin', c: 'badge-red' }, { v: 'absent-afternoon', l: 'Absent après-midi', c: 'badge-red' }];
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h2 className="text-2xl font-bold text-white mb-1">Présences</h2><p className="text-slate-400 text-sm">Feuille de présence quotidienne</p></div><div className="flex items-center gap-3"><img src="/3d-calendar-iso.png" alt="" className="w-12 h-12 object-contain opacity-60 hidden md:block" /><button onClick={handleSave} className="btn-gold rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm"><Save size={18} /> Enregistrer</button></div></div>
      <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4"><input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-glass rounded-xl px-4 py-2.5" /><select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input-glass rounded-xl px-4 py-2.5"><option value="">Choisir une classe...</option>{avail.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      {classFilter && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="table-glass"><thead><tr><th>Nom et prénom</th><th>Matricule</th><th>État</th><th>Actions</th></tr></thead><tbody>
            {cStudents.map((s, i) => { const st = getStatus(s.id); return (<motion.tr key={s.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}><td className="font-medium text-white">{s.name}</td><td className="font-mono text-amber-400/80">{s.matricule}</td><td>{st === 'present' ? <span className="badge-green">Présent</span> : st === 'late' ? <span className="badge-amber bg-amber-500/10 text-amber-400 border-amber-500/20">Retard</span> : <span className="badge-red">Absent</span>}</td><td><div className="flex gap-2">{statusOpts.map(opt => (<button key={opt.v} onClick={() => setStatus(s.id, opt.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${st === opt.v ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'}`}>{opt.l}</button>))}</div></td></motion.tr>); })}
          </tbody></table></div>
        </div>
      )}
      {!classFilter && <div className="glass-panel rounded-2xl p-12 text-center"><CheckSquare className="mx-auto mb-4 text-slate-600" size={48} /><p className="text-slate-500">Sélectionnez une classe et une date pour gérer les présences</p></div>}
    </div>
  );
}
