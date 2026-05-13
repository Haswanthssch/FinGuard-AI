import React, { useState, useMemo } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

export function PortfolioAgentWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedPortfolio = usePortfolioStore((state) => state.selectedPortfolio);

  // Derive real data from portfolio
  const { allocationData, sectorData, metrics } = useMemo(() => {
    if (!selectedPortfolio || !selectedPortfolio.holdings) {
      return {
        allocationData: [
          { name: 'Equity', value: 0, color: '#3B82F6' },
          { name: 'Bonds', value: 0, color: '#10B981' },
          { name: 'Cash', value: 100, color: '#6B7280' },
        ],
        sectorData: [],
        metrics: { totalValue: 0, holdingsCount: 0, diversification: 0 }
      };
    }

    const holdings = selectedPortfolio.holdings;
    const totalVal = selectedPortfolio.totalValue || 1; // avoid div by zero

    // Group by sector
    const sectors: Record<string, number> = {};
    holdings.forEach(h => {
      const sector = h.sector || 'Others';
      const val = (h.current_price || h.purchase_price) * h.quantity;
      sectors[sector] = (sectors[sector] || 0) + val;
    });

    const sectorData = Object.entries(sectors).map(([name, val]) => ({
      category: name,
      value: Math.round((val / totalVal) * 100)
    })).sort((a, b) => b.value - a.value);

    // Simplistic allocation (assuming all holdings are Equity for now)
    const allocationData = [
      { name: 'Equity', value: 100, color: '#3B82F6' },
      { name: 'Bonds', value: 0, color: '#10B981' },
      { name: 'Cash', value: 0, color: '#6B7280' },
    ];

    return {
      allocationData,
      sectorData,
      metrics: {
        totalValue: selectedPortfolio.totalValue,
        holdingsCount: holdings.length,
        diversification: Math.min(100, holdings.length * 10) // Mock logic for visual score
      }
    };
  }, [selectedPortfolio]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Thinking State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-emerald-50 border-b border-emerald-100 px-6 py-3"
        >
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>⚙️</motion.div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Analyzing your uploaded data...</p>
              <p className="text-xs text-emerald-700">Syncing holdings and calculating sector exposure</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {!selectedPortfolio ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm">
              No portfolio selected. Please upload a CSV or select a portfolio to see live analysis.
            </div>
          ) : (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Allocation Donut */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-card"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={2} dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {allocationData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Sector Exposure */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-card"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Sector Exposure</h3>
                  {sectorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={sectorData}>
                        <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-400 text-xs">No sector data available</div>
                  )}
                </motion.div>
              </div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-emerald-50 p-6 rounded-lg border border-emerald-100"
              >
                <h3 className="text-sm font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Portfolio Insights
                </h3>
                <div className="space-y-3 text-sm text-emerald-900">
                  <p>✨ <strong>Holding Count: {metrics.holdingsCount}</strong> stocks identified from CSV.</p>
                  <p>✨ <strong>Total Value: ₹{metrics.totalValue.toLocaleString()}</strong></p>
                  <p>✨ Your portfolio is concentrated in <strong>{sectorData[0]?.category || 'Unknown'}</strong> sector ({sectorData[0]?.value || 0}%).</p>
                  <p>✨ Analysis reflects real-time data from your most recent upload.</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
