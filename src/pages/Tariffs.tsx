import { motion } from 'framer-motion'; import { Tag } from 'lucide-react'; import { CLASSES, TARIFFS } from '../context/AppContext';
export default function Tariffs() {
  return (
    <div>
      <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-1">Tarifs enregistrés</h2><p className="text-slate-400 text-sm">Scolarité par classe et composante</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CLASSES.map((cls, i) => { const t = TARIFFS[cls] || [0, 0, 0]; const total = t[0] + t[1] + t[2]; return (
          <motion.div key={cls} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }} className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Tag size={20} className="text-amber-400" /></div><span className="badge-blue">{cls}</span></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Inscription</span><span className="font-semibold text-white">{t[0].toLocaleString('fr-FR')} F</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Scolarité</span><span className="font-semibold text-white">{t[1].toLocaleString('fr-FR')} F</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Stage / Autre</span><span className="font-semibold text-white">{t[2].toLocaleString('fr-FR')} F</span></div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center"><span className="text-sm font-medium text-amber-400">Total</span><span className="font-bold text-xl text-amber-400">{total.toLocaleString('fr-FR')} F</span></div>
            </div>
          </motion.div>
        ); })}
      </div>
    </div>
  );
}
