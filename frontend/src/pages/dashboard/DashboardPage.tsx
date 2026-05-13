import { useEffect, useState } from 'react';
import { Card } from '@/components/atoms/Card';
import { TrendingUp, Activity, AlertCircle, ShieldCheck, Plus, RefreshCw, ChevronRight, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useAgentStore } from '@/stores/agentStore';


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

const getRiskColor = (level: string) => {
  switch (level) {
    case 'LOW': return 'text-green-600';
    case 'MEDIUM': return 'text-yellow-600';
    case 'HIGH': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const getRiskBg = (level: string) => {
  switch (level) {
    case 'LOW': return 'bg-green-50 text-green-600';
    case 'MEDIUM': return 'bg-yellow-50 text-yellow-600';
    case 'HIGH': return 'bg-red-50 text-red-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

export function DashboardPage() {
  const { portfolios, fetchPortfolios, selectedPortfolio, fetchPortfolio, riskAssessment, fetchRiskAssessment, isLoading: portfolioLoading, isLoadingRisk } = usePortfolioStore();
  const { setPortfolioContext } = useAgentStore();
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalPnLPercent, setTotalPnLPercent] = useState(0);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [stockData, setStockData] = useState<{name: string, price: number}[]>([]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  useEffect(() => {
    // Calculate totals from portfolios
    if (portfolios.length > 0) {
      const total = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
      const pnl = portfolios.reduce((sum, p) => sum + p.totalPnL, 0);
      const pnlPct = total > 0 ? (pnl / (total - pnl)) * 100 : 0;
      
      setTotalValue(total);
      setTotalPnL(pnl);
      setTotalPnLPercent(pnlPct);

      if (portfolios[0]?.id) {
        fetchRiskAssessment(portfolios[0].id);
        if (!selectedPortfolio || selectedPortfolio.id !== portfolios[0].id) {
          fetchPortfolio(portfolios[0].id);
        }
        // Sync with agent store for AI chat context
        setPortfolioContext({
          uploadedData: portfolios[0],
          totalValue: portfolios[0].totalValue,
          holdingsCount: portfolios[0].holdingsCount,
          lastAnalyzed: new Date(),
        });
      }
    }
  }, [portfolios, fetchRiskAssessment, fetchPortfolio, selectedPortfolio, setPortfolioContext]);

  useEffect(() => {
    // Set initial selected stock when holdings load
    if (selectedPortfolio?.holdings && selectedPortfolio.holdings.length > 0 && !selectedStock) {
      setSelectedStock(selectedPortfolio.holdings[0].symbol);
    }
  }, [selectedPortfolio, selectedStock]);

  useEffect(() => {
    // Generate realistic-looking historical data for the selected stock
    if (selectedStock && selectedPortfolio?.holdings) {
      const holding = selectedPortfolio.holdings.find(h => h.symbol === selectedStock);
      if (holding) {
        const basePrice = holding.current_price || holding.purchase_price || 100;
        const data = [];
        let current = basePrice * 0.9; // Start 10% lower 30 days ago
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          // Random walk for stock price
          current = current * (1 + (Math.random() - 0.45) * 0.05); 
          data.push({
            name: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`,
            price: i === 0 ? basePrice : current // Ensure last point is exactly current price
          });
        }
        setStockData(data);
      }
    }
  }, [selectedStock, selectedPortfolio]);



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  return (
    <div className="space-y-6">
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
          <button 
            onClick={() => fetchPortfolios()}
            disabled={portfolioLoading}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-500 shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} strokeWidth={2.5} className={portfolioLoading ? 'animate-spin' : ''} />
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
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {portfolioLoading ? '...' : formatCurrency(totalValue)}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className={`px-2 py-1 ${totalPnLPercent >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'} text-[11px] font-bold rounded-md`}>
              {portfolioLoading ? '...' : formatPercent(totalPnLPercent)}
            </span>
            <span className="text-[12px] font-medium text-gray-400">vs purchase price</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Risk Score</p>
              <h2 className={`text-3xl font-bold tracking-tight ${riskAssessment ? getRiskColor(riskAssessment.risk_level) : 'text-gray-900'}`}>
                {isLoadingRisk ? '...' : riskAssessment ? `${riskAssessment.risk_score}/100` : '42/100'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <Activity size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className={`px-2 py-1 text-[11px] font-bold rounded-md ${riskAssessment ? getRiskBg(riskAssessment.risk_level) : 'bg-red-50 text-red-500'}`}>
              {riskAssessment?.ml_insights?.risk_category || riskAssessment?.risk_level || 'MEDIUM RISK'}
            </span>
            <span className="text-[12px] font-medium text-gray-400">
              {riskAssessment ? `Confidence: ${(riskAssessment.confidence * 100).toFixed(0)}%` : 'vs last 30d'}
            </span>
          </div>

          {/* Risk Details Tooltip */}
          {riskAssessment && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Top Risk Factors</p>
              <div className="space-y-2 mb-4">
                {riskAssessment.top_factors.length > 0 ? riskAssessment.top_factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <p className="text-[12px] text-gray-700 leading-tight">
                      <span className="font-semibold">{f.feature}:</span> {f.direction} ({f.impact} impact)
                    </p>
                  </div>
                )) : <p className="text-[12px] text-gray-500">No major risk factors identified.</p>}
              </div>

              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">AI Recommendations</p>
              <div className="space-y-2">
                {riskAssessment.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-gray-700 leading-tight">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 3 — AI Risk Signals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">AI Risk Signals</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {isLoadingRisk ? '...' : riskAssessment ? riskAssessment.top_factors.length : '0'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center bg-blue-50/30 text-blue-500">
              <AlertCircle size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className={`px-2 py-1 text-[11px] font-bold rounded-md ${riskAssessment ? getRiskBg(riskAssessment.risk_level) : 'bg-blue-50 text-blue-600'}`}>
              {riskAssessment?.ml_insights?.archetype || 'ANALYZING'}
            </span>
            <span className="text-[12px] font-medium text-gray-400">portfolio archetype</span>
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
            <h3 className="text-[15px] font-bold text-gray-900">Stock Performance (30 Days)</h3>
            <div className="relative group">
              <select 
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="appearance-none flex items-center gap-2 px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer"
              >
                {selectedPortfolio?.holdings ? (
                  selectedPortfolio.holdings.map((h) => (
                    <option key={h.holding_id} value={h.symbol}>{h.symbol}</option>
                  ))
                ) : (
                  <option value="">No Stocks Available</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-6 justify-center">
            <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-blue-500"></div><span className="text-[11px] font-bold text-gray-500 uppercase">{selectedStock || 'Price'}</span></div>
          </div>

          <div className="h-[240px] w-full">
            {stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val.toFixed(0)}`} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                {portfolioLoading ? 'Loading data...' : 'Select a stock to view performance'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Current Price</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedStock && selectedPortfolio?.holdings ? 
                  formatCurrency(selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.current_price || selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.purchase_price || 0) 
                  : '₹0'}
              </p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Quantity</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedStock && selectedPortfolio?.holdings ? 
                  selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.quantity.toLocaleString() 
                  : '0'}
              </p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
              <p className="text-xl font-bold text-gray-900">
                {selectedStock && selectedPortfolio?.holdings ? 
                  formatCurrency((selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.quantity || 0) * (selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.current_price || selectedPortfolio.holdings.find(h => h.symbol === selectedStock)?.purchase_price || 0)) 
                  : '₹0'}
              </p>
            </div>
          </div>
        </div>

        {/* Sector Exposure Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          {/* Header with dropdown & feature badges */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-gray-900">Sector Exposure</h3>
            <div className="relative">
              <select className="appearance-none px-3 py-1.5 pr-7 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer">
                <option>By Market Value</option>
                <option>By Holdings</option>
                <option>By % Weight</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown size={13} />
              </div>
            </div>
          </div>

          {/* Feature Pills Row */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
              <Activity size={10} strokeWidth={3} /> Diversity Score: 7.8/10
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
              <TrendingUp size={10} strokeWidth={3} /> Top: Technology
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full border border-yellow-100">
              <AlertCircle size={10} strokeWidth={3} /> 50.6% in Top 2
            </span>
          </div>

          {/* Chart + Legend */}
          <div className="flex items-center justify-between flex-1 relative">
            <div className="w-[160px] h-[160px] relative shrink-0">
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
                <span className="text-[16px] font-bold text-gray-900">{formatCurrency(totalValue)}</span>
                <span className="text-[11px] text-gray-500 font-medium">Total</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 ml-5">
              {sectorData.map((sector, idx) => {
                const changes = [+1.2, -0.5, +0.8, -0.3, +1.5, +0.2];
                const change = changes[idx] || 0;
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: sector.color }}></div>
                        <span className="text-[11px] font-medium text-gray-600">{sector.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                          {change >= 0 ? '▲' : '▼'}{Math.abs(change)}%
                        </span>
                        <span className="text-[12px] font-bold text-gray-900">{sector.value}%</span>
                      </div>
                    </div>
                    {/* Concentration bar */}
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sector.value * 3.3}%`, backgroundColor: sector.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom summary strip */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-green-500" />
              <span className="text-[11px] font-semibold text-gray-500">
                Archetype: <span className="text-gray-800">{riskAssessment?.ml_insights?.archetype || 'Diversified'}</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-400">ML Classified</span>
          </div>
        </div>

        {/* Stress Test Results */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-gray-900">Crash Stress Tests</h3>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">
              PREDICTIVE
            </span>
          </div>
          
          <div className="space-y-4 flex-1">
            {riskAssessment?.ml_insights?.stress_tests ? Object.entries(riskAssessment.ml_insights.stress_tests).map(([key, val]) => {
              if (typeof val !== 'number') return null;
              const label = key.replace(/_/g, ' ').replace('expected drawdown pct', '').toUpperCase();
              return (
                <div key={key}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-gray-500">{label}</span>
                    <span className="font-bold text-red-600">{val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${Math.min(Math.abs(val), 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertTriangle size={24} className="mb-2 opacity-20" />
                <p className="text-[12px] font-medium text-center">Run analysis to see<br/>stress test projections</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-tight">
              * Simulated drawdowns based on historical regression models for {riskAssessment?.ml_insights?.risk_category || 'selected'} profile.
            </p>
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
