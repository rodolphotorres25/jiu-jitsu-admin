
import React from 'react';
import { LayoutDashboard, Users, DollarSign, Settings, X, Award, RefreshCw } from 'lucide-react';

type Page = 'dashboard' | 'students' | 'financials' | 'settings' | 'graduationReport' | 'sync';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  closeSidebar: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-brand-accent text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, closeSidebar }) => {
  const handleNav = (page: Page) => {
    setCurrentPage(page);
    closeSidebar();
  };

  return (
    <aside className="flex flex-col w-64 h-full bg-slate-800 text-white p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <div className="bg-white p-1 rounded">
                <svg width="24" height="24" viewBox="0 0 100 100" className="text-brand-blue">
                    <path fill="currentColor" d="M50 0L0 25v50l50 25 50-25V25L50 0zm0 88L12 69V31l38-19 38 19v38L50 88zM50 25a25 25 0 100 50 25 25 0 000-50z" />
                </svg>
            </div>
            <span className="ml-3 text-xl font-bold">Jiu-Jitsu Admin</span>
        </div>
        <button onClick={closeSidebar} className="p-2 text-white md:hidden">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={currentPage === 'dashboard'} onClick={() => handleNav('dashboard')} />
        <NavItem icon={<Users size={20} />} label="Alunos" isActive={currentPage === 'students'} onClick={() => handleNav('students')} />
        <NavItem icon={<DollarSign size={20} />} label="Financeiro" isActive={currentPage === 'financials'} onClick={() => handleNav('financials')} />
        <NavItem icon={<Award size={20} />} label="Hall da Fama" isActive={currentPage === 'graduationReport'} onClick={() => handleNav('graduationReport')} />
        <NavItem icon={<RefreshCw size={20} />} label="Sincronizar" isActive={currentPage === 'sync'} onClick={() => handleNav('sync')} />
        <NavItem icon={<Settings size={20} />} label="Configurações" isActive={currentPage === 'settings'} onClick={() => handleNav('settings')} />
      </nav>
      <div className="mt-auto">
        <p className="text-xs text-center text-slate-400">&copy; {new Date().getFullYear()} Gym Control</p>
      </div>
    </aside>
  );
};
