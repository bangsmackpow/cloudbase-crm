import React from 'react';
import { LayoutDashboard, Columns, FileText, Settings, Users, Command } from 'lucide-react';

const CommandRail = () => {
  return (
    <div className="w-16 h-screen glass border-r flex flex-col items-center py-6 gap-8 fixed left-0 top-0 z-50">
      <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center text-white shadow-md">
        <Command size={20} />
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        <NavItem icon={<LayoutDashboard size={20} />} active />
        <NavItem icon={<Columns size={20} />} />
        <NavItem icon={<Users size={20} />} />
        <NavItem icon={<FileText size={20} />} />
      </div>
      
      <div className="mt-auto flex flex-col gap-6">
        <NavItem icon={<Settings size={20} />} />
        <div className="w-8 h-8 rounded-full bg-border-medium border border-border-light overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Avatar" />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) => (
  <button className={`p-2 rounded-lg transition-all duration-200 ${
    active ? 'bg-accent-blue text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-border-light'
  }`}>
    {icon}
  </button>
);

export default CommandRail;
