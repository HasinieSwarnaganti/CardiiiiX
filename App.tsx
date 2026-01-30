
import React, { useState, useEffect } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import ReportAnalyzer from './components/ReportAnalyzer';
import VitalScan from './components/VitalScan';
import { Activity, AlertCircle, Cpu, Zap, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [simulationMode, setSimulationMode] = useState(() => {
    return localStorage.getItem('vivitsu_sim_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vivitsu_sim_mode', simulationMode.toString());
  }, [simulationMode]);

  const renderContent = () => {
    const props = { simulationMode };
    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard {...props} />;
      case View.CHAT:
        return <ChatAssistant />;
      case View.REPORTS:
        return <ReportAnalyzer />;
      case View.VITAL_SCAN:
        return <VitalScan {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-red-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={28} />
              <h2 className="text-xl font-bold">Medical Disclaimer</h2>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Vivitsu Medical AI is an AI assistant and is <strong>not a substitute for professional medical advice</strong>, diagnosis, or treatment. 
              Always seek the advice of your physician.
            </p>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {activeView.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Simulation Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setSimulationMode(false)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!simulationMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Globe size={12} />
                Live
              </button>
              <button 
                onClick={() => setSimulationMode(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${simulationMode ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Cpu size={12} />
                Sim
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-tighter ${simulationMode ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                <Zap size={10} className={simulationMode ? '' : 'animate-pulse'} />
                {simulationMode ? 'Local Simulation' : 'Port 3000 Active'}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
              VM
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          {simulationMode && (
            <div className="bg-amber-50 border-b border-amber-100 px-8 py-2 text-[10px] font-bold text-amber-700 flex items-center justify-center gap-2 sticky top-0 z-10">
              <Cpu size={12} />
              RUNNING IN SIMULATION MODE - NO LOCAL BACKEND REQUIRED
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
