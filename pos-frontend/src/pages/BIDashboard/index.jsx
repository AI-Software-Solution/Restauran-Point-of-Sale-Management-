import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Components
import KPICard from './components/KPICard';
import InsightsPanel from './components/InsightsPanel';
import ForecastChart from './components/ForecastChart';
import HeatmapChart from './components/HeatmapChart';
import TopProductsTable from './components/TopProductsTable';
import CustomerMetrics from './components/CustomerMetrics';
import CustomerSegments from './components/CustomerSegments';
import ChurnRiskPanel from './components/ChurnRiskPanel';
import RetentionStrategies from './components/RetentionStrategies';

// API
import { getAIDashboard, getAIInsights, getSalesPatterns } from '../../https';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const BIDashboard = () => {
  const [period, setPeriod] = useState('30');

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: getAIDashboard,
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch AI insights
  const { data: insightsData } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: getAIInsights,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch patterns
  const { data: patternsData } = useQuery({
    queryKey: ['sales-patterns', period],
    queryFn: () => getSalesPatterns(period)
  });

  const dashboard = dashboardData?.data?.data || {};
  const insights = insightsData?.data?.data || {};
  const patterns = patternsData?.data?.data || {};

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-info bg-clip-text text-transparent">
              AI Business Intelligence
            </h1>
            <p className="text-text-secondary mt-1">Real-time tahlil va prognozlar</p>
          </div>
          <div className="flex gap-2">
            {['7', '30', '90'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  period === p
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                {p} kun
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <KPICard
          title="Bugungi daromad"
          value={dashboard.today?.revenue || 0}
          format="currency"
          icon="💰"
          trend={dashboard.weekly?.growth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(dashboard.weekly?.growth || 0)}%`}
        />
        <KPICard
          title="Buyurtmalar"
          value={dashboard.today?.orders || 0}
          icon="📦"
          subtitle={`O'rtacha: ${(dashboard.today?.avgOrderValue || 0).toLocaleString()} so'm`}
        />
        <KPICard
          title="Haftalik daromad"
          value={dashboard.weekly?.revenue || 0}
          format="currency"
          icon="📈"
          trend={dashboard.weekly?.growth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(dashboard.weekly?.growth || 0)}%`}
        />
        <KPICard
          title="AI Prognoz (7 kun)"
          value={dashboard.forecast?.nextWeekRevenue || 0}
          format="currency"
          icon="🤖"
          subtitle={`Ishonchlilik: ${((dashboard.forecast?.confidence || 0) * 100).toFixed(0)}%`}
        />
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Daromad dinamikasi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboard.charts?.dailyRevenue || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#714B67" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#714B67" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tickFormatter={(date) => new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
              />
              <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                formatter={(value) => [`${value.toLocaleString()} so'm`, 'Daromad']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#714B67"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InsightsPanel insights={insights.insights || []} />
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Forecast Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-2xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">7 kunlik prognoz</h3>
          <ForecastChart forecast={dashboard.forecast} />
        </motion.div>

        {/* Hourly Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Soatlik faollik</h3>
          <HeatmapChart data={dashboard.charts?.hourlyDistribution || []} />
        </motion.div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <TopProductsTable />
        </motion.div>

        {/* Peak Hours/Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-surface rounded-2xl p-6 border border-border"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Eng band vaqtlar</h3>
          <div className="space-y-4">
            <div>
              <p className="text-text-secondary text-sm mb-2">Soatlar</p>
              <div className="flex flex-wrap gap-2">
                {(dashboard.patterns?.peakHours || []).map((hour) => (
                  <span
                    key={hour}
                    className="px-3 py-1 bg-info/20 text-info rounded-full text-sm"
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-2">Kunlar</p>
              <div className="flex flex-wrap gap-2">
                {(dashboard.patterns?.peakDays || []).map((day, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-success/20 text-success rounded-full text-sm"
                  >
                    {day.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {dashboard.alerts?.lowStock?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-danger/10 border border-danger/30 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-danger mb-4">Kam qolgan mahsulotlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.alerts.lowStock.map((item, idx) => (
              <div key={idx} className="bg-surface rounded-lg p-4 border border-border">
                <p className="font-medium text-text-primary">{item.name}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-danger">Qoldi: {item.currentStock}</span>
                  <span className="text-text-muted">Min: {item.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Customer Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <CustomerMetrics />
      </motion.div>

      {/* Customer Segments - 7 Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-8"
      >
        <CustomerSegments />
      </motion.div>

      {/* Churn Risk & Retention Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <ChurnRiskPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <RetentionStrategies />
        </motion.div>
      </div>
    </div>
  );
};

export default BIDashboard;
