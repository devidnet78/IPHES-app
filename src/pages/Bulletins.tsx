import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Printer, Settings, GraduationCap, AlertTriangle } from 'lucide-react';
import { useApp, CLASSES, generateId, TARIFFS } from '../context/AppContext';
import Modal from '../components/Modal';

const terms = ['Semestre 1', 'Semestre 2', 'Semestre 3', 'Semestre 4', 'Semestre 5', 'Semestre 6', 'Année', 'Session'];
const unitLabels: Record<string, string> = {
  'SIO 111': 'Soins infirmiers fondamentaux', 'SIO 112': 'Soins infirmiers fondamentaux',
  'SIO 113': 'Soins infirmiers fondamentaux', 'SIO 114': 'Soins infirmiers fondamentaux',
  'SIO 115': 'Soins infirmiers fondamentaux', 'SIO 116': 'Soins infirmiers fondamentaux',
  'SIO 121': 'Soins infirmiers fondamentaux', 'SIO 122': 'Soins infirmiers fondamentaux',
  'SIO 123': 'Soins infirmiers fondamentaux', 'SIO 124': 'Soins infirmiers fondamentaux',
  'SIO 125': 'Soins infirmiers fondamentaux', 'SIO': 'Sciences infirmières et obstétricales'
};

export default function Bulletins() {
  const { students, subjects, grades, addGrade, bulletinSettings, setBulletinSettings } = useApp();
  const [selClass, setSelClass] = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selTerm, setSelTerm] = useState('Année');
  const [selStudent, setSelStudent] = useState('');
  const [gradeMap, setGradeMap] = useState<Record<string, any>>({});
  const [isSettings, setIsSettings] = useState(false);

  const classStudents = useMemo(() => {
    if (!selClass) return [];
    return students.filter(s => s.class === selClass && s.active !== false);
  }, [students, selClass]);

  const classSubjects = useMemo(() => {
    if (!selClass) return [];
    return subjects.filter(s => s.className === selClass);
  }, [subjects, selClass]);

  const isASB = selClass.startsWith('ASB');
  const limit = isASB ? 12 : 10;

  const getGrade = (sid: string, subjId: string) => {
    const k = `${sid}|${subjId}`;
    if (gradeMap[k]) return gradeMap[k];
    const g = grades.find(x => x.studentId === sid && x.subjectId === subjId && x.term === selTerm);
    return g;
  };

  const setGrade = (sid: string, subjId: string, field: string, val: number) => {
    setGradeMap(prev => ({
      ...prev,
      [`${sid}|${subjId}`]: { ...prev[`${sid}|${subjId}`], [field]: val }
    }));
  };

  const saveAll = () => {
    Object.entries(gradeMap).forEach(([k, v]) => {
      const [studentId, subjectId] = k.split('|');
      addGrade({
        id: generateId(),
        studentId,
        subjectId,
        term: selTerm,
        note1: Number(v.note1) || 0,
        note2: Number(v.note2) || 0,
        note3: Number(v.note3) || 0,
        session: Number(v.session) || 0,
        resession: Number(v.resession) || 0,
        resession2: Number(v.resession2) || 0
      });
    });
    alert('Notes enregistrées !');
    setGradeMap({});
  };

  const effectiveNote = (g: any) => {
    if (!g) return null;
    if (g.session) return g.session;
    if (g.note3) return g.note3;
    if (g.note2) return g.note2;
    if (g.note1) return g.note1;
    return null;
  };

  const studentSituation = (s: any) => {
    const ss = subjects.filter(q => q.className === s.class && q.term === selTerm && q.name.toLowerCase() !== 'stage');
    let credits = 0, expected = 0;
    const failed: string[] = [];
    ss.forEach(q => {
      const g = grades.find(x => x.studentId === s.id && x.subjectId === q.id && x.term === selTerm);
      const n = effectiveNote(g);
      expected += q.credits;
      if (n !== null && n >= limit) credits += q.credits;
      else failed.push(q.name);
    });
    const avg = ss.length
      ? (ss.reduce((sum, q) => {
          const g = grades.find(x => x.studentId === s.id && x.subjectId === q.id && x.term === selTerm);
          const n = effectiveNote(g);
          return sum + (n || 0);
        }, 0) / ss.length).toFixed(2)
      : '';
    return { credits, expected, failed, avg, decision: Number(avg) >= limit ? 'Admis' : 'Conditionnel' };
  };

  const printBulletin = (all = false) => {
    if (!selClass) { alert('Choisissez une classe.'); return; }
    const a = students.filter(s => s.active !== false && s.class === selClass && (all || s.id === selStudent));
    if (!all && !selStudent) { alert('Choisissez un élève.'); return; }

    const pages = a.map(s => {
      const ss = subjects.filter(q => q.className === s.class && (isASB || selTerm === 'Année' || selTerm === 'Session' || q.term === selTerm) && q.name.toLowerCase() !== 'stage').sort((a, b) => {
        const order = ['SIO 111', 'SIO 112', 'SIO 113', 'SIO 114', 'SIO 115', 'SIO 116', 'SIO 121', 'SIO 122', 'SIO 123', 'SIO 124', 'SIO 125'];
        return Number(a.name.toLowerCase() === 'stage') - Number(b.name.toLowerCase() === 'stage') ||
          ((order.indexOf(a.unit) < 0 ? 999 : order.indexOf(a.unit)) - (order.indexOf(b.unit) < 0 ? 999 : order.indexOf(b.unit)));
      });
      const x = studentSituation(s);
      const avg = x.avg;

      const rows = isASB ? ss.map((q, i) => {
        const gs = grades.filter(g => g.studentId === s.id && g.subjectId === q.id);
        const g = gs[gs.length - 1];
        const n = effectiveNote(g);
        const decision = s.class.endsWith('1') ? 'PASSE EN 2ÈME ANNÉE' : s.class.endsWith('2') ? 'PASSE EN 3ÈME ANNÉE' : 'REDOUBLE';
        return `<tr><td class="element-cell">${q.name}</td><td class="note-cell">${n ?? ''}</td>${i === 0 ? `<td class="asb-observation" rowspan="${ss.length}">${x.decision === 'Admis' ? decision : 'REDOUBLE'}</td>` : ''}</tr>`;
      }).join('') : (() => {
        const groups: Record<string, any[]> = {};
        ss.forEach(q => { groups[q.unit || 'Unité d\'enseignement'] = groups[q.unit || 'Unité d\'enseignement'] || []; groups[q.unit || 'Unité d\'enseignement'].push(q); });
        const entries = Object.entries(groups);
        const totalRows = ss.length;
        const semesterValid = entries.every(([u, items]) => {
          const ns = items.map(q => {
            const z = grades.filter(g => g.studentId === s.id && g.subjectId === q.id);
            const g = z[z.length - 1];
            const n = effectiveNote(g);
            return n === null ? 0 : Number(n);
          });
          return ns.every(n => n >= limit);
        });
        return entries.map(([unit, items], gi) => {
          const notes = items.map(q => {
            const z = grades.filter(g => g.studentId === s.id && g.subjectId === q.id);
            const g = z[z.length - 1];
            const n = effectiveNote(g);
            return n === null ? 0 : Number(n);
          });
          const ueAvg = (notes.reduce((u, v) => u + v, 0) / notes.length).toFixed(2);
          const valid = Number(ueAvg) >= limit;
          return items.map((q, i) => {
            const z = grades.filter(g => g.studentId === s.id && g.subjectId === q.id);
            const g = z[z.length - 1];
            const n = effectiveNote(g);
            return `<tr>${i === 0 ? `<td class="unit-cell" rowspan="${items.length}">${unitLabels[unit] || unit}<br><small>(${unit})</small></td>` : ''}<td class="element-cell">${q.name}</td><td class="note-cell">${n ?? ''}</td>${i === 0 ? `<td class="ue-average-cell" rowspan="${items.length}">${ueAvg}</td>` : ''}${gi === 0 && i === 0 ? `<td class="semester-cell" rowspan="${totalRows}">${avg}</td>` : ''}${i === 0 ? `<td class="credit-obtained" rowspan="${items.length}">${valid ? q.credits || '' : '0'}</td><td class="credit-expected" rowspan="${items.length}">${q.credits || ''}</td><td class="result-cell" rowspan="${items.length}">${valid ? 'UE validée' : 'UE non validée'}</td>` : ''}${gi === 0 && i === 0 ? `<td class="observation-cell" rowspan="${totalRows}">${semesterValid ? 'SEMESTRE VALIDÉ' : 'SEMESTRE NON VALIDÉ'}</td>` : ''}</tr>`;
          }).join('');
        }).join('');
      })();

      const levelLabel = isASB ? s.class : (s.class.endsWith('1') ? 'L1' : s.class.endsWith('2') ? 'L2' : 'L3');
      const sem = selTerm.replace('Semestre ', 'S');
      const opt = s.class.startsWith('LSO') ? ' (option sage-femme)' : ' (option infirmier)';
      const levelFull = isASB ? s.class : (s.class === 'LSI1' ? 'L1 - ' + sem + ' (Tronc Commun)' : levelLabel + ' - ' + sem + opt);

      return `<div class="student ${isASB ? 'asb' : 'superior'}"><div class="head"><div class="ministry">République du Niger<br>Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique<br>Ministère de la Santé et de l'Hygiène Publique</div><div class="logo">IPHES<br><small>Institut Privé des Hautes Études de la Santé</small></div><div class="contact">INSTITUT PRIVÉ DES HAUTES ÉTUDES DE LA SANTÉ (IPHES)<br>ARRETE N°00122/MES/R/I/SG/DGE/DL/DES/DEPRI<br>Cell : 90554499 / 96765755<br>Niamey – Niger</div></div><h1>RELEVÉ DE NOTES</h1><div class="meta"><b>Filière :</b> ${isASB ? 'Agent de Santé de Base (A.S.B)' : 'Sciences infirmières / sage-femme'}<br><b>Année académique :</b> ${s.academicYear || '................................'} &nbsp;&nbsp; <b>Niveau :</b> ${levelFull}<br><b>Promotion :</b> ${s.promotion || '................................'} &nbsp;&nbsp; <b>Nom et prénom :</b> ${s.name}<br><b>Date et lieu de naissance :</b> ${s.birthDate ? new Date(s.birthDate + 'T00:00:00').toLocaleDateString('fr-FR') : ''} ${s.birthPlace ? ' à ' + s.birthPlace : ''} &nbsp;&nbsp; <b>Matricule :</b> ${s.matricule}</div>${isASB ? `<table><thead><tr><th>Matières</th><th>Note obtenue /20</th><th>Observations</th></tr></thead><tbody>${rows}</tbody></table>` : `<table class="super"><thead><tr><th rowspan="2">UNITÉS D'ENSEIGNEMENT</th><th rowspan="2">ÉLÉMENTS CONSTITUTIFS</th><th rowspan="2" class="vertical">NOTE EC /20</th><th rowspan="2" class="vertical">MOYENNE D'UE /20</th><th rowspan="2" class="vertical">MOYENNE SEMESTRIELLE /20</th><th colspan="2">CRÉDITS</th><th rowspan="2" class="vertical">RÉSULTATS</th><th rowspan="2" class="vertical">OBSERVATIONS</th></tr><tr><th class="vertical">OBTENUS</th><th class="vertical">ATTENDUS</th></tr></thead><tbody>${rows}</tbody></table>`}<div class="totals">${isASB ? `<b>MOYENNE GÉNÉRALE :</b> ${avg} /20` : `<b>TOTAL DE CRÉDITS :</b> ${x.credits} / ${x.expected} &nbsp;&nbsp; <b>MOYENNE SEMESTRIELLE :</b> ${avg} /20`} &nbsp;&nbsp; <b>RESULTAT DE L'ANNÉE :</b> ${isASB ? (x.decision === 'Admis' ? 'Admis en classe supérieure' : x.decision) : (selTerm === 'Semestre 6' ? (Number(avg) >= 10 ? 'ANNEE VALIDEE' : 'ANNEE NON VALIDEE') : (Number(avg) >= 10 ? 'Admis' : 'Redouble'))}</div><p>En foi de quoi le présent relevé est délivré pour servir et valoir ce que de droit.</p><p><b>NB :</b> Ce relevé ne porte lors de la remise ni rature ni surcharge. Il est délivré en une seule copie.</p><div class="sign">Fait à Niamey, le ${bulletinSettings.issueDate ? new Date(bulletinSettings.issueDate + 'T00:00:00').toLocaleDateString('fr-FR') : '................................'}<br><b>LE DIRECTEUR DES ETUDES</b></div></div>`;
    }).join('');

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<html><head><title>Bulletins ${selClass}</title><style>@page{size:A4 portrait;margin:4mm}body{font-family:Arial,serif;color:#111;margin:0}.student{position:relative;page-break-after:always;min-height:287mm;max-height:287mm;overflow:hidden}.head{display:grid;grid-template-columns:minmax(0,1fr) 115px minmax(0,1fr);border:2px solid #111;min-height:58px;align-items:center;font-size:7px;line-height:1.15;overflow:hidden}.head>div{min-width:0;overflow-wrap:anywhere}.ministry,.contact{padding:5px;line-height:1.15;font-size:7px;overflow-wrap:anywhere}.logo{text-align:center;font-size:22px;font-weight:bold;color:#167c93;border-left:1.5px solid #111;border-right:1.5px solid #111;min-height:58px;display:flex;align-items:center;justify-content:center}.logo small{display:block;font-size:8px;color:#111}.contact{border-left:1px solid #111}h1{text-align:center;text-decoration:underline;font-size:18px;margin:6px}.meta{font-size:10px;line-height:1.35;border:2px solid #111;padding:5px}.student table{width:100%;border-collapse:collapse;border:2px solid #111;font-size:7.5px}.student thead th{border:2px solid #111!important}.super thead tr:first-child th[colspan]{border-bottom:2px solid #111!important}.super thead tr:nth-child(2) th{border-top:0!important;border-bottom:2px solid #111!important}.student th,.student td{border:1.5px solid #111;padding:2px;vertical-align:middle}.vertical{writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;height:120px;text-align:center}.student th{font-weight:bold;text-align:center;background:#fafafa}.student td:nth-child(1),.student td:nth-child(2){text-align:left;vertical-align:middle}.student.superior{zoom:.92;padding:5mm 5mm 0;box-sizing:border-box;max-height:none;min-height:0;overflow:visible}.asb{padding-left:10mm;padding-right:10mm;height:287mm;min-height:287mm;max-height:287mm;overflow:hidden;box-sizing:border-box} .asb .sign{position:static!important;display:block!important;clear:both!important;text-align:right!important;margin-top:25mm!important;padding:0 12mm 0 0!important;right:auto!important;bottom:auto!important}.asb .meta{font-size:14px;line-height:1.5}.asb h1{font-size:24px;margin:10px}.asb table{font-size:12px;table-layout:fixed;width:100%}.asb th:first-child,.asb td:first-child{width:60%}.asb th:nth-child(2),.asb td:nth-child(2){width:17%;text-align:center;white-space:nowrap}.asb th:nth-child(3),.asb td:nth-child(3){width:23%}.asb-observation{vertical-align:middle!important;text-align:center!important;font-weight:bold;white-space:normal}.asb th,.asb td{padding:4px}.super{font-size:9px!important}.super th,.super td{padding:4px!important;text-align:center}.super td:nth-child(1){font-size:10px;font-weight:bold;line-height:1.15;text-align:center}.super td:nth-child(2){text-align:left;vertical-align:middle}.element-cell{text-align:left!important;vertical-align:middle!important}.super td[rowspan]{border:1.5px solid #111!important}.super tr{border-bottom:1.5px solid #111}.semester-cell{vertical-align:middle!important;text-align:center!important;font-weight:bold;white-space:normal}.note-cell,.ue-average-cell,.credit-obtained,.credit-expected,.result-cell,.observation-cell{border-left:2px solid #111!important;border-right:1.5px solid #111!important}.observation-cell{vertical-align:middle!important;text-align:center!important;font-weight:bold}.super .note-cell,.super .ue-average-cell,.super .semester-cell,.super .credit-obtained,.super .credit-expected,.super .result-cell,.super .observation-cell{border-left:2px solid #111!important;border-right:2px solid #111!important}.super thead th{border-left:2px solid #111!important;border-right:2px solid #111!important}.totals{border:1px solid #111;padding:8px;text-align:center;font-size:13px}.sign{text-align:right;padding:18px 40px;font-size:13px}.sign b{display:block;margin-top:20px;text-decoration:underline}.print-actions{text-align:center;margin:15px}.print,.back{margin:5px;padding:10px 18px;border:0;border-radius:5px;font-weight:bold}.print{background:#123b68;color:#fff}.back{background:#e7edf5;color:#123b68}@media print{.print-actions{display:none}}</style></head><body>${pages}<div class="print-actions"><button class="print" onclick="window.print();if(window.opener)window.opener.focus()">Imprimer le bulletin</button><button class="back" onclick="if(window.opener)window.opener.focus();window.close()">Retour à l'application</button></div></body></html>`);
      w.document.close();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Bulletins et résultats</h2>
          <p className="text-slate-400 text-sm">Saisie des notes et édition des bulletins</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsSettings(true)} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
            <Settings size={16} /> Date du bulletin
          </button>
          <button
            onClick={() => {
              if (!selStudent) { alert('Choisissez un élève dans le menu ci-dessous.'); return; }
              printBulletin(false);
            }}
            className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Printer size={16} /> Bulletin élève
          </button>
          <button onClick={() => printBulletin(true)} className="btn-gold rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
            <Printer size={16} /> Tous les bulletins
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 flex-wrap">
        {/* Classe */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Classe</label>
          <select
            value={selClass}
            onChange={e => {
              setSelClass(e.target.value);
              setSelSubject('');
              setSelStudent('');
            }}
            className="input-glass rounded-xl px-4 py-2.5 min-w-[200px]"
          >
            <option value="">Choisir une classe...</option>
            {CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Matière */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Matière</label>
          <select
            value={selSubject}
            onChange={e => setSelSubject(e.target.value)}
            className="input-glass rounded-xl px-4 py-2.5 min-w-[280px]"
          >
            <option value="">Choisir une matière...</option>
            {classSubjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.credits} crédit(s)
              </option>
            ))}
          </select>
        </div>

        {/* Terme */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Période</label>
          <select
            value={selTerm}
            onChange={e => setSelTerm(e.target.value)}
            className="input-glass rounded-xl px-4 py-2.5 min-w-[160px]"
          >
            {terms.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Élève */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Élève</label>
          <div className="flex gap-2">
            <select
              value={selStudent}
              onChange={e => setSelStudent(e.target.value)}
              className="input-glass rounded-xl px-4 py-2.5 min-w-[280px]"
            >
              <option value="">
                {selClass ? 'Choisir un élève...' : 'Sélectionnez une classe d\'abord...'}
              </option>
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>
                  {s.matricule} — {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!selClass) { alert('Veuillez d\'abord choisir une classe.'); return; }
                if (!selStudent) { alert('Veuillez d\'abord choisir un élève dans la liste.'); return; }
                printBulletin(false);
              }}
              className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Printer size={16} /> Bulletin élève
            </button>
          </div>
        </div>
      </div>

      {/* Grade Entry Table */}
      {selClass && selSubject && (
        <div className="glass-panel rounded-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Note 1</th>
                  <th>Note 2</th>
                  <th>Note 3</th>
                  <th>Session</th>
                  <th>Re-session</th>
                  <th>Re-session2</th>
                  <th>Seuil</th>
                  <th>Résultat</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const g = getGrade(s.id, selSubject);
                  const n = effectiveNote(g);
                  const passed = n !== null && n >= limit;
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="font-mono text-blue-400">{s.matricule}</td>
                      <td className="font-medium text-white">{s.name}</td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.note1 || ''} onChange={e => setGrade(s.id, selSubject, 'note1', Number(e.target.value))} /></td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.note2 || ''} onChange={e => setGrade(s.id, selSubject, 'note2', Number(e.target.value))} /></td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.note3 || ''} onChange={e => setGrade(s.id, selSubject, 'note3', Number(e.target.value))} /></td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.session || ''} onChange={e => setGrade(s.id, selSubject, 'session', Number(e.target.value))} /></td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.resession || ''} onChange={e => setGrade(s.id, selSubject, 'resession', Number(e.target.value))} /></td>
                      <td><input type="number" min="0" max="20" className="w-20 input-glass rounded px-2 py-1 text-center" value={g?.resession2 || ''} onChange={e => setGrade(s.id, selSubject, 'resession2', Number(e.target.value))} /></td>
                      <td>{isASB ? 12 : 10}</td>
                      <td>{passed ? <span className="badge-green">Validé</span> : <span className="badge-red">Non validé</span>}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4">
            <button onClick={saveAll} className="btn-gold rounded-xl px-6 py-2.5 flex items-center gap-2">
              <Save size={18} /> Enregistrer les notes
            </button>
          </div>
        </div>
      )}

      {/* Situation Table */}
      {selClass && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <h3 className="p-4 text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-400" />
            Situation des élèves
          </h3>
          <div className="overflow-x-auto">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Matières non validées</th>
                  <th>Crédits validés</th>
                  <th>Décision</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, i) => {
                  const x = studentSituation(s);
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="font-medium text-white">{s.name}</td>
                      <td><span className="badge-blue">{s.class}</span></td>
                      <td className="text-sm">{x.failed.join(', ') || '—'}</td>
                      <td>{x.credits}/{x.expected}</td>
                      <td>
                        {x.decision === 'Admis'
                          ? <span className="badge-green">Admis</span>
                          : <span className="badge-amber">Conditionnel</span>
                        }
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Modal isOpen={isSettings} onClose={() => setIsSettings(false)} title="Date d'émission des bulletins">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Date à afficher après « Fait à Niamey, le »</label>
          <input
            type="date"
            defaultValue={bulletinSettings.issueDate || new Date().toISOString().split('T')[0]}
            onChange={e => { setBulletinSettings({ issueDate: e.target.value }); }}
            className="w-full input-glass rounded-xl px-4 py-3"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setIsSettings(false)} className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            Fermer
          </button>
        </div>
      </Modal>
    </div>
  );
}
