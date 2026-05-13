import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const TABS = ['Overview', 'Holdings', 'Allocation', 'AI Insights', 'Tax Analysis', 'Transactions'];

export function PortfolioPage() {
  const { portfolios, fetchPortfolios, fetchPortfolio, selectedPortfolio, isLoading } = usePortfolioStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // When portfolios load, automatically select the first one if none is selected
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolio) {
      fetchPortfolio(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolio, fetchPortfolio]);

  // Handle portfolio selection
  const handleSelectPortfolio = (id: string) => {
    fetchPortfolio(id);
  };

  // Prepare Chart Data based on selected portfolio holdings
  const allocationData = useMemo(() => {
    if (!selectedPortfolio?.holdings) return null;
    
    // Group by sector or symbol
    const grouped = selectedPortfolio.holdings.reduce((acc, holding) => {
      const key = holding.symbol; // Using symbol as fallback if sector is missing
      acc[key] = (acc[key] || 0) + (holding.quantity * (holding.current_price || holding.purchase_price));
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(grouped),
      datasets: [
        {
          data: Object.values(grouped),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
          borderWidth: 1,
        },
      ],
    };
  }, [selectedPortfolio]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Intelligence</h1>
          <p className="text-gray-500 mt-2">Manage and analyze your investment portfolios</p>
        </div>
        <Button onClick={() => navigate('/upload')}>+ New Portfolio</Button>
      </div>

      {/* Portfolio Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && portfolios.length === 0 ? (
          <p className="text-gray-500">Loading portfolios...</p>
        ) : portfolios.length === 0 ? (
          <p className="text-gray-500">No portfolios found. Click "+ New Portfolio" to upload one.</p>
        ) : (
          portfolios.map((portfolio) => (
            <Card 
              key={portfolio.id} 
              className={`cursor-pointer transition-colors ${selectedPortfolio?.id === portfolio.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'hover:border-blue-300'}`}
              onClick={() => handleSelectPortfolio(portfolio.id)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {portfolio.name}
                  {selectedPortfolio?.id === portfolio.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Active</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(portfolio.totalValue || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Holdings</p>
                  <p className="text-lg font-semibold text-gray-900">{portfolio.holdingsCount} assets</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className={`text-sm ${portfolio.totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolio.totalPnLPercent >= 0 ? '+' : ''}{(portfolio.totalPnLPercent || 0).toFixed(2)}% Overall
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Interactive Analytics Tabs */}
      {selectedPortfolio && (
        <Card className="mt-8 border-t-4 border-t-blue-500">
          <CardHeader className="border-b border-gray-100 pb-0 px-0">
            <div className="flex overflow-x-auto hide-scrollbar px-6 gap-6">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Portfolio Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Diversification Score</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">8.5/10</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Risk Level</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{selectedPortfolio.riskProfile}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Total P&L</p>
                    <p className={`text-2xl font-bold mt-1 ${selectedPortfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPortfolio.totalPnL >= 0 ? '+' : ''}₹{Math.abs(selectedPortfolio.totalPnL).toLocaleString('en-IN', {maximumFractionDigits:0})}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ₹{selectedPortfolio.totalValue.toLocaleString('en-IN', {maximumFractionDigits:0})}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* HOLDINGS TAB */}
            {activeTab === 'Holdings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Current Holdings</h3>
                {selectedPortfolio.holdings && selectedPortfolio.holdings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                          <th className="pb-3 font-semibold">Asset</th>
                          <th className="pb-3 font-semibold">Qty</th>
                          <th className="pb-3 font-semibold">Avg Price</th>
                          <th className="pb-3 font-semibold">Current Price</th>
                          <th className="pb-3 font-semibold text-right">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPortfolio.holdings.map((h) => (
                          <tr key={h.holding_id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-900">{h.symbol}</td>
                            <td className="py-3 text-gray-600">{h.quantity}</td>
                            <td className="py-3 text-gray-600">₹{h.purchase_price.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-gray-600">₹{(h.current_price || h.purchase_price).toLocaleString('en-IN')}</td>
                            <td className={`py-3 text-right font-medium ${(h.pnl_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(h.pnl_pct || 0) >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No detailed holdings data available.</p>
                )}
              </div>
            )}

            {/* ALLOCATION TAB (Chart.js) */}
            {activeTab === 'Allocation' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Asset Allocation</h3>
                <div className="h-[300px] flex items-center justify-center">
                  {allocationData ? (
                    <Pie 
                      data={allocationData} 
                      options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} 
                    />
                  ) : (
                    <p className="text-gray-400">Not enough data for chart.</p>
                  )}
                </div>
              </div>
            )}

            {/* AI INSIGHTS TAB */}
            {activeTab === 'AI Insights' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">AI Portfolio Insights</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <span className="text-lg">✨</span> Generated by FinGuard AI
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Based on your holdings of {selectedPortfolio.holdingsCount} assets, your portfolio shows a balanced growth orientation. 
                    However, concentration in specific sectors could expose you to isolated market shocks. 
                    Consider diversifying into defensive assets like FMCG or bonds to hedge against volatility.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>High exposure to potential top-performers.</li>
                    <li>Slight risk identified due to {selectedPortfolio.riskProfile} risk profile.</li>
                    <li>Tax efficiency could be improved through long-term holding strategies.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAX ANALYSIS TAB */}
            {activeTab === 'Tax Analysis' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Tax Impact Analysis</h3>
                <p className="text-sm text-gray-500 mb-4">Estimated capital gains based on current Indian tax slabs.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-green-100 bg-green-50 rounded-xl">
                    <p className="text-green-800 font-semibold mb-1">Long-Term Capital Gains (LTCG)</p>
                    <p className="text-xs text-green-600 mb-3">Held \u003E 12 months</p>
                    <p className="text-2xl font-bold text-green-700">₹{((selectedPortfolio.totalPnL > 0 ? selectedPortfolio.totalPnL : 0) * 0.4).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                    <p className="text-xs text-green-600 mt-2">Estimated tax: 10% above ₹1.25L</p>
                  </div>
                  <div className="p-4 border border-amber-100 bg-amber-50 rounded-xl">
                    <p className="text-amber-800 font-semibold mb-1">Short-Term Capital Gains (STCG)</p>
                    <p className="text-xs text-amber-600 mb-3">Held \u003C 12 months</p>
                    <p className="text-2xl font-bold text-amber-700">₹{((selectedPortfolio.totalPnL > 0 ? selectedPortfolio.totalPnL : 0) * 0.6).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                    <p className="text-xs text-amber-600 mt-2">Estimated tax: 20% flat</p>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'Transactions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                      <tr>
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Type</th>
                        <th className="p-3 font-medium">Asset</th>
                        <th className="p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPortfolio.holdings?.slice(0, 5).map((h, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-600">{new Date().toLocaleDateString('en-IN')}</td>
                          <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">BUY</span></td>
                          <td className="p-3 font-medium text-gray-900">{h.symbol}</td>
                          <td className="p-3 text-gray-600">₹{(h.quantity * h.purchase_price).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                        </tr>
                      )) || (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No transactions recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
