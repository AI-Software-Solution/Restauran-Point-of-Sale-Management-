import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { getCustomerAnalytics } from '../../../https';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const CustomerMetrics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-analytics'],
    queryFn: () => getCustomerAnalytics(90)
  });

  const analytics = data?.data?.data || {};

  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const customerData = [
    { name: 'Yangi', value: analytics.totalCustomers - analytics.repeatCustomers || 0 },
    { name: 'Qaytib kelgan', value: analytics.repeatCustomers - analytics.loyalCustomers || 0 },
    { name: 'Sodiq', value: analytics.loyalCustomers || 0 }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-6">👥 Mijozlar tahlili</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0a0a0a] rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-blue-400">{analytics.totalCustomers || 0}</p>
            <p className="text-gray-400 text-sm mt-1">Jami mijozlar</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0a0a0a] rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-green-400">{analytics.repeatRate || 0}%</p>
            <p className="text-gray-400 text-sm mt-1">Qaytish foizi</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0a0a0a] rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-yellow-400">
              {(analytics.avgOrderValue || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm mt-1">O'rtacha check</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-[#0a0a0a] rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-bold text-purple-400">
              {(analytics.customerLifetimeValue || 0).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm mt-1">LTV</p>
          </motion.div>
        </div>

        {/* Customer Distribution Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          {customerData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {customerData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-gray-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Ma'lumotlar yo'q</p>
          )}
        </div>
      </div>

      {/* Top Customers */}
      {analytics.topCustomers && analytics.topCustomers.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Top Mijozlar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.topCustomers.slice(0, 5).map((customer, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="bg-[#0a0a0a] rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-gray-700/50 text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-300 truncate">{customer.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{customer.visits} tashrif</span>
                  <span className="text-green-400">{customer.totalSpent.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium">💡 Tavsiya</p>
          <p className="text-gray-300 text-xs mt-1">
            {parseFloat(analytics.repeatRate) < 30
              ? 'Qaytish foizi past. Loyalty dasturini ishga tushiring.'
              : parseFloat(analytics.repeatRate) < 50
                ? 'Yaxshi! Chegirmalar bilan yanada oshiring.'
                : 'Ajoyib! Mijozlar sodiq.'}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 text-sm font-medium">📊 LTV</p>
          <p className="text-gray-300 text-xs mt-1">
            Har bir mijoz o'rtacha {(analytics.customerLifetimeValue || 0).toLocaleString()} so'm daromad keltiradi.
          </p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-purple-400 text-sm font-medium">🎯 Maqsad</p>
          <p className="text-gray-300 text-xs mt-1">
            O'rtacha checkni {Math.round((analytics.avgOrderValue || 0) * 1.2).toLocaleString()} so'mga oshiring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerMetrics;
