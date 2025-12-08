import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { getCustomerSegments } from '../../../https';

const SEGMENT_COLORS = {
  vip: '#FFD700',      // Gold
  powerUser: '#8B5CF6', // Purple
  loyal: '#3B82F6',     // Blue
  regular: '#22C55E',   // Green
  casual: '#06B6D4',    // Cyan
  new: '#14B8A6',       // Teal
  inactive: '#EF4444'   // Red
};

const SEGMENT_NAMES = {
  vip: 'VIP',
  powerUser: 'Faol',
  loyal: 'Sodiq',
  regular: 'Muntazam',
  casual: 'Tasodifiy',
  new: 'Yangi',
  inactive: 'Faol emas'
};

const SEGMENT_ICONS = {
  vip: '👑',
  powerUser: '⚡',
  loyal: '💙',
  regular: '✅',
  casual: '🎲',
  new: '🌟',
  inactive: '⚠️'
};

const CustomerSegments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: () => getCustomerSegments(180),
    refetchInterval: 300000 // 5 minutes
  });

  const segmentData = data?.data?.data || {};

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !segmentData.segmentDistribution) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Mijoz Segmentlari</h3>
        <p className="text-gray-400 text-sm">Ma'lumotlarni yuklashda xatolik</p>
      </div>
    );
  }

  const chartData = segmentData.segmentDistribution
    .filter(s => s.value > 0)
    .map(s => ({
      name: SEGMENT_NAMES[s.name] || s.name,
      value: s.value,
      color: SEGMENT_COLORS[s.name] || '#9CA3AF',
      totalRevenue: s.totalRevenue,
      avgSpend: s.avgSpend,
      percentage: s.percentage
    }));

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">🎯 Mijoz Segmentlari (7 kategoriya)</h3>
        <span className="text-sm text-gray-400">
          Jami: {segmentData.totalCustomers || 0} mijoz
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value, name, props) => [
                    `${value} mijoz (${props.payload.percentage}%)`,
                    props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">Ma'lumotlar yo'q</p>
          )}
        </div>

        {/* Segment Cards */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SEGMENT_NAMES).map(([key, name]) => {
            const segment = segmentData.segments?.[key] || { count: 0, totalRevenue: 0, avgSpend: 0 };
            const percentage = segmentData.totalCustomers > 0
              ? ((segment.count / segmentData.totalCustomers) * 100).toFixed(1)
              : 0;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-3"
                style={{
                  backgroundColor: `${SEGMENT_COLORS[key]}15`,
                  borderLeft: `3px solid ${SEGMENT_COLORS[key]}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{SEGMENT_ICONS[key]}</span>
                  <span className="text-sm font-medium" style={{ color: SEGMENT_COLORS[key] }}>
                    {name}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-white">{segment.count}</p>
                    <p className="text-xs text-gray-400">{percentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">O'rtacha</p>
                    <p className="text-sm text-gray-300">
                      {(segment.avgSpend || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      {segmentData.summary && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {segmentData.summary.highValueCustomers}
            </p>
            <p className="text-xs text-gray-400">Yuqori qiymatli</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {segmentData.summary.atRiskCustomers}
            </p>
            <p className="text-xs text-gray-400">Xavf ostida</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {segmentData.summary.growthPotential}
            </p>
            <p className="text-xs text-gray-400">O'sish potensiali</p>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-teal-400">
              {segmentData.summary.newCustomers}
            </p>
            <p className="text-xs text-gray-400">Yangi mijozlar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSegments;
