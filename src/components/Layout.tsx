import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard, BookOpen, Calculator, Wallet,
  FileText, Receipt, Bell, Calendar, ClipboardList, CheckSquare, Stethoscope, Eye,
  Tag, LogOut, ChevronLeft, ChevronRight, Menu, X, Archive, Moon, Database, Cloud, Table2
} from 'lucide-react';
import { useApp, type Role } from '../context/AppContext';
import DataIndexPanel from './DataIndexPanel';

interface NavItem { key: string; label: string; icon: React.ElementType; roles: Role[]; }

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['director'] },
  { key: 'students', label: 'Élèves', icon: Users, roles: ['director','coordinator','de','responsible'] },
  { key: 'alumni', label: 'Anciens élèves', icon: Archive, roles: ['director','coordinator','de'] },
  { key: 'payments', label: 'Paiements', icon: CreditCard, roles: ['director'] },
  { key: 'accounting', label: 'Comptabilité', icon: Calculator, roles: ['director'] },
  { key: 'payroll', label: 'Salaires', icon: Wallet, roles: ['director'] },
  { key: 'bulletins', label: 'Bulletins', icon: FileText, roles: ['director','coordinator','de'] },
  { key: 'subjects', label: 'Matières', icon: BookOpen, roles: ['director','coordinator','de'] },
  { key: 'receipts', label: 'Archives reçus', icon: Receipt, roles: ['director'] },
  { key: 'reminders', label: 'Relances', icon: Bell, roles: ['director'] },
  { key: 'deadlines', label: 'Échéances', icon: Calendar, roles: ['director'] },
  { key: 'commitments', label: 'Engagements', icon: ClipboardList, roles: ['director'] },
  { key: 'attendance', label: 'Présences', icon: CheckSquare, roles: ['director','coordinator','de','responsible'] },
  { key: 'stages', label: 'Stages', icon: Stethoscope, roles: ['director','coordinator','de'] },
  { key: 'saturday-plans', label: 'Gardes & Perm.', icon: Moon, roles: ['director','coordinator','de'] },
  { key: 'supervision', label: 'Supervision', icon: Eye, roles: ['director','coordinator','de'] },
  { key: 'tariffs', label: 'Tarifs', icon: Tag, roles: ['director'] },
  { key: 'import-export', label: 'Import/Export', icon: Database, roles: ['director'] },
  { key: 'cloud-sync', label: 'Cloud Sync', icon: Cloud, roles: ['director'] },
  { key: 'data-index', label: 'Index des données', icon: Table2, roles: ['director'] },
];

interface LayoutProps { activePage: string; setActivePage: (p: string) => void; children: React.ReactNode; }

export default function Layout({ activePage, setActivePage, children }: LayoutProps) {
  const { currentRole, setCurrentRole, currentClass } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [today, setToday] = useState('');
  useEffect(() => { const d = new Date(); setToday(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })); }, []);
  const filtered = navItems.filter(i => i.roles.includes(currentRole));
  const handleLogout = () => { setCurrentRole(''); sessionStorage.clear(); window.location.reload(); };

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
        style={{ background: '#123b68', borderRight: '1px solid rgba(255,255,255,0.06)', boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}
      >
        <div className={`p-5 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img src="/logo-3d.png" alt="IPHES" className="w-10 h-10 object-contain drop-shadow-lg" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white leading-tight tracking-tight">IPHES</h1>
              <p className="text-[10px] text-white/50 tracking-wider uppercase">Gestion</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.map(item => (
            <button
              key={item.key}
              onClick={() => { setActivePage(item.key); setMobileOpen(false); }}
              className={`nav-item w-full ${activePage === item.key ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <item.icon size={18} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} className={`nav-item w-full text-white/50 hover:text-white hover:bg-white/5 ${collapsed ? 'justify-center px-2' : ''} hidden lg:flex`}>
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="text-sm">Réduire</span></>}
          </button>
          <button onClick={handleLogout} className={`nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}>
            <LogOut size={18} />
            {!collapsed && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 bg-white border-b border-[#e8ecf0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Menu size={20} />
            </button>
            <p className="hidden sm:block text-xs text-gray-400 uppercase tracking-wider font-medium">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-sm text-gray-500">
                {currentRole === 'director' ? 'Direction' : currentRole === 'coordinator' ? 'Coordinateur' : currentRole === 'de' ? 'Directeur des Études' : `Responsable ${currentClass}`}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#123b68] flex items-center justify-center text-white font-bold text-sm">
              {currentRole === 'director' ? 'D' : currentRole === 'coordinator' ? 'C' : currentRole === 'de' ? 'E' : 'R'}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 relative">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
            >
              {children}
            </motion.div>
          </main>

          {/* Right Data Index Panel */}
          <div className="hidden lg:flex shrink-0">
            <DataIndexPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
