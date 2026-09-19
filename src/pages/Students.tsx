import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Trash2, Edit3, Archive, ArrowUpDown, Users, RotateCcw } from 'lucide-react';
import { useApp, generateId, CLASSES, TARIFFS } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Students() {
  const { students, alumni, addStudent, updateStudent, archiveStudent, restoreStudent, deleteStudent, allowedClasses, currentRole } = useApp();
  const [search, setSearch] = useState(''); const [classFilter, setClassFilter] = useState(''); const [statusFilter, setStatusFilter] = useState('active'); const [isModal, setIsModal] = useState(false); const [isPromo, setIsPromo] = useState(false); const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ matricule: '', name: '', class: '', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '', promotion: '', date: '', annualTuition: '', scholarshipStatus: 'Non boursier', scholarshipAmount: '', studentStatus: '' });

  const avail = currentRole === 'responsible' ? allowedClasses : CLASSES;
  const filtered = useMemo(() => {
    let r = statusFilter === 'all' ? [...students, ...alumni] : statusFilter === 'archived' ? alumni : students;
    if (search) { const q = search.toLowerCase(); r = r.filter(s => s.name.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q)); }
    if (classFilter) r = r.filter(s => s.class === classFilter);
    if (currentRole === 'responsible') r = r.filter(s => allowedClasses.includes(s.class));
    return r;
  }, [students, alumni, search, classFilter, statusFilter, currentRole, allowedClasses]);

  const handleSubmit = () => {
    if (!form.name || !form.class || (editing ? false : !form.matricule)) return;
    const isBoursier = form.scholarshipStatus !== 'Non boursier';
    const tuition = isBoursier && form.scholarshipAmount ? Number(form.scholarshipAmount) : Number(form.annualTuition) || 0;
    if (editing) updateStudent({ ...editing, ...form, annualTuition: tuition });
    else addStudent({ id: generateId(), matricule: form.matricule || generateId().slice(0,8), name: form.name, class: form.class, phone: form.phone, guardian: form.guardian, guardianPhone: form.guardianPhone, origin: form.origin, birthDate: form.birthDate, birthPlace: form.birthPlace, academicYear: form.academicYear || '2024-2025', promotion: form.promotion || '', date: form.date || new Date().toISOString().split('T')[0], annualTuition: tuition, scholarshipStatus: form.scholarshipStatus, active: true, studentStatus: form.studentStatus });
    setIsModal(false); setEditing(null); setForm({ matricule:'',name:'',class:'',phone:'',guardian:'',guardianPhone:'',origin:'',birthDate:'',birthPlace:'',academicYear:'',promotion:'',date:'',annualTuition:'',scholarshipStatus:'Non boursier',scholarshipAmount:'',studentStatus:'' });
  };

  const openEdit = (s: any) => { setEditing(s); setForm({ ...s, annualTuition: s.annualTuition?.toString() || '', scholarshipAmount: s.annualTuition?.toString() || '', date: s.date || '' }); setIsModal(true); };
  const handlePromotion = (from: string, to: string) => {
    const list = students.filter(s => s.active !== false && s.class === from);
    list.forEach(s => { updateStudent({ ...s, class: to, classHistory: [...(s.classHistory || []), { from, to, year: '2025-2026', date: new Date().toISOString().split('T')[0] }] }); });
    alert(`${list.length} élève(s) promu(s) de ${from} vers ${to}`); setIsPromo(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold text-[#123b68] mb-0.5">Élèves</h2><p className="text-sm text-gray-500">{filtered.length} enregistrement(s)</p></div>
        <div className="flex items-center gap-2">
          {currentRole === 'director' && (<><button onClick={() => setIsPromo(true)} className="btn-primary rounded-lg px-3.5 py-2 text-xs flex items-center gap-1.5"><ArrowUpDown size={14} /> Passage classe</button><button onClick={() => { setEditing(null); setForm({ matricule:'',name:'',class:'',phone:'',guardian:'',guardianPhone:'',origin:'',birthDate:'',birthPlace:'',academicYear:'',promotion:'',date:new Date().toISOString().split('T')[0],annualTuition:'',scholarshipStatus:'Non boursier',scholarshipAmount:'',studentStatus:'' }); setIsModal(true); }} className="btn-gold rounded-lg px-4 py-2 flex items-center gap-1.5 text-xs"><Plus size={16} /> Inscrire</button></>)}
        </div>
      </div>
      <div className="glass-panel rounded-lg p-3 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher nom ou matricule..." className="w-full input-glass rounded-lg pl-9 pr-3 py-2 text-sm" /></div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="input-glass rounded-lg px-3 py-2 text-sm"><option value="">Toutes les classes</option>{avail.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-glass rounded-lg px-3 py-2 text-sm"><option value="active">Actifs</option><option value="archived">Archivés</option><option value="all">Tous</option></select>
      </div>
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-glass">
            <thead><tr><th>Matricule</th><th>Nom</th><th>Classe</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.02 }}>
                  <td className="font-mono text-[#123b68] font-semibold text-xs">{s.matricule}</td>
                  <td className="font-medium text-gray-800">{s.name}</td>
                  <td><span className="badge-blue">{s.class}</span></td>
                  <td className="text-gray-500">{s.phone || '—'}</td>
                  <td>{s.active !== false ? <span className="badge-green">Actif</span> : <span className="badge-red">Archivé</span>}<br/><span className="text-[10px] text-gray-400">{s.scholarshipStatus}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {currentRole === 'director' && (<><button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"><Edit3 size={15} /></button>
                      {s.active !== false ? <button onClick={() => archiveStudent(s.id)} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition-colors"><Archive size={15} /></button> : <button onClick={() => restoreStudent(s.id)} className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors"><RotateCcw size={15} /></button>}
                      <button onClick={() => deleteStudent(s.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"><Trash2 size={15} /></button></>)}
                      {currentRole !== 'director' && <span className="text-xs text-gray-400">Consultation</span>}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center"><Users className="mx-auto mb-3 text-gray-300" size={40} /><p className="text-gray-400 text-sm">Aucun élève trouvé</p></div>}
      </div>
      <Modal isOpen={isModal} onClose={() => setIsModal(false)} title={editing ? 'Modifier un élève' : 'Inscrire un élève'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Matricule</label><input value={form.matricule} onChange={e => setForm({...form,matricule:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="IPHES-XXXX" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Nom *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Nom complet" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Classe *</label><select value={form.class} onChange={e => {
            const newClass = e.target.value;
            const tariff = TARIFFS[newClass];
            const standardTuition = tariff ? tariff[0] + tariff[1] + tariff[2] : 0;
            setForm({
              ...form,
              class: newClass,
              annualTuition: form.scholarshipStatus === 'Non boursier' ? (standardTuition ? standardTuition.toString() : '') : form.annualTuition
            });
          }} className="w-full input-glass rounded-lg px-3 py-2 text-sm"><option value="">Choisir...</option>{avail.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Téléphone</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="+227..." /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Parent / Tuteur</label><input value={form.guardian} onChange={e => setForm({...form,guardian:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Nom" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Tel parent</label><input value={form.guardianPhone} onChange={e => setForm({...form,guardianPhone:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="+227..." /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Date naissance</label><input type="date" value={form.birthDate} onChange={e => setForm({...form,birthDate:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Lieu naissance</label><input value={form.birthPlace} onChange={e => setForm({...form,birthPlace:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Ville" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Année académique</label><input value={form.academicYear} onChange={e => setForm({...form,academicYear:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="2024-2025" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Promotion</label><input value={form.promotion} onChange={e => setForm({...form,promotion:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="2025-2028" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Date inscription</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" /></div>
          {form.scholarshipStatus === 'Non boursier' && (
            <div><label className="block text-xs text-gray-500 mb-1">Scolarité annuelle (F)</label><input type="number" value={form.annualTuition} onChange={e => setForm({...form,annualTuition:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Tarif standard" /></div>
          )}
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Statut bourse</label>
            <select value={form.scholarshipStatus} onChange={e => {
              const status = e.target.value;
              const isBoursier = status !== 'Non boursier';
              const tariff = TARIFFS[form.class];
              const standardTuition = tariff ? tariff[0] + tariff[1] + tariff[2] : 0;
              setForm({
                ...form,
                scholarshipStatus: status,
                annualTuition: isBoursier ? '' : (standardTuition ? standardTuition.toString() : form.annualTuition),
                scholarshipAmount: isBoursier ? (form.scholarshipAmount || '') : ''
              });
            }} className="w-full input-glass rounded-lg px-3 py-2 text-sm">
              <option>Non boursier</option><option>Boursier de l'État</option><option>Boursier IPHES</option><option>Bourse partielle</option>
            </select>
          </div>
          {form.scholarshipStatus !== 'Non boursier' && (
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Montant à payer (F)</label>
              <input type="number" value={form.scholarshipAmount} onChange={e => setForm({...form,scholarshipAmount:e.target.value})} className="w-full input-glass rounded-lg px-3 py-2 text-sm" placeholder="Montant personnalisé pour le boursier..." />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5"><button onClick={() => setIsModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm transition-colors">Annuler</button><button onClick={handleSubmit} className="btn-gold rounded-lg px-5 py-2 text-sm">{editing ? 'Enregistrer' : 'Inscrire'}</button></div>
      </Modal>
      <Modal isOpen={isPromo} onClose={() => setIsPromo(false)} title="Passage de classe">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-gray-500 mb-1">Classe actuelle</label><select id="promoFrom" className="w-full input-glass rounded-lg px-3 py-2 text-sm">{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-gray-500 mb-1">Nouvelle classe</label><select id="promoTo" className="w-full input-glass rounded-lg px-3 py-2 text-sm">{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div className="flex justify-end gap-2 mt-5"><button onClick={() => setIsPromo(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm transition-colors">Annuler</button><button onClick={() => handlePromotion((document.getElementById('promoFrom') as HTMLSelectElement)?.value, (document.getElementById('promoTo') as HTMLSelectElement)?.value)} className="btn-gold rounded-lg px-5 py-2 text-sm">Valider le passage</button></div>
      </Modal>
    </div>
  );
}
