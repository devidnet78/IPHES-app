// Toutes les données historiques importées depuis l'application originale Gestion IPHES
// Les élèves de 2ème année ont des matricules créées durant leur 1ère année (import historique)
import type { Student, Payment, Center, Subject, Employee, Supervision } from '../context/AppContext';

// Matricules de 1ère année (nouveaux inscrits) : commencent à 900
let matriculeFirstYear = 900;
function generateFirstYearMatricule(): string {
  const num = matriculeFirstYear++;
  return `IPHES-${String(num).padStart(4, '0')}`;
}

// Matricules de 2ème année (import historique) : numéros variés créés en 1ère année
// On simule des matricules importées avec des numéros dans la plage 1000-8999
let matriculeSecondYear = 1000;
function generateSecondYearMatricule(): string {
  const num = matriculeSecondYear++;
  return `IPHES-${String(num).padStart(4, '0')}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(2);
}

// Données historiques brutes depuis l'app originale — élèves de 2ème année (matricules importées)
const LSI2_RAW = [
  { name: "ABDOU SALAOU NANA HADIZA", paid: 190000, rest: 0, due: 190000 },
  { name: "ABDOU ZAKOU BARAHATOU", paid: 80000, rest: 55000, due: 135000 },
  { name: "ABDOUL AZIZ ADAMOU SOUMAYA", paid: 295000, rest: 0, due: 295000 },
  { name: "ABDOUL BAKI SIDDO AICHATOU", paid: 295000, rest: 0, due: 295000 },
  { name: "ABDOUL WAHIDOU HAMANI OUSSEINA", paid: 295000, rest: 0, due: 295000 },
  { name: "ABDOULAYE HALIDOU FAICAL", paid: 295000, rest: 0, due: 295000 },
  { name: "ABDOULAYE HAMIDOU AMINA", paid: 295000, rest: 0, due: 295000 },
  { name: "ABOUBA AMADOU ABASSA", paid: 295000, rest: 0, due: 295000 },
  { name: "ABOUBACAR HASSANE ZOUMBONI", paid: 0, rest: 90000, due: 90000 },
  { name: "ADAMOU IBRAHIM SAADATOU", paid: 120000, rest: 60000, due: 180000 },
  { name: "ADAMOU SOUMAILA SAFAWANOU", paid: 25000, rest: 235000, due: 260000 },
  { name: "ALHASSANE BANA CHERIFATOU", paid: 210000, rest: 85000, due: 295000 },
  { name: "ALHASSANE HAMADOU NADIA", paid: 35000, rest: 0, due: 35000 },
  { name: "ALI", paid: 0, rest: 0, due: 0 }
];

const ASB2A_RAW = [
  { name: "Aboubacar Ibrahim Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Aboubacar Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Adiza Mohamed Hadi", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahamed Ali Mohamadou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahamed Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Amadou Bana", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Amadou Mansou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Ibrahim Habi", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Ibrahim Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Ahmed Ibrahim Salahatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Moussa Hadizatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Moussa Naimatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Ousmane Rakaya", paid: 227500, rest: 0, due: 227500 },
  { name: "Ahmed Sani Soulay", paid: 227500, rest: 0, due: 227500 },
  { name: "Alassane Ibrahim Hadi", paid: 227500, rest: 0, due: 227500 },
  { name: "Alassane Mohamed Aminatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Alassane Moussa Safaa", paid: 227500, rest: 0, due: 227500 },
  { name: "Ali Amadou Naimatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ali Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ali Ibrahim Moussa", paid: 227500, rest: 0, due: 227500 },
  { name: "Ali Moussa Amadou", paid: 0, rest: 62500, due: 62500 },
  { name: "Ali Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ali Ousmane Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Ali Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Aboubacar Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Amadou Ali Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Ali Moussa", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Ibrahim Moussa", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Moussa Moussa", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Sani Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Amina Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amina Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amina Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Amina Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Assoumane Ibrahim Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Assoumane Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Balkissa Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Balkissa Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Balkissa Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Balkissa Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Biba Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Biba Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Biba Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Biba Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Boukary Ibrahim Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Boukary Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Boukary Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Boukary Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Celestine Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Celestine Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Celestine Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Celestine Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Dodo Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Dodo Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Dodo Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Dodo Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Fatima Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Fatima Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Fatima Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Fatima Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Habibou Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Habibou Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Habibou Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Habibou Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hadiza Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hadiza Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hadiza Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hadiza Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hama Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hama Moussa Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Hama Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hama Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Kader Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Kader Moussa Ibrahim", paid: 0, rest: 62500, due: 62500 },
  { name: "Kader Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Kader Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Lamine Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Lamine Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Lamine Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Lamine Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Mamane Ibrahim Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Mamane Moussa Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Mamane Ousmane Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Mamane Sani Ibrahim", paid: 227500, rest: 0, due: 227500 },
  { name: "Michel Françoise Sadatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Mochi Sani Awal", paid: 0, rest: 62500, due: 62500 },
  { name: "Morou Souley Raiyanatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Moumouni Saley Youssouf", paid: 0, rest: 0, due: 0 },
  { name: "Moussa Gorgno Roukaya", paid: 227500, rest: 0, due: 227500 },
  { name: "Oumarou Abdoulaye Fouréra", paid: 227500, rest: 0, due: 227500 },
  { name: "Seyni Zakari Habibou", paid: 0, rest: 62500, due: 62500 },
  { name: "Soumana Issaka Samira", paid: 227500, rest: 0, due: 227500 },
  { name: "Soumaïla Adamou Halimatou", paid: 50000, rest: 12500, due: 62500 },
  { name: "Soumaïla Issoufou Aminatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Yaou Hamadou Abdoul Razak", paid: 227500, rest: 0, due: 227500 },
  { name: "Yaou Moussa Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Zakari Boubacar Fatimata Zahra", paid: 227500, rest: 0, due: 227500 },
  { name: "Zakari Ousseini Abdoul Kabirou", paid: 227500, rest: 0, due: 227500 }
];

const ASB2B_RAW = [
  { name: "Abdou Ibrahim Missiratou", paid: 193000, rest: 34500, due: 227500 },
  { name: "Abdoul Rahim Boubacar Damarga", paid: 227500, rest: 0, due: 227500 },
  { name: "Abdourahamane Amadou Aïchatou", paid: 50000, rest: 177500, due: 227500 },
  { name: "Aboubacar Hassane Aïchatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Adamou Djibo Kadidja", paid: 203000, rest: 24500, due: 227500 },
  { name: "Alhassane Boubacar Zeïnabou", paid: 227500, rest: 0, due: 227500 },
  { name: "Amadou Amadou Souley", paid: 177500, rest: 50000, due: 227500 },
  { name: "Amadou Kalini Rayhanatou", paid: 150000, rest: 77500, due: 227500 },
  { name: "Amadou Kano Abdoul Moumouni", paid: 70000, rest: 157500, due: 227500 },
  { name: "Assaleh Almah... Rahmat", paid: 77500, rest: 27500, due: 105000 },
  { name: "Balarabé Rabiou Achirou", paid: 0, rest: 62500, due: 62500 },
  { name: "Bassirou Oumarou Saley", paid: 0, rest: 62500, due: 62500 },
  { name: "Boubacar Amadou Hawa", paid: 50000, rest: 77500, due: 127500 },
  { name: "Boubacar Doumbaye", paid: 0, rest: 0, due: 0 },
  { name: "Fadimatou Amadou Mariama", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Abdou Moustapha", paid: 227500, rest: 0, due: 227500 },
  { name: "Hassane Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Abdou Amadou", paid: 227500, rest: 0, due: 227500 },
  { name: "Ibrahim Abdou Amadou", paid: 0, rest: 0, due: 0 },
  { name: "Kadidja Amadou Aïchatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Kadidja Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Kadidja Amadou Souleymane", paid: 227500, rest: 0, due: 227500 },
  { name: "Mariama Abdou Amadou", paid: 227500, rest: 0, due: 227500 },
  { name: "Mariama Abdou Amadou", paid: 0, rest: 0, due: 0 },
  { name: "Mariama Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Mariama Amadou Souleymane", paid: 227500, rest: 0, due: 227500 },
  { name: "Moussa Amadou Abdou", paid: 227500, rest: 0, due: 227500 },
  { name: "Moussa Amadou Amadou", paid: 0, rest: 0, due: 0 },
  { name: "Moussa Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Moussa Amadou Souleymane", paid: 227500, rest: 0, due: 227500 },
  { name: "Nana Abdou Amadou", paid: 227500, rest: 0, due: 227500 },
  { name: "Nana Abdou Amadou", paid: 0, rest: 0, due: 0 },
  { name: "Nana Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Nana Amadou Souleymane", paid: 227500, rest: 0, due: 227500 },
  { name: "Oumarou Abdou Amadou", paid: 227500, rest: 0, due: 227500 },
  { name: "Oumarou Abdou Amadou", paid: 0, rest: 0, due: 0 },
  { name: "Oumarou Amadou Hassane", paid: 227500, rest: 0, due: 227500 },
  { name: "Oumarou Amadou Souleymane", paid: 227500, rest: 0, due: 227500 },
  { name: "Oumarou Garba Nana Aïchatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Rafiou Chékaraou Rafiatou", paid: 100000, rest: 127500, due: 227500 },
  { name: "Saadou Abdour Mariama", paid: 227500, rest: 0, due: 227500 },
  { name: "Saadou Tahirou Nana Firdaoussi", paid: 227500, rest: 0, due: 227500 },
  { name: "Salami Akandé Sakira", paid: 167500, rest: 60000, due: 227500 },
  { name: "Saley Halid Nana Aïchatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Salhatou Mohamed Illiassou", paid: 90000, rest: 137500, due: 227500 },
  { name: "Seyni Issa Oumoukaïrou", paid: 160000, rest: 67500, due: 227500 },
  { name: "Seïdou Aboubacar Safiatou", paid: 72500, rest: 147500, due: 220000 },
  { name: "Soumana Insa Salamatou", paid: 227500, rest: 0, due: 227500 },
  { name: "Tahirou Moussa Chamsiya", paid: 185000, rest: 42500, due: 227500 },
  { name: "Zakari Ya'ou Oumarou Samira", paid: 177500, rest: 50000, due: 227500 }
];

// Generate students with proper matricules:
// - 1ère année (new): start at 900
// - 2ème année (historical): start at 1000 (imported from previous year)
// 1ère année students (new, matricules starting at 900)
const FIRST_YEAR_STUDENTS: Student[] = [
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'ABDOU Ibrahim', class: 'ASB1A', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'ALHASSANE Bana', class: 'ASB1A', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'AMADOU Kader', class: 'ASB1A', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'BALARABE Rabiou', class: 'ASB1A', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'BOUBACAR Hassane', class: 'ASB1A', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'FATIMA Zara', class: 'ASB1B', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'HASSAN Moussa', class: 'ASB1B', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'ISSA Oumarou', class: 'ASB1B', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'KADIDJA Ousseini', class: 'ASB1B', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 227500, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'MOUMOUNI Ali', class: 'LSI1', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 295000, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'NANA Hadiza', class: 'LSI1', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 295000, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'OUMAROU Farida', class: 'LSI1', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 295000, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'SALEY Aichatou', class: 'LSI1', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 295000, scholarshipStatus: 'Non boursier', active: true },
  { id: generateId(), matricule: generateFirstYearMatricule(), name: 'YAHAYA Ousmane', class: 'LSI1', phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '', academicYear: '2024-2025', promotion: '2027-2030', date: '2025-01-15', annualTuition: 295000, scholarshipStatus: 'Non boursier', active: true },
];

export const ALL_HISTORICAL_STUDENTS: Student[] = [
  ...FIRST_YEAR_STUDENTS,
  ...LSI2_RAW.map((s, i) => ({
    id: generateId(),
    matricule: generateSecondYearMatricule(), // 2ème année: matricules imported from 1ère année
    name: s.name, class: 'LSI2' as const,
    phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '',
    academicYear: '2024-2025', promotion: '2025-2028', date: '2025-01-15',
    annualTuition: s.due, scholarshipStatus: 'Non boursier', active: true,
    frozenDues: { '1ère année': s.due, '2ème année': s.due },
    frozenPaids: { '1ère année': s.paid, '2ème année': s.paid },
    frozenRests: { '1ère année': s.rest, '2ème année': s.rest },
  })),
  ...ASB2A_RAW.map((s, i) => ({
    id: generateId(),
    matricule: generateSecondYearMatricule(), // 2ème année: matricules imported from 1ère année
    name: s.name, class: 'ASB2A' as const,
    phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '',
    academicYear: '2024-2025', promotion: '2025-2028', date: '2025-01-15',
    annualTuition: s.due, scholarshipStatus: 'Non boursier', active: true,
    frozenDues: { '1ère année': s.due, '2ème année': s.due },
    frozenPaids: { '1ère année': s.paid, '2ème année': s.paid },
    frozenRests: { '1ère année': s.rest, '2ème année': s.rest },
  })),
  ...ASB2B_RAW.map((s, i) => ({
    id: generateId(),
    matricule: generateSecondYearMatricule(), // 2ème année: matricules imported from 1ère année
    name: s.name, class: 'ASB2B' as const,
    phone: '', guardian: '', guardianPhone: '', origin: '', birthDate: '', birthPlace: '',
    academicYear: '2024-2025', promotion: '2025-2028', date: '2025-01-15',
    annualTuition: s.due, scholarshipStatus: 'Non boursier', active: true,
    frozenDues: { '1ère année': s.due, '2ème année': s.due },
    frozenPaids: { '1ère année': s.paid, '2ème année': s.paid },
    frozenRests: { '1ère année': s.rest, '2ème année': s.rest },
  }))
];

export const ALL_HISTORICAL_PAYMENTS: Payment[] = (() => {
  const payments: Payment[] = [];
  let receiptNum = 1;
  ALL_HISTORICAL_STUDENTS.forEach(s => {
    const raw = [...LSI2_RAW, ...ASB2A_RAW, ...ASB2B_RAW].find(r => r.name === s.name);
    if (raw && raw.paid > 0) {
      payments.push({
        id: generateId(), studentId: s.id, receipt: `R${String(receiptNum++).padStart(5, '0')}`,
        date: '2025-01-15', reason: 'Scolarité', reason2: '', amount: raw.paid, amount1: raw.paid, amount2: 0,
        mode: 'Espèces', year: '1ère année', observation: 'Import historique'
      });
    }
  });
  return payments;
})();

export const HISTORICAL_CENTERS: Center[] = [
  { id: generateId(), name: 'C.H.R. (Centre Hospitalier Régional)', address: 'Niamey', capacity: 50, service: 'Urgences' },
  { id: generateId(), name: 'C.S.I. (Centre de Santé Intégré)', address: 'Bobiel Barkalleyzé', capacity: 30, service: 'Soins généraux' },
  { id: generateId(), name: 'H.H.N.', address: 'Niamey', capacity: 40, service: 'Médecine' },
  { id: generateId(), name: 'H.N.A.B.D.', address: 'Niamey', capacity: 35, service: 'Chirurgie' },
  { id: generateId(), name: 'Maternité', address: 'Dar Salam', capacity: 25, service: 'Maternité' },
  { id: generateId(), name: 'C.S.I. Boukoki', address: 'Boukoki', capacity: 20, service: 'Soins généraux' },
  { id: generateId(), name: 'Maternité Koira Kano', address: 'Koira Kano', capacity: 25, service: 'Maternité' },
];

const ASB_SUBJECTS = ['Anatomie', 'Physiologie', 'Pharmacologie', 'Soins infirmiers', 'Pédiatrie'];
const LSI_SUBJECTS = ['Anatomie', 'Physiologie', 'Pharmacologie', 'Soins infirmiers', 'Pédiatrie'];
const LSO_SUBJECTS = ['Obstétrique', 'Gynécologie', 'Pédiatrie', 'Soins infirmiers', 'Anatomie'];
const LBM_SUBJECTS = ['Biologie', 'Chimie', 'Physique', 'Anatomie', 'Physiologie'];

function makeSubjects(classNames: string[], names: string[], credits: number[], term: string): Subject[] {
  const subjects: Subject[] = [];
  classNames.forEach(cn => {
    names.forEach((n, i) => {
      subjects.push({ id: generateId(), className: cn, unit: 'SIO', name: n, credits: credits[i] || 3, term });
    });
  });
  return subjects;
}

export const HISTORICAL_SUBJECTS: Subject[] = [
  // ASB 1ère année
  ...makeSubjects(['ASB1A', 'ASB1B'], ASB_SUBJECTS, [4, 3, 3, 5, 3], 'Année'),
  // ASB 2ème année
  ...makeSubjects(['ASB2A', 'ASB2B'], ASB_SUBJECTS, [4, 3, 3, 5, 3], 'Année'),
  // ASB 3ème année
  ...makeSubjects(['ASB3A', 'ASB3B'], ASB_SUBJECTS, [4, 3, 3, 5, 3], 'Année'),
  // LSI 1ère année
  ...makeSubjects(['LSI1'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 1'),
  ...makeSubjects(['LSI1'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 2'),
  // LSI 2ème année
  ...makeSubjects(['LSI2'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 1'),
  ...makeSubjects(['LSI2'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 2'),
  // LSI 3ème année
  ...makeSubjects(['LSI3'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 5'),
  ...makeSubjects(['LSI3'], LSI_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 6'),
  // LSO 2ème année
  ...makeSubjects(['LSO2'], LSO_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 3'),
  ...makeSubjects(['LSO2'], LSO_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 4'),
  // LSO 3ème année
  ...makeSubjects(['LSO3'], LSO_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 5'),
  ...makeSubjects(['LSO3'], LSO_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 6'),
  // LBM 1ère année
  ...makeSubjects(['LBM1'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 1'),
  ...makeSubjects(['LBM1'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 2'),
  // LBM 2ème année
  ...makeSubjects(['LBM2'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 3'),
  ...makeSubjects(['LBM2'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 4'),
  // LBM 3ème année
  ...makeSubjects(['LBM3'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 5'),
  ...makeSubjects(['LBM3'], LBM_SUBJECTS, [4, 3, 3, 5, 3], 'Semestre 6'),
];

export const HISTORICAL_EMPLOYEES: Employee[] = [
  { id: generateId(), name: 'Directeur Général', function: 'Direction', phone: '00 00 00 00', monthlySalary: 500000, active: true },
  { id: generateId(), name: 'Secrétaire Général', function: 'Administration', phone: '00 00 00 00', monthlySalary: 300000, active: true },
  { id: generateId(), name: 'Comptable', function: 'Comptabilité', phone: '00 00 00 00', monthlySalary: 250000, active: true },
  { id: generateId(), name: 'Coordinateur ASB', function: 'Coordination', phone: '00 00 00 00', monthlySalary: 350000, active: true },
  { id: generateId(), name: 'Directeur des Études', function: 'Pédagogie', phone: '00 00 00 00', monthlySalary: 400000, active: true },
];

export const HISTORICAL_SUPERVISIONS: Supervision[] = [
  { id: generateId(), date: '2025-03-15', supervisor: 'Directeur Général', terrain: 'C.H.R.', service: 'Urgences', className: 'ASB2A', absents: '', observation: 'Visite de routine' },
  { id: generateId(), date: '2025-03-22', supervisor: 'Coordinateur ASB', terrain: 'C.S.I.', service: 'Soins généraux', className: 'ASB2B', absents: '', observation: 'Évaluation des stages' },
];
