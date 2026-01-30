
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, Activity, Zap, Wind, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, WifiOff, AlertCircle, Terminal, Info, Cpu } from 'lucide-react';
import { localServices, ServiceStatus } from '../services/localServices';

interface DashboardProps {
  simulationMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ simulationMode = false }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [backendStatus, setBackendStatus] = useState<ServiceStatus | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { backend } = await localServices.checkHealth(simulationMode);
      setBackendStatus(backend);
      const data = await localServices.getScanHistory(simulationMode);
      setHistory(data);
    };
    loadData();
  }, [simulationMode]);

  const chartData = history.length > 0 
    ? history.map(h => ({ 
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        heartRate: h.heartRate 
      }))
    : [
        { time: '08:00', heartRate: 72 },
        { time: '10:00', heartRate: 85 },
        { time: '12:00', heartRate: 78 },
        { time: '14:00', heartRate: 92 },
      ];

  const latest = history[history.length - 1];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Service Error & CORS Helper */}
      {!simulationMode && backendStatus && !backendStatus.ok && (
        <div className="space-y-4 animate-in slide-in-from-top-4">
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
            <div className="p-4 bg-red-100 text-red-600 rounded-2xl shrink-0">
              <WifiOff size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-red-900 mb-1">Backend Connection Failed</h3>
              <p className="text-red-700 text-sm font-medium mb-3">
                {backendStatus.message}. {backendStatus.errorType === 'CORS' ? 'This is likely a CORS policy restriction.' : ''}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-200"
                >
                  <Terminal size={14} />
                  {showDebug ? 'Hide Fix' : 'Show Quick Fix'}
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-xl border border-red-200 text-xs font-bold text-red-800">
                   <Info size={14} />
                   Try Simulation Mode in header
                </div>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-1">Raw Error</p>
              <code className="text-[10px] text-red-500 bg-red-100/50 px-2 py-1 rounded">{backendStatus.rawError}</code>
            </div>
          </div>

          {showDebug && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Node.js Fix</h4>
                </div>
                <pre className="text-[11px] text-blue-400 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto">
{`// 1. npm install cors
const cors = require('cors');
const app = express();

// 2. Add this BEFORE routes
app.use(cors());`}
                </pre>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">FastAPI Fix</h4>
                </div>
                <pre className="text-[11px] text-green-400 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto">
{`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)`}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Patient Console</h2>
          <p className="text-slate-500 font-medium text-lg">Real-time health insights via CardiaX.</p>
        </div>
        
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Heart Rate', val: latest?.heartRate || '72', unit: 'bpm', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50', trend: 'up' },
          { label: 'Est. BP', val: latest ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}` : '120/80', unit: 'mmHg', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'down' },
          { label: 'HRV', val: latest?.hrv || '64', unit: 'ms', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'up' },
          { label: 'Oxygen', val: '98', unit: '%', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50', trend: 'stable' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={32} />
              </div>
              <div className="flex flex-col items-end">
                {stat.trend === 'up' && <ArrowUpRight size={24} className="text-rose-500" />}
                {stat.trend === 'down' && <ArrowDownRight size={24} className="text-green-500" />}
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{stat.trend}</span>
              </div>
            </div>
            <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
              <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vitals Timeline</h3>
              <p className="text-sm text-slate-400 font-medium">Cardiovascular micro-fluctuation history</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <Clock size={16} className="text-blue-500" />
              {simulationMode ? 'Simulated Data' : 'Live Stream'}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 800, padding: '16px' }}
                />
                <Area type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={5} fillOpacity={1} fill="url(#colorHeart)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
             <ShieldCheck size={160} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <Zap size={24} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Health Analysis</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Clinical interpretation of recent scans</p>
          </div>
          
          <div className="flex-1 space-y-6 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
            {latest ? (
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Verified</span>
                   <span className="text-[10px] font-bold text-slate-500">{new Date(latest.timestamp).toLocaleDateString()}</span>
                 </div>
                 <div className="text-white/80 text-sm italic leading-relaxed font-medium">
                    "{latest.aiInterpretation}"
                 </div>
              </div>
            ) : (
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center gap-6 py-12">
                <div className="p-4 bg-blue-500/10 rounded-full">
                  <Activity size={40} className="text-blue-500 animate-pulse" />
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  No scan history found. Run a Vital Scan to generate clinical AI insights.
                </p>
              </div>
            )}
          </div>

          <button className="w-full mt-10 py-5 bg-white text-slate-900 font-black rounded-[1.5rem] hover:bg-blue-50 transition-all relative z-10 shadow-2xl hover:scale-[1.02] active:scale-95">
            Full Wellness Report
          </button>
        </div>
      </div>
      
    
      
    </div>
  );
};

export default Dashboard;
