
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import StudentList from './components/StudentList.tsx';
import Financials from './components/Financials.tsx';
import Settings from './components/Settings.tsx';
import GraduationReport from './components/GraduationReport.tsx';
import SyncCenter from './components/SyncCenter.tsx';
import { StudentsProvider } from './hooks/useStudents.tsx';
import { GraduationSettingsProvider } from './hooks/useGraduationSettings.tsx';
import { AppSettingsProvider } from './hooks/useAppSettings.tsx';
import { Menu, X } from 'lucide-react';
import { SyncStatusProvider } from './hooks/useSyncStatus.tsx';

type Page = 'dashboard' | 'students' | 'financials' | 'settings' | 'graduationReport' | 'sync';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentList />;
      case 'financials':
        return <Financials />;
      case 'settings':
        return <Settings />;
      case 'graduationReport':
        return <GraduationReport />;
      case 'sync':
        return <SyncCenter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SyncStatusProvider>
      <AppSettingsProvider>
        <GraduationSettingsProvider>
          <StudentsProvider>
            <div className="flex h-screen bg-slate-900 text-slate-100">
              {/* Mobile Sidebar Toggle */}
              <div className="absolute top-4 left-4 z-20 md:hidden">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-md text-white">
                      {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
              </div>
                
              {/* Sidebar */}
              <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-10`}>
                  <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} closeSidebar={() => setIsSidebarOpen(false)} />
              </div>

              {/* Main Content */}
              <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {renderPage()}
              </main>
            </div>
          </StudentsProvider>
        </GraduationSettingsProvider>
      </AppSettingsProvider>
    </SyncStatusProvider>
  );
};

export default App;