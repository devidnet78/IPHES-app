import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ALL_HISTORICAL_STUDENTS, ALL_HISTORICAL_PAYMENTS, HISTORICAL_CENTERS,
  HISTORICAL_SUBJECTS, HISTORICAL_EMPLOYEES, HISTORICAL_SUPERVISIONS
} from '../data/allData';

export type Role = 'director' | 'coordinator' | 'de' | 'responsible' | '';

export interface Student {
  id: string; matricule: string; name: string; class: string; phone: string;
  guardian: string; guardianPhone: string; origin: string; birthDate: string;
  birthPlace: string; academicYear: string; promotion: string; date: string;
  annualTuition: number; scholarshipStatus: string; active: boolean; remoteId?: string;
  classHistory?: any[]; studentStatus?: string; archivedAt?: string;
  frozenDues?: Record<string, number> | number; frozenPaids?: Record<string, number> | number; frozenRests?: Record<string, number> | number;
}
export interface Payment {
  id: string; studentId: string; receipt: string; date: string; reason: string;
  reason2?: string; amount: number; amount1?: number; amount2?: number; mode: string;
  year: string; observation: string;
}
export interface Expense { id: string; date: string; category: string; label: string; beneficiary: string; amount: number; mode: string; }
export interface Employee { id: string; name: string; function: string; phone: string; monthlySalary: number; active: boolean; }
export interface SalaryPayment { id: string; employeeId: string; date: string; amount: number; month: string; }
export interface SalaryAdvance { id: string; employeeId: string; date: string; amount: number; observation: string; }
export interface Subject { id: string; className: string; unit: string; name: string; credits: number; term: string; }
export interface Grade { id: string; studentId: string; subjectId: string; term: string; note1: number; note2: number; note3: number; session: number; resession: number; resession2: number; }
export interface AttendanceRecord { id: string; studentId: string; className: string; date: string; status: string; }
export interface Stage { id: string; studentId: string; centerId: string; service: string; startDate: string; endDate: string; status: string; }
export interface Center { id: string; name: string; address: string; capacity: number; service: string; }
export interface Supervision { id: string; date: string; supervisor: string; terrain: string; service: string; className: string; absents: string; observation: string; }
export interface Engagement { id: string; studentId: string; deadline: string; amount: number; parent: string; status: string; }
export interface SaturdayPlan { id: string; kind: string; levelKey: string; classLabel: string; firstSaturday: string; saturdays: string[]; services: { code: string; detail: string }[]; groups: { studentIds: string[]; columns: { code: string; detail: string; dates: string[] }[] }[]; }
export interface DeadlineSetting { id: string; className: string; amount: number; date: string; label: string; }
export interface BulletinSetting { issueDate: string; }

export const CLASSES = ['ASB1A','ASB1B','ASB2A','ASB2B','ASB3A','ASB3B','LSI1','LSI2','LSI3','LSO2','LSO3','LBM1','LBM2','LBM3'];
export const TARIFFS: Record<string, number[]> = {
  'ASB1A':[27500,165000,35000], 'ASB1B':[27500,165000,35000], 'ASB2A':[20000,165000,35000], 'ASB2B':[20000,165000,35000],
  'ASB3A':[20000,165000,17500], 'ASB3B':[20000,165000,17500], 'LSI1':[35000,205000,55000], 'LSI2':[25000,205000,30000],
  'LSI3':[25000,205000,30000], 'LSO2':[25000,205000,30000], 'LSO3':[25000,205000,30000], 'LBM1':[27500,165000,55000],
  'LBM2':[20000,165000,30000], 'LBM3':[20000,165000,17500]
};

export function generateId(): string { return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(2); }

