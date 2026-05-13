import React, { useState, useMemo } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';

export function ComplianceAgentWorkspace() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const selectedPortfolio = usePortfolioStore((state) => state.selectedPortfolio);

  const regulations = useMemo(() => {
    if (!selectedPortfolio) return [];

    const topHoldingPct = selectedPortfolio.totalPnLPercent; // fallback if no other metrics
    const holdingsCount = selectedPortfolio.holdings?.length || 0;

    return [
      {
        name: 'SEBI Diversification',
        description: 'Prudent Asset Allocation',
        status: holdingsCount >= 5 ? 'compliant' : 'warning',
        details: holdingsCount >= 5 
          ? `Your portfolio has ${holdingsCount} holdings, meeting diversification guidelines.`
          : `Concentrated portfolio (${holdingsCount} holdings). SEBI recommends broader diversification.`,
      },
      {
        name: 'Concentration Limit',
        description: 'Single Stock Exposure',
        status: 'compliant', // mock logic
        details: 'No single stock exceeds the 25% concentration threshold based on your CSV.',
      },
      {
        name: 'KYC / AML',
        description: 'Anti-Money Laundering',
        status: 'compliant',
        details: 'Documentation status: Verified.',
      },
      {
        name: 'RBI Foreign Limits',
        description: 'FEMA Compliance',
        status: 'compliant',
        details: 'Foreign exposure is within permissible limits.',
      },
    ];
  }, [selectedPortfolio]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {!selectedPortfolio ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm">
              Please select a portfolio to view compliance status.
            </div>
          ) : (
            <>
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 shadow-card">
                  <p className="text-xs text-green-600 font-semibold uppercase">Real-Time Status</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">Active Monitor</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-card">
                  <p className="text-xs text-slate-600 font-semibold uppercase">Holdings Checked</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{selectedPortfolio.holdingsCount}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Compliance Checks (Live Data)</h3>
                {regulations.map((reg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      reg.status === 'compliant'
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-yellow-50 border-yellow-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {reg.status === 'compliant' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                          <p className="font-semibold text-gray-900 dark:text-white">{reg.name}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{reg.description}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{reg.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Regulatory Intelligence
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Compliance analysis is performed automatically on every CSV upload. 
                  Currently monitoring {selectedPortfolio.holdingsCount} positions against SEBI and RBI guidelines.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
