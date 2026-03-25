import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CommandRail from './components/CommandRail';
import Login from './pages/Login';
import './styles/theme.css';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-screen overflow-hidden bg-primary">
    <CommandRail />
    <main className="flex-1 ml-16 p-8 overflow-y-auto">
      {children}
    </main>
  </div>
);

const MainBoard = () => (
  <>
    <header className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Main Board</h1>
        <p className="text-secondary mt-1">Overview of all active items and tasks</p>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-secondary border rounded-lg hover:bg-border-light transition-all">Filter</button>
        <button className="px-4 py-2 bg-accent-blue text-white rounded-lg shadow-sm hover:opacity-90 transition-all">+ New Item</button>
      </div>
    </header>

    <section className="glass rounded-2xl p-6 shadow-md border animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-secondary font-medium px-4 pb-2 border-b">
          <div className="w-1/3">Item Name</div>
          <div className="w-1/4">Status</div>
          <div className="w-1/4">Due Date</div>
          <div className="w-1/6">Owner</div>
        </div>
        
        <BoardItem name="Design System Review" status="In Progress" date="Dec 24, 2026" owner="CL" />
        <BoardItem name="D1 Migration" status="Done" date="Dec 22, 2026" owner="AI" />
        <BoardItem name="Authentication Flow" status="Pending" date="Dec 28, 2026" owner="JD" />
      </div>
    </section>
  </>
);

const BoardItem = ({ name, status, date, owner }: any) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-border-light transition-all border border-transparent hover:border-border-light cursor-pointer group">
    <div className="w-1/3 font-medium text-primary">{name}</div>
    <div className="w-1/4">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'Done' ? 'bg-accent-success/10 text-accent-success' : 
        status === 'In Progress' ? 'bg-accent-blue/10 text-accent-blue' : 
        'bg-accent-warning/10 text-accent-warning'
      }`}>
        {status}
      </span>
    </div>
    <div className="w-1/4 text-secondary text-sm">{date}</div>
    <div className="w-1/6 flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-[10px] font-bold">
        {owner}
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout><MainBoard /></DashboardLayout>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
