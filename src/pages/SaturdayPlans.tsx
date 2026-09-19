import { useState, useMemo, useCallback } from 'react'; import { motion } from 'framer-motion'; import { Moon, Plus, Trash2, Save, Printer, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'; import { useApp, CLASSES, generateId } from '../context/AppContext';
import Modal from '../components/Modal';

const LEVEL_META: Record<string, { label: string; classes: string[]; defaults: { code: string; detail: string }[] }> = {
  'ASB2': { label: 'ASB DEUXIEME ANNEE', classes: ['ASB2A','ASB2B'], defaults: [{ code: 'CHR', detail: 'Urgences Pédiatriques' }, { code: 'CSI', detail: 'Bobiel Barkalleyzé' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Chirurgie' }, { code: 'MATERNITE', detail: 'Dar Salam' }] },
  'ASB3': { label: 'ASB TROISIEME ANNEE', classes: ['ASB3A','ASB3B'], defaults: [{ code: 'CHR', detail: 'Urgences Médicales' }, { code: 'CSI', detail: 'Boukoki' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Chirurgie' }, { code: 'MATERNITE', detail: 'Koira Kano' }] },
  'LSI2': { label: 'LSI DEUXIEME ANNEE', classes: ['LSI2'], defaults: [{ code: 'CHR', detail: 'Chirurgie' }, { code: 'CSI', detail: 'CSI' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Urgences' }, { code: 'MATERNITE', detail: 'Maternité' }] },
  'LSO2': { label: 'LSO DEUXIEME ANNEE', classes: ['LSO2'], defaults: [{ code: 'CHR', detail: 'Chirurgie' }, { code: 'CSI', detail: 'CSI' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Urgences' }, { code: 'MATERNITE', detail: 'Maternité' }] },
  'LSI3': { label: 'LSI TROISIEME ANNEE', classes: ['LSI3'], defaults: [{ code: 'CHR', detail: 'Chirurgie' }, { code: 'CSI', detail: 'CSI' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Urgences' }, { code: 'MATERNITE', detail: 'Maternité' }] },
  'LSO3': { label: 'LSO TROISIEME ANNEE', classes: ['LSO3'], defaults: [{ code: 'CHR', detail: 'Chirurgie' }, { code: 'CSI', detail: 'CSI' }, { code: 'HHN', detail: 'Médecine' }, { code: 'HNABD', detail: 'Urgences' }, { code: 'MATERNITE', detail: 'Maternité' }] },
};

function toISODate(d: Date) { const x = new Date(d.getTime()); x.setHours(12, 0, 0, 0); return x.toISOString().slice(0, 10); }
function parseISODate(s: string) { if (!s) return null; const p = s.split('-'); if (p.length < 3) return null; return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0); }
function isSaturday(d: Date) { return d.getDay() === 6; }
function nextSaturdayOnOrAfter(d: Date) { const x = new Date(d.getTime()); x.setHours(12, 0, 0, 0); while (x.getDay() !== 6) x.setDate(x.getDate() + 1); return x; }
function buildTenSaturdays(firstISO: string) { let d = parseISODate(firstISO); if (!d) d = nextSaturdayOnOrAfter(new Date()); if (!isSaturday(d)) d = nextSaturdayOnOrAfter(d); const out = []; for (let i = 0; i < 10; i++) { const x = new Date(d.getTime()); x.setDate(d.getDate() + i * 7); out.push(toISODate(x)); } return out; }
function rotateServices(services: any[], shift: number) { const n = services.length; const out = []; for (let i = 0; i < n; i++) out.push(services[(i + shift) % n]); return out; }
function defaultGroupCols(base: any[], gi: number) { const rotated = rotateServices(base, gi % base.length); return rotated.map(s => ({ code: s.code, detail: s.detail || '' })); }
function fmtFR(s: string) { const d = parseISODate(s); if (!d) return s; return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getFullYear()).slice(-2); }

export default function SaturdayPlans() {
  const { students, saturdayPlans, addSaturdayPlan, updateSaturdayPlan, deleteSaturdayPlan } = useApp();
  const [kind, setKind] = useState<'Garde' | 'Permanence'>('Permanence');
  const [levelKey, setLevelKey] = useState('ASB2');
  const [plan, setPlan] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  const meta = LEVEL_META[levelKey] || { label: levelKey, classes: [levelKey], defaults: Array.from({ length: 5 }, (_, i) => ({ code: 'SERVICE ' + (i + 1), detail: '' })) };

  const initPlan = useCallback(() => {
    const d = nextSaturdayOnOrAfter(new Date()); const first = toISODate(d); const sats = buildTenSaturdays(first);
    const base = meta.defaults.map(s => ({ code: s.code, detail: s.detail || '' }));
    const eligible = students.filter(s => s.active !== false && meta.classes.includes(s.class)).sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name));
    const groups: any[] = []; for (let i = 0; i < Math.max(eligible.length, 1); i += 4) { const chunk: any[] = eligible.slice(i, i + 4); while (chunk.length < 4) chunk.push(null); groups.push({ studentIds: chunk.map(s => s ? s.id : ''), columns: defaultGroupCols(base, groups.length) }); }
    if (!groups.length) groups.push({ studentIds: ['', '', '', ''], columns: defaultGroupCols(base, 0) });
    return { id: generateId(), kind, levelKey, classLabel: meta.label, firstSaturday: first, saturdays: sats, services: base, groups };
  }, [meta, students, kind, levelKey]);

  const currentPlan = useMemo(() => {
    if (plan) return plan;
    const existing = saturdayPlans.find(p => p.kind === kind && p.levelKey === levelKey);
    if (existing) return existing;
    return initPlan();
  }, [plan, saturdayPlans, kind, levelKey, initPlan]);

  const setCurrentPlan = (p: any) => { setPlan(p); };

  const savePlan = () => { const existing = saturdayPlans.find(p => p.id === currentPlan.id); if (existing) updateSaturdayPlan(currentPlan); else addSaturdayPlan(currentPlan); alert('Planning enregistré !'); };

  const rebuildGroups = () => {
    const eligible = students.filter(s => s.active !== false && meta.classes.includes(s.class)).sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name));
    const oldGroups = currentPlan.groups || [];
    const groups = [];
    for (let i = 0; i < Math.max(eligible.length, 1); i += 4) { const chunk: any[] = eligible.slice(i, i + 4); while (chunk.length < 4) chunk.push(null); const gi: number = groups.length; const prev: any = oldGroups[gi]; groups.push({ studentIds: chunk.map(s => s ? s.id : ''), columns: prev?.columns?.length === 5 ? prev.columns : defaultGroupCols(currentPlan.services, gi) }); }
    if (!groups.length) groups.push({ studentIds: ['', '', '', ''], columns: defaultGroupCols(currentPlan.services, 0) });
    setCurrentPlan({ ...currentPlan, groups });
  };

  const addGroup = () => { const groups = [...currentPlan.groups, { studentIds: ['', '', '', ''], columns: defaultGroupCols(currentPlan.services, currentPlan.groups.length) }]; setCurrentPlan({ ...currentPlan, groups }); };
  const removeGroup = (gi: number) => { if (currentPlan.groups.length <= 1) { alert('Il faut au moins un groupe.'); return; } const groups = [...currentPlan.groups]; groups.splice(gi, 1); setCurrentPlan({ ...currentPlan, groups }); };

  const updateSvc = (i: number, code: string) => { const services = [...currentPlan.services]; services[i] = { ...services[i], code }; setCurrentPlan({ ...currentPlan, services }); };
  const updateGroupStudent = (gi: number, ni: number, id: string) => { const groups = [...currentPlan.groups]; groups[gi].studentIds[ni] = id; setCurrentPlan({ ...currentPlan, groups }); };
  const updateGroupCol = (gi: number, ci: number, code: string) => { const groups = [...currentPlan.groups]; groups[gi].columns[ci] = { ...groups[gi].columns[ci], code }; setCurrentPlan({ ...currentPlan, groups }); };
  const updateGroupDetail = (gi: number, ci: number, detail: string) => { const groups = [...currentPlan.groups]; groups[gi].columns[ci] = { ...groups[gi].columns[ci], detail }; setCurrentPlan({ ...currentPlan, groups }); };
  const updateFirstSat = (v: string) => { const d = parseISODate(v); if (!d) return; let fd = d; if (!isSaturday(d)) fd = nextSaturdayOnOrAfter(d); const sats = buildTenSaturdays(toISODate(fd)); setCurrentPlan({ ...currentPlan, firstSaturday: toISODate(fd), saturdays: sats }); };
  const updateSat = (i: number, v: string) => { const sats = [...currentPlan.saturdays]; sats[i] = v; setCurrentPlan({ ...currentPlan, saturdays: sats }); };
  const toggleGroup = (gi: number) => setExpandedGroups(prev => ({ ...prev, [gi]: !prev[gi] }));

  const printPlan = () => {
    const html = `<html><head><title>Planning ${kind}</title><style>body{font-family:Arial;padding:40px}h1{color:#1e40af;text-align:center}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #222;padding:6px;text-align:center}th{background:#eaf1fa}</style></head><body><h1>IPHES - Planning ${kind === 'Garde' ? 'des gardes' : 'des permanences'} (samedis)</h1><p>Niveau: ${meta.label}</p><p>Période: ${currentPlan.saturdays[0]} → ${currentPlan.saturdays[9]}</p><table><thead><tr><th>Groupe</th><th>Élève</th>${currentPlan.saturdays.map((s: string, i: number) => `<th>S${i + 1}<br>${fmtFR(s)}</th>`).join('')}</tr></thead><tbody>${currentPlan.groups.map((g: any, gi: number) => g.studentIds.map((sid: string, ni: number) => { const s = students.find(x => x.id === sid); return `<tr><td>${ni === 0 ? 'G' + (gi + 1) : ''}</td><td>${s?.name || '—'}</td>${g.columns.map((c: any) => `<td>${c.code}${c.detail ? '<br><small>' + c.detail + '</small>' : ''}</td>`).join('')}</tr>`; }).join('')).join('')}</tbody></table></body></html>`;
    const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const levelOptions = [['ASB2', 'ASB 2e année (ASB2A + ASB2B)'], ['ASB3', 'ASB 3e année (ASB3A + ASB3B)'], ['LSI2', 'LSI 2'], ['LSO2', 'LSO 2'], ['LSI3', 'LSI 3'], ['LSO3', 'LSO 3'], ...CLASSES.map(c => [c, 'Classe ' + c])];
  const seen = new Set(); const uniqueLevels = levelOptions.filter(([k]) => { if (seen.has(k)) return false; seen.add(k); return true; });

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Planning gardes & permanences</h2>
          <p className="text-slate-400 text-sm">Planning des samedis par groupe de 4 élèves</p>
        </div>
        <div className="flex gap-3">
          <button onClick={printPlan} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><Printer size={16} /> Imprimer</button>
          <button onClick={savePlan} className="btn-gold rounded-xl px-5 py-2.5 flex items-center gap-2 text-sm"><Save size={18} /> Enregistrer</button>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Type</label><select value={kind} onChange={e => { setKind(e.target.value as any); setPlan(null); }} className="w-full input-glass rounded-xl px-4 py-3"><option value="Permanence">Permanences</option><option value="Garde">Gardes</option></select></div>
        <div><label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Niveau / classe</label><select value={levelKey} onChange={e => { setLevelKey(e.target.value); setPlan(null); }} className="w-full input-glass rounded-xl px-4 py-3">{uniqueLevels.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Premier samedi</label><input type="date" value={currentPlan.firstSaturday} onChange={e => updateFirstSat(e.target.value)} className="w-full input-glass rounded-xl px-4 py-3" /></div>
      </div>

      <div className="glass-panel rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <button onClick={rebuildGroups} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><RotateCcw size={16} /> Reconstruire groupes</button>
        <button onClick={addGroup} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"><Plus size={16} /> Ajouter groupe</button>
        <div className="flex gap-2 flex-wrap">
          {currentPlan.services.map((svc: any, i: number) => (
            <div key={i} className="flex items-center gap-2"><span className="text-xs text-slate-400">S{i + 1}</span><input value={svc.code} onChange={e => updateSvc(i, e.target.value)} className="w-24 input-glass rounded-lg px-2 py-1 text-sm" /></div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {currentPlan.groups.map((group: any, gi: number) => (
          <motion.div key={gi} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }} className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => toggleGroup(gi)}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><span className="text-amber-400 font-bold text-sm">G{gi + 1}</span></div>
                <span className="text-white font-medium">Groupe {gi + 1}</span>
                <span className="text-slate-400 text-sm">({group.studentIds.filter((id: string) => id).length} élèves)</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); removeGroup(gi); }} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 size={16} /></button>
                {expandedGroups[gi] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </div>
            </div>
            {expandedGroups[gi] !== false && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left"><th className="p-2 text-slate-400 text-xs uppercase">Élève</th>{currentPlan.saturdays.map((s: string, i: number) => (<th key={i} className="p-2 text-slate-400 text-xs uppercase text-center min-w-[120px]"><div>{fmtFR(s)}</div><input type="date" value={s} onChange={e => updateSat(i, e.target.value)} className="w-full mt-1 input-glass rounded px-1 py-0.5 text-[10px]" /></th>))}</tr></thead>
                  <tbody>
                    {group.studentIds.map((sid: string, ni: number) => (
                      <tr key={ni} className="border-t border-white/5">
                        <td className="p-2">
                          <select value={sid} onChange={e => updateGroupStudent(gi, ni, e.target.value)} className="w-full input-glass rounded-lg px-2 py-1.5 text-sm">
                            <option value="">— Poste vacant —</option>
                            {students.filter(s => s.active !== false && meta.classes.includes(s.class)).sort((a, b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                          </select>
                        </td>
                        {group.columns.map((col: any, ci: number) => (
                          <td key={ci} className="p-2">
                            <div className="space-y-1">
                              <input value={col.code} onChange={e => updateGroupCol(gi, ci, e.target.value)} className="w-full input-glass rounded-lg px-2 py-1 text-xs text-center" />
                              <input value={col.detail} onChange={e => updateGroupDetail(gi, ci, e.target.value)} className="w-full input-glass rounded-lg px-2 py-1 text-[10px] text-center" placeholder="Détail" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {currentPlan.groups.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Moon className="mx-auto mb-4 text-slate-600" size={48} />
          <p className="text-slate-500">Aucun groupe. Cliquez sur "Ajouter groupe" ou "Reconstruire groupes" pour générer les groupes automatiquement.</p>
        </div>
      )}
    </div>
  );
}
