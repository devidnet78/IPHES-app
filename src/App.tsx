import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Alumni from './pages/Alumni';
import Payments from './pages/Payments';
import Accounting from './pages/Accounting';
import Payroll from './pages/Payroll';
import Bulletins from './pages/Bulletins';
import Subjects from './pages/Subjects';
import Receipts from './pages/Receipts';
import Reminders from './pages/Reminders';
import Deadlines from './pages/Deadlines';
import Commitments from './pages/Commitments';
import Attendance from './pages/Attendance';
import Stages from './pages/Stages';
import SaturdayPlans from './pages/SaturdayPlans';
import Supervision from './pages/Supervision';
import Tariffs from './pages/Tariffs';
import ImportExport from './pages/ImportExport';
import CloudSync from './pages/CloudSync';
import DataIndex from './pages/DataIndex';

function AppContent() {
  const { currentRole, loadAll } = useApp();
  const defaultPage = currentRole === 'director' ? 'dashboard' : 'students';
  const [activePage, setActivePage] = useState(defaultPage);
  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    if (currentRole && currentRole !== 'director' && activePage === 'dashboard') {
      setActivePage('students');
    }
  }, [currentRole, activePage]);
  if (!currentRole) return <LoginScreen />;
  const renderPage = () => {
    if (currentRole !== 'director' && activePage === 'dashboard') return <Students />;
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'alumni': return <Alumni />;
      case 'payments': return <Payments />;
      case 'accounting': return <Accounting />;
      case 'payroll': return <Payroll />;
      case 'bulletins': return <Bulletins />;
      case 'subjects': return <Subjects />;
      case 'receipts': return <Receipts />;
      case 'reminders': return <Reminders />;
      case 'deadlines': return <Deadlines />;
      case 'commitments': return <Commitments />;
      case 'attendance': return <Attendance />;
      case 'stages': return <Stages />;
      case 'saturday-plans': return <SaturdayPlans />;
      case 'supervision': return <Supervision />;
      case 'tariffs': return <Tariffs />;
      case 'import-export': return <ImportExport />;
      case 'cloud-sync': return <CloudSync />;
      case 'data-index': return <DataIndex />;
      default: return currentRole === 'director' ? <Dashboard /> : <Students />;
    }
  };
  return <Layout activePage={activePage} setActivePage={setActivePage}>{renderPage()}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