interface AppState {
  students: Student[]; alumni: Student[]; payments: Payment[]; expenses: Expense[];
  employees: Employee[]; salaryPayments: SalaryPayment[]; salaryAdvances: SalaryAdvance[];
  subjects: Subject[]; grades: Grade[]; attendance: AttendanceRecord[];
  stages: Stage[]; centers: Center[]; supervisions: Supervision[]; engagements: Engagement[];
  saturdayPlans: SaturdayPlan[]; deadlineSettings: DeadlineSetting[]; bulletinSettings: BulletinSetting;
}
interface AppContextType extends AppState {
  currentRole: Role; currentClass: string; allowedClasses: string[]; setCurrentRole: (r: Role) => void;
  setCurrentClass: (c: string) => void; setAllowedClasses: (c: string[]) => void;
  addStudent: (s: Student) => void; updateStudent: (s: Student) => void; archiveStudent: (id: string) => void; restoreStudent: (id: string) => void; deleteStudent: (id: string) => void;
  addPayment: (p: Payment) => void; deletePayment: (id: string) => void;
  addExpense: (e: Expense) => void; deleteExpense: (id: string) => void;
  addEmployee: (e: Employee) => void; deleteEmployee: (id: string) => void;
  addSalaryPayment: (sp: SalaryPayment) => void; addSalaryAdvance: (sa: SalaryAdvance) => void;
  addSubject: (s: Subject) => void; addGrade: (g: Grade) => void;
  addAttendance: (a: AttendanceRecord) => void; addStage: (s: Stage) => void; deleteStage: (id: string) => void;
  addCenter: (c: Center) => void; deleteCenter: (id: string) => void;
  addSupervision: (s: Supervision) => void; deleteSupervision: (id: string) => void;
  addEngagement: (e: Engagement) => void; deleteEngagement: (id: string) => void;
  addSaturdayPlan: (p: SaturdayPlan) => void; updateSaturdayPlan: (p: SaturdayPlan) => void; deleteSaturdayPlan: (id: string) => void;
  setBulletinSettings: (s: BulletinSetting) => void; setDeadlineSettings: (s: DeadlineSetting[]) => void;
  saveAll: () => void; loadAll: () => void; resetAll: () => void;
}

function loadStorage(key: string, fallback: any) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function saveStorage(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error('Save error', e); } }

