import React from 'react';
import { motion } from 'framer-motion';

const InsightsPanel = ({ insights = [] }) => {
  const getTypeStyles = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'critical':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'positive':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return 'ℹ️';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 h-full">
        <h3 className="text-lg font-semibold mb-4">🤖 AI Insights</h3>
        <div className="text-gray-400 text-center py-8">
          <p>Ma'lumotlar to'planmoqda...</p>
          <p className="text-sm mt-2">Tahlil uchun ko'proq buyurtmalar kerak</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6 h-full">
      <h3 className="text-lg font-semibold mb-4">🤖 AI Insights</h3>
      <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg border ${getTypeStyles(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{getIcon(insight.type)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-white">{insight.title}</h4>
                <p className="text-sm mt-1 opacity-80">{insight.message}</p>
                {insight.action && (
                  <p className="text-xs mt-2 text-gray-400">
                    💡 {insight.action}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
