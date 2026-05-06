import { Card } from '@/components/atoms/Card';
import { TrendingUp, Activity, AlertCircle, ShieldCheck, Plus, RefreshCw, ChevronRight, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const performanceData = [
  { name: 'May 1', accuracy: 55, precision: 20, recall: 30 },
  { name: 'May 8', accuracy: 75, precision: 45, recall: 35 },
  { name: 'May 15', accuracy: 68, precision: 35, recall: 45 },
  { name: 'May 22', accuracy: 60, precision: 45, recall: 35 },
  { name: 'May 29', accuracy: 62, precision: 75, recall: 25 },
  { name: 'Jun 5', accuracy: 90, precision: 65, recall: 40 },
];

const sectorData = [
  { name: 'Technology', value: 28.5, color: '#2563eb' },
  { name: 'Financial Services', value: 22.1, color: '#3b82f6' },
  { name: 'Healthcare', value: 15.3, color: '#60a5fa' },
  { name: 'Consumer Goods', value: 12.8, color: '#93c5fd' },
  { name: 'Energy', value: 9.4, color: '#bfdbfe' },
  { name: 'Others', value: 11.9, color: '#dbeafe' },
];

export function DashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-8 space-y-6 bg-[#FAFAFA] min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Executive <span className="text-blue-500">Command Center</span>
          </h1>
          <p className="text-gray-500 mt-1.5 font-medium">Real-time telemetry and algorithmic insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition-colors border border-blue-100">
            <Plus size={16} strokeWidth={3} />
            Add Widget
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-500 shadow-sm">
            <RefreshCw size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Portfolio Value</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">$2,543,000</h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-md">+12.5%</span>
            <span className="text-[12px] font-medium text-gray-400">vs last 30d</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Risk Score</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">42/100</h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <Activity size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-1 bg-red-50 text-red-500 text-[11px] font-bold rounded-md">-5.2%</span>
            <span className="text-[12px] font-medium text-gray-400">vs last 30d</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Fraud Alerts</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">3 Active</h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <AlertCircle size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-md">+1</span>
            <span className="text-[12px] font-medium text-gray-400">vs last 30d</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Compliance Status</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">98%</h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-md">+2%</span>
            <span className="text-[12px] font-medium text-gray-400">vs last 30d</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-bold text-gray-900">Algorithmic Performance Tracker</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50">
              Last 30 Days <ChevronDown size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-6 mb-6 justify-center">
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-blue-500"></div><span className="text-[11px] font-bold text-gray-500 uppercase">Accuracy</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-blue-500 border border-dashed border-white border-t-0 border-b-0 border-x-2"></div><span className="text-[11px] font-bold text-gray-500 uppercase">Precision</span></div>
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-blue-300 border border-dotted border-white border-t-0 border-b-0 border-x-2"></div><span className="text-[11px] font-bold text-gray-500 uppercase">Recall</span></div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeDasharray="6 6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recall" stroke="#93c5fd" strokeDasharray="2 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Accuracy</p>
              <p className="text-xl font-bold text-gray-900">87.3%</p>
              <p className="text-[11px] font-bold text-green-500 mt-1">↑ 5.6%</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Precision</p>
              <p className="text-xl font-bold text-gray-900">83.1%</p>
              <p className="text-[11px] font-bold text-green-500 mt-1">↑ 4.2%</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Recall</p>
              <p className="text-xl font-bold text-gray-900">78.9%</p>
              <p className="text-[11px] font-bold text-green-500 mt-1">↑ 3.1%</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">F1 Score</p>
              <p className="text-xl font-bold text-gray-900">81.0%</p>
              <p className="text-[11px] font-bold text-green-500 mt-1">↑ 4.0%</p>
            </div>
          </div>
        </div>

        {/* Sector Exposure Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] font-bold text-gray-900">Sector Exposure</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50">
              By Market Value <ChevronDown size={14} />
            </button>
          </div>
          
          <div className="flex items-center justify-between flex-1 relative">
            <div className="w-[160px] h-[160px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[16px] font-bold text-gray-900">$2.54M</span>
                <span className="text-[11px] text-gray-500 font-medium">Total</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 ml-6">
              {sectorData.map((sector, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sector.color }}></div>
                    <span className="text-[12px] font-medium text-gray-600">{sector.name}</span>
                  </div>
                  <span className="text-[12px] font-bold text-gray-900">{sector.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <button className="text-blue-500 font-bold text-[13px] flex items-center justify-center w-full hover:text-blue-600 transition-colors">
              View Full Breakdown <ChevronRight size={14} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">AI Insight Feed</h3>
            <button className="text-blue-500 font-semibold text-[12px] px-3 py-1 bg-blue-50 rounded-lg">View All</button>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp size={14} className="text-blue-500" />
            </div>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
              Portfolio diversification improved by <span className="text-green-600 font-bold">8.2%</span> this month.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Recent Alerts</h3>
            <button className="text-blue-500 font-semibold text-[12px] px-3 py-1 bg-blue-50 rounded-lg">View All</button>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-red-100 bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={14} className="text-red-500" />
              </div>
              <p className="text-[13px] text-gray-900 font-medium">Unusual trading pattern detected in INFY</p>
            </div>
            <div className="flex items-center text-gray-400 text-[11px] font-medium shrink-0">
              2m ago <ChevronRight size={14} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">System Health</h3>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full border border-green-100 bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={14} className="text-green-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-green-600">All Systems Operational</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">99.9% Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