function initHistoricalData(): AppState {
  const histStudents = ALL_HISTORICAL_STUDENTS.map((s, i) => ({
    id: s.id || `hist_${i}`, matricule: s.matricule || `IPHES-${String(i + 1).padStart(4, '0')}`,
    name: s.name, class: s.class, phone: s.phone || '', guardian: s.guardian || '',
    guardianPhone: s.guardianPhone || '', origin: s.origin || '', birthDate: s.birthDate || '',
    birthPlace: s.birthPlace || '', academicYear: s.academicYear || '2024-2025',
    promotion: s.promotion || '2025-2028', date: s.date || '2025-01-15',
    annualTuition: s.annualTuition || 0, scholarshipStatus: s.scholarshipStatus || 'Non boursier',
    active: true
  }));
  return {
    students: histStudents, alumni: [], payments: ALL_HISTORICAL_PAYMENTS,
    expenses: [], employees: HISTORICAL_EMPLOYEES, salaryPayments: [], salaryAdvances: [],
    subjects: HISTORICAL_SUBJECTS, grades: [], attendance: [],
    stages: [], centers: HISTORICAL_CENTERS, supervisions: HISTORICAL_SUPERVISIONS,
    engagements: [], saturdayPlans: [], deadlineSettings: [], bulletinSettings: { issueDate: '' }
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>(() => (sessionStorage.getItem('iphRole') || '') as Role);
  const [currentClass, setCurrentClass] = useState(() => sessionStorage.getItem('iphClass') || '');
  const [allowedClasses, setAllowedClasses] = useState<string[]>(() => {
    try { const v = sessionStorage.getItem('iphAllowed'); return v ? JSON.parse(v) : []; } catch { return []; }
  });

  const [students, setStudents] = useState<Student[]>(ALL_HISTORICAL_STUDENTS);
  const [alumni, setAlumni] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>(ALL_HISTORICAL_PAYMENTS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(HISTORICAL_EMPLOYEES);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(HISTORICAL_SUBJECTS);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [centers, setCenters] = useState<Center[]>(HISTORICAL_CENTERS);
  const [supervisions, setSupervisions] = useState<Supervision[]>(HISTORICAL_SUPERVISIONS);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [saturdayPlans, setSaturdayPlans] = useState<SaturdayPlan[]>([]);
  const [deadlineSettings, setDeadlineSettings] = useState<DeadlineSetting[]>([]);
  const [bulletinSettings, setBulletinSettings] = useState<BulletinSetting>({ issueDate: '' });

  const saveAll = useCallback(() => {
    saveStorage('iphStudents', students); saveStorage('iphAlumni', alumni); saveStorage('iphPayments', payments);
    saveStorage('iphExpenses', expenses); saveStorage('iphEmployees', employees); saveStorage('iphSalaryPayments', salaryPayments);
    saveStorage('iphSalaryAdvances', salaryAdvances); saveStorage('iphSubjects', subjects); saveStorage('iphGrades', grades);
    saveStorage('iphAttendance', attendance); saveStorage('iphStages', stages); saveStorage('iphCenters', centers);
    saveStorage('iphSupervisions', supervisions); saveStorage('iphEngagements', engagements); saveStorage('iphSaturdayPlans', saturdayPlans);
    saveStorage('iphDeadlineSettings', deadlineSettings); saveStorage('iphBulletinSettings', bulletinSettings);
  }, [students, alumni, payments, expenses, employees, salaryPayments, salaryAdvances, subjects, grades, attendance, stages, centers, supervisions, engagements, saturdayPlans, deadlineSettings, bulletinSettings]);

  const loadAll = useCallback(() => {
    const s = loadStorage('iphStudents', null);
    if (s && Array.isArray(s) && s.length > 0) setStudents(s);
    else setStudents(ALL_HISTORICAL_STUDENTS);

    const a = loadStorage('iphAlumni', null);
    if (a && Array.isArray(a) && a.length > 0) setAlumni(a);

    const p = loadStorage('iphPayments', null);
    if (p && Array.isArray(p) && p.length > 0) setPayments(p);
    else setPayments(ALL_HISTORICAL_PAYMENTS);

    const e = loadStorage('iphExpenses', null);
    if (e && Array.isArray(e) && e.length > 0) setExpenses(e);

    const emp = loadStorage('iphEmployees', null);
    if (emp && Array.isArray(emp) && emp.length > 0) setEmployees(emp);
    else setEmployees(HISTORICAL_EMPLOYEES);

    const sp = loadStorage('iphSalaryPayments', null);
    if (sp && Array.isArray(sp) && sp.length > 0) setSalaryPayments(sp);

    const sa = loadStorage('iphSalaryAdvances', null);
    if (sa && Array.isArray(sa) && sa.length > 0) setSalaryAdvances(sa);

    const sub = loadStorage('iphSubjects', null);
    if (sub && Array.isArray(sub) && sub.length > 0) setSubjects(sub);
    else setSubjects(HISTORICAL_SUBJECTS);

    const g = loadStorage('iphGrades', null);
    if (g && Array.isArray(g) && g.length > 0) setGrades(g);

    const att = loadStorage('iphAttendance', null);
    if (att && Array.isArray(att) && att.length > 0) setAttendance(att);

    const st = loadStorage('iphStages', null);
    if (st && Array.isArray(st) && st.length > 0) setStages(st);

    const c = loadStorage('iphCenters', null);
    if (c && Array.isArray(c) && c.length > 0) setCenters(c);
    else setCenters(HISTORICAL_CENTERS);

    const sup = loadStorage('iphSupervisions', null);
    if (sup && Array.isArray(sup) && sup.length > 0) setSupervisions(sup);
    else setSupervisions(HISTORICAL_SUPERVISIONS);

    const eng = loadStorage('iphEngagements', null);
    if (eng && Array.isArray(eng) && eng.length > 0) setEngagements(eng);

    const sat = loadStorage('iphSaturdayPlans', null);
    if (sat && Array.isArray(sat) && sat.length > 0) setSaturdayPlans(sat);

    const ds = loadStorage('iphDeadlineSettings', null);
    if (ds && Array.isArray(ds) && ds.length > 0) setDeadlineSettings(ds);

    const bs = loadStorage('iphBulletinSettings', null);
    if (bs && typeof bs === 'object') setBulletinSettings(bs);
  }, []);

  const resetAll = useCallback(() => {
    const keys = ['iphStudents','iphAlumni','iphPayments','iphExpenses','iphEmployees','iphSalaryPayments','iphSalaryAdvances','iphSubjects','iphGrades','iphAttendance','iphStages','iphCenters','iphSupervisions','iphEngagements','iphSaturdayPlans','iphDeadlineSettings','iphBulletinSettings'];
    keys.forEach(k => localStorage.removeItem(k));
    loadAll();
  }, [loadAll]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (students.length > 0 || payments.length > 0) saveAll(); }, [saveAll]);

  useEffect(() => { sessionStorage.setItem('iphRole', currentRole); }, [currentRole]);
  useEffect(() => { sessionStorage.setItem('iphClass', currentClass); }, [currentClass]);
  useEffect(() => { sessionStorage.setItem('iphAllowed', JSON.stringify(allowedClasses)); }, [allowedClasses]);

  const addStudent = useCallback((s: Student) => { setStudents(p => [...p, s]); }, []);
  const updateStudent = useCallback((s: Student) => { setStudents(p => p.map(x => x.id === s.id ? s : x)); }, []);
  const archiveStudent = useCallback((id: string) => {
    const s = students.find(x => x.id === id); if (!s) return;
    const archived: Student = { ...s, active: false, archivedAt: new Date().toISOString().split('T')[0] };
    setStudents(p => p.filter(x => x.id !== id)); setAlumni(p => [...p, archived]);
  }, [students]);
  const restoreStudent = useCallback((id: string) => {
    const s = alumni.find(x => x.id === id); if (!s) return;
    const restored: Student = { ...s, active: true, archivedAt: undefined };
    setAlumni(p => p.filter(x => x.id !== id)); setStudents(p => [...p, restored]);
  }, [alumni]);
  const deleteStudent = useCallback((id: string) => { setStudents(p => p.filter(x => x.id !== id)); }, []);
  const addPayment = useCallback((p: Payment) => { setPayments(x => [...x, p]); }, []);
  const deletePayment = useCallback((id: string) => { setPayments(p => p.filter(x => x.id !== id)); }, []);
  const addExpense = useCallback((e: Expense) => { setExpenses(p => [...p, e]); }, []);
  const deleteExpense = useCallback((id: string) => { setExpenses(p => p.filter(x => x.id !== id)); }, []);
  const addEmployee = useCallback((e: Employee) => { setEmployees(p => [...p, e]); }, []);
  const deleteEmployee = useCallback((id: string) => { setEmployees(p => p.filter(x => x.id !== id)); }, []);
  const addSalaryPayment = useCallback((sp: SalaryPayment) => { setSalaryPayments(p => [...p, sp]); }, []);
  const addSalaryAdvance = useCallback((sa: SalaryAdvance) => { setSalaryAdvances(p => [...p, sa]); }, []);
  const addSubject = useCallback((s: Subject) => { setSubjects(p => [...p, s]); }, []);
  const addGrade = useCallback((g: Grade) => { setGrades(p => [...p, g]); }, []);
  const addAttendance = useCallback((a: AttendanceRecord) => { setAttendance(p => [...p, a]); }, []);
  const addStage = useCallback((s: Stage) => { setStages(p => [...p, s]); }, []);
  const deleteStage = useCallback((id: string) => { setStages(p => p.filter(x => x.id !== id)); }, []);
  const addCenter = useCallback((c: Center) => { setCenters(p => [...p, c]); }, []);
  const deleteCenter = useCallback((id: string) => { setCenters(p => p.filter(x => x.id !== id)); }, []);
  const addSupervision = useCallback((s: Supervision) => { setSupervisions(p => [...p, s]); }, []);
  const deleteSupervision = useCallback((id: string) => { setSupervisions(p => p.filter(x => x.id !== id)); }, []);
  const addEngagement = useCallback((e: Engagement) => { setEngagements(p => [...p, e]); }, []);
  const deleteEngagement = useCallback((id: string) => { setEngagements(p => p.filter(x => x.id !== id)); }, []);
  const addSaturdayPlan = useCallback((p: SaturdayPlan) => { setSaturdayPlans(x => [...x, p]); }, []);
  const updateSaturdayPlan = useCallback((p: SaturdayPlan) => { setSaturdayPlans(x => x.map(s => s.id === p.id ? p : s)); }, []);
  const deleteSaturdayPlan = useCallback((id: string) => { setSaturdayPlans(p => p.filter(x => x.id !== id)); }, []);

  return (
    <AppContext.Provider value={{
      students, alumni, payments, expenses, employees, salaryPayments, salaryAdvances, subjects, grades, attendance, stages, centers, supervisions, engagements, saturdayPlans, deadlineSettings, bulletinSettings,
      currentRole, currentClass, allowedClasses, setCurrentRole, setCurrentClass, setAllowedClasses,
      addStudent, updateStudent, archiveStudent, restoreStudent, deleteStudent, addPayment, deletePayment,
      addExpense, deleteExpense, addEmployee, deleteEmployee, addSalaryPayment, addSalaryAdvance,
      addSubject, addGrade, addAttendance, addStage, deleteStage, addCenter, deleteCenter,
      addSupervision, deleteSupervision, addEngagement, deleteEngagement,
      addSaturdayPlan, updateSaturdayPlan, deleteSaturdayPlan,
      setBulletinSettings, setDeadlineSettings, saveAll, loadAll, resetAll
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
