import React from 'react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, format = 'number', icon, trend, trendValue, subtitle }) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return `${val.toLocaleString()} so'm`;
    }
    if (format === 'percent') {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#2a2a2a] hover:border-blue-500/30 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
      {subtitle && (
        <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default KPICard;
