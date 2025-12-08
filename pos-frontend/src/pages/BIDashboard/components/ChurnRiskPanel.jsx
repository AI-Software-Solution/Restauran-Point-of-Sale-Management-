import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getChurnRisk } from '../../../https';

const RISK_COLORS = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' }
};

const ChurnRiskPanel = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['churn-risk'],
    queryFn: () => getChurnRisk(180),
    refetchInterval: 300000
  });

  const churnData = data?.data?.data || {};

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">⚠️ Yo'qolish Xavfi</h3>
        <p className="text-gray-400 text-sm">Ma'lumotlarni yuklashda xatolik</p>
      </div>
    );
  }

  const { riskGroups, totalAtRisk, totalPotentialLoss, insights } = churnData;

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">⚠️ Yo'qolish Xavfi (Churn Risk)</h3>
        <span className="text-sm text-gray-400">
          {totalAtRisk || 0} xavfli mijoz
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`${RISK_COLORS.high.bg} border ${RISK_COLORS.high.border} rounded-xl p-4 text-center`}>
          <p className={`text-3xl font-bold ${RISK_COLORS.high.text}`}>
            {riskGroups?.high?.count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Yuqori xavf</p>
          <p className="text-xs text-red-300 mt-2">
            {(riskGroups?.high?.potentialLoss || 0).toLocaleString()} so'm
          </p>
        </div>
        <div className={`${RISK_COLORS.medium.bg} border ${RISK_COLORS.medium.border} rounded-xl p-4 text-center`}>
          <p className={`text-3xl font-bold ${RISK_COLORS.medium.text}`}>
            {riskGroups?.medium?.count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">O'rta xavf</p>
          <p className="text-xs text-yellow-300 mt-2">
            {(riskGroups?.medium?.potentialLoss || 0).toLocaleString()} so'm
          </p>
        </div>
        <div className={`${RISK_COLORS.low.bg} border ${RISK_COLORS.low.border} rounded-xl p-4 text-center`}>
          <p className={`text-3xl font-bold ${RISK_COLORS.low.text}`}>
            {riskGroups?.low?.count || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Past xavf</p>
          <p className="text-xs text-green-300 mt-2">
            {(riskGroups?.low?.potentialLoss || 0).toLocaleString()} so'm
          </p>
        </div>
      </div>

      {/* Total Potential Loss */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Jami yo'qotish xavfi</p>
            <p className="text-2xl font-bold text-red-400">
              {(totalPotentialLoss || 0).toLocaleString()} so'm
            </p>
          </div>
          <div className="text-4xl">💸</div>
        </div>
      </div>

      {/* High Risk Customers List */}
      {riskGroups?.high?.customers && riskGroups.high.customers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Yuqori xavfli mijozlar (Top 10)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riskGroups.high.customers.map((customer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#0a0a0a] rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="text-red-400 text-sm font-medium">
                        {customer.riskScore}
                      </span>
                    </div>
                    {/* Risk Progress Ring */}
                    <svg className="absolute -top-0.5 -left-0.5 w-11 h-11 -rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="3"
                        strokeDasharray={`${(customer.riskScore / 100) * 113} 113`}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{customer.phone}</p>
                    <p className="text-xs text-gray-500">
                      {customer.daysSinceLastVisit} kun oldin | {customer.visits} tashrif
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-400">
                    -{customer.potentialLoss.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">potensial yo'qotish</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Risk Customers */}
      {riskGroups?.medium?.customers && riskGroups.medium.customers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            O'rta xavfli mijozlar
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {riskGroups.medium.customers.slice(0, 5).map((customer, idx) => (
              <div
                key={idx}
                className="bg-[#0a0a0a] rounded-lg p-2 text-center border border-yellow-500/20"
              >
                <p className="text-xs text-gray-400 truncate">{customer.phone}</p>
                <p className="text-lg font-bold text-yellow-400">{customer.riskScore}</p>
                <p className="text-xs text-gray-500">{customer.daysSinceLastVisit} kun</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">AI Tavsiyalar</h4>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 ${
                insight.type === 'critical'
                  ? 'bg-red-500/10 border border-red-500/30'
                  : insight.type === 'warning'
                    ? 'bg-yellow-500/10 border border-yellow-500/30'
                    : 'bg-blue-500/10 border border-blue-500/30'
              }`}
            >
              <p className={`text-sm ${
                insight.type === 'critical' ? 'text-red-400' :
                insight.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {insight.type === 'critical' ? '🚨' : insight.type === 'warning' ? '⚠️' : '💡'} {insight.message}
              </p>
              {insight.action && (
                <p className="text-xs text-gray-400 mt-2">
                  Tavsiya: {insight.action}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {(!riskGroups || (riskGroups.high?.count === 0 && riskGroups.medium?.count === 0)) && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-gray-400">Barcha mijozlar faol!</p>
          <p className="text-gray-500 text-sm mt-1">Yo'qolish xavfi yo'q</p>
        </div>
      )}
    </div>
  );
};

export default ChurnRiskPanel;
