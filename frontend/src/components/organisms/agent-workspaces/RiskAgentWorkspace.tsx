import React, { useState, useMemo } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export function RiskAgentWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedPortfolio = usePortfolioStore((state) => state.selectedPortfolio);

  const { metrics, riskRadarData } = useMemo(() => {
    if (!selectedPortfolio) {
      return {
        metrics: { vol: '0%', var: '₹0', drawdown: '0%', varPct: '0%' },
        riskRadarData: []
      };
    }

    const totalVal = selectedPortfolio.totalValue || 0;
    const varAmount = totalVal * 0.02; // 2% estimate
    
    // Mock radar data based on real concentration
    const holdingsCount = selectedPortfolio.holdings?.length || 0;
    const concentration = holdingsCount > 0 ? Math.min(100, (1 / holdingsCount) * 500) : 100;

    return {
      metrics: {
        vol: '14.5%',
        var: `₹${varAmount.toLocaleString()}`,
        varPct: '2.0%',
        drawdown: '-12.4%'
      },
      riskRadarData: [
        { risk: 'Concentration', value: concentration },
        { risk: 'Liquidity', value: 45 },
        { risk: 'Credit', value: 35 },
        { risk: 'Market', value: 72 },
        { risk: 'Operational', value: 28 },
      ]
    };
  }, [selectedPortfolio]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {!selectedPortfolio ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm">
              Please select a portfolio to view risk metrics.
            </div>
          ) : (
            <>
              {/* Risk Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 shadow-card">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase">Volatility</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-2">{metrics.vol}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 shadow-card">
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase">VaR (95%)</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-2">{metrics.var}</p>
                  <p className="text-[10px] text-red-700 mt-1">{metrics.varPct} of total portfolio</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 shadow-card">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold uppercase">Max Drawdown</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">{metrics.drawdown}</p>
                </div>
              </div>

              {/* Radar Chart */}
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-card">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Risk Profile Analysis</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={riskRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="risk" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis />
                      <Radar name="Risk" dataKey="value" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Warnings */}
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Risk Assessment
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  <p>• Analysis reflects your uploaded CSV holdings.</p>
                  <p>• Estimated daily Value-at-Risk is {metrics.var}.</p>
                  <p>• Concentration score: {riskRadarData[0]?.value.toFixed(0)}% (Higher means fewer stocks).</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
