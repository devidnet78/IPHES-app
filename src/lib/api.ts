import type { Student, Payment, Grade, Subject, Expense, Employee, SalaryPayment, SalaryAdvance, AttendanceRecord, Stage, Center, Supervision, Engagement, SaturdayPlan } from '../context/AppContext';

const API_BASE = 'https://gestion-iphes-central.devidnetg.workers.dev';

export interface DataIndex {
  lastSync: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  stats: {
    studentsPushed: number;
    studentsPulled: number;
    paymentsPushed: number;
    paymentsPulled: number;
    gradesPushed: number;
    gradesPulled: number;
  };
  errors: string[];
}

export interface ServerStudent {
  id: number;
  matricule: string;
  name: string;
  class_name: string;
  phone: string;
  guardian: string;
  guardian_phone: string;
  origin: string;
  birth_date: string;
  birth_place: string;
  academic_year: string;
  promotion: string;
  enrollment_date: string;
  annual_tuition: number;
  scholarship_status: string;
  active: number;
}

export interface ServerPayment {
  id: number;
  receipt_no: string;
  student_id: number;
  payment_date: string;
  reason: string;
  amount: number;
  payment_mode: string;
  year_name: string;
  observation: string;
}

export interface ServerResponse<T> {
  data?: T[];
  error?: string;
  result?: any;
}

let apiToken: string = sessionStorage.getItem('iphApiToken') || '';

export function setApiToken(token: string) {
  apiToken = token;
  sessionStorage.setItem('iphApiToken', token);
}

export function getApiToken() {
  return apiToken;
}

export function clearApiToken() {
  apiToken = '';
  sessionStorage.removeItem('iphApiToken');
}

export async function apiLogin(role: string, password: string, className?: string): Promise<{ token: string; role?: string }> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, password, className: className || '' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Connexion API refusée');
  if (data.token) setApiToken(data.token);
  return data;
}

async function apiCall<T>(method: string, endpoint: string, body?: any): Promise<ServerResponse<T>> {
  if (!apiToken) throw new Error('Non connecté au serveur');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`
  };
  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function getStudentsFromServer(): Promise<ServerStudent[]> {
  const data = await apiCall<ServerStudent>('GET', '/api/students');
  return data.data || [];
}

export async function getPaymentsFromServer(): Promise<ServerPayment[]> {
  const data = await apiCall<ServerPayment>('GET', '/api/payments');
  return data.data || [];
}

export async function pushStudentToServer(student: Student): Promise<boolean> {
  try {
    const existing = await getStudentsFromServer();
    const match = existing.find(s => s.matricule === student.matricule);
    const payload = {
      id: match?.id,
      matricule: student.matricule,
      name: student.name,
      class_name: student.class,
      phone: student.phone || '',
      guardian: student.guardian || '',
      guardian_phone: student.guardianPhone || '',
      origin: student.origin || '',
      birth_date: student.birthDate || '',
      birth_place: student.birthPlace || '',
      academic_year: student.academicYear || '',
      promotion: student.promotion || '',
      enrollment_date: student.date || '',
      annual_tuition: student.annualTuition || 0,
      scholarship_status: student.scholarshipStatus || 'Non boursier',
      active: student.active === false ? 0 : 1,
      _update: true,
      _action: 'update'
    };
    await apiCall('POST', '/api/students', payload);
    return true;
  } catch (e) {
    console.warn('Push student failed:', e);
    return false;
  }
}

export async function pushPaymentToServer(payment: Payment, studentMap: Map<string, number>): Promise<boolean> {
  try {
    const studentId = studentMap.get(payment.studentId);
    if (!studentId) return false;
    const payload = {
      receipt_no: payment.receipt,
      student_id: studentId,
      payment_date: payment.date,
      reason: payment.reason,
      amount: payment.amount,
      payment_mode: payment.mode,
      year_name: payment.year || '',
      observation: payment.observation || ''
    };
    await apiCall('POST', '/api/payments', payload);
    return true;
  } catch (e) {
    console.warn('Push payment failed:', e);
    return false;
  }
}

export function getDataIndex(): DataIndex {
  const stored = localStorage.getItem('iphDataIndex');
  if (stored) return JSON.parse(stored);
  return {
    lastSync: '',
    syncStatus: 'idle',
    stats: { studentsPushed: 0, studentsPulled: 0, paymentsPushed: 0, paymentsPulled: 0, gradesPushed: 0, gradesPulled: 0 },
    errors: []
  };
}

export function saveDataIndex(index: DataIndex) {
  localStorage.setItem('iphDataIndex', JSON.stringify(index));
}

export function resetDataIndex() {
  localStorage.removeItem('iphDataIndex');
}

export function getLocalStorageData(): {
  students: Student[];
  payments: Payment[];
  grades: Grade[];
  subjects: Subject[];
  expenses: Expense[];
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  salaryAdvances: SalaryAdvance[];
  attendance: AttendanceRecord[];
  stages: Stage[];
  centers: Center[];
  supervisions: Supervision[];
  engagements: Engagement[];
  saturdayPlans: SaturdayPlan[];
} {
  const load = (key: string) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; };
  return {
    students: load('iphStudents') || [],
    payments: load('iphPayments') || [],
    grades: load('iphGrades') || [],
    subjects: load('iphSubjects') || [],
    expenses: load('iphExpenses') || [],
    employees: load('iphEmployees') || [],
    salaryPayments: load('iphSalaryPayments') || [],
    salaryAdvances: load('iphSalaryAdvances') || [],
    attendance: load('iphAttendance') || [],
    stages: load('iphStages') || [],
    centers: load('iphCenters') || [],
    supervisions: load('iphSupervisions') || [],
    engagements: load('iphEngagements') || [],
    saturdayPlans: load('iphSaturdayPlans') || []
  };
}
