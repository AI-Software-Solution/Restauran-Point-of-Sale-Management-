import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'framer-motion';

const periods = [
  { key: 'daily', label: 'Bugun' },
  { key: 'weekly', label: 'Hafta' },
  { key: 'monthly', label: 'Oy' },
  { key: 'yearly', label: 'Yil' }
];

const RevenueChart = ({ statistics }) => {
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [chartType, setChartType] = useState('area');

  const getChartData = () => {
    const historyKey = `${activePeriod}RevenueHistory`;
    const labelsKey = `${activePeriod}RevenueLabels`;

    const history = statistics[historyKey] || [];
    const labels = statistics[labelsKey] || [];

    return labels.map((label, index) => ({
      name: label.length > 10 ? label.substring(0, 10) : label,
      revenue: history[index] || 0
    }));
  };

  const getTotalRevenue = () => {
    const revenueKey = `${activePeriod}Revenue`;
    return statistics[revenueKey] || 0;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' so\'m';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-success font-semibold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = getChartData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-surface rounded-xl p-6 border border-border"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Daromad Statistikasi</h3>
          <p className="text-3xl font-bold text-success mt-1">
            {formatCurrency(getTotalRevenue())}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex bg-surface-secondary rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                chartType === 'area'
                  ? 'bg-success/20 text-success'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                chartType === 'bar'
                  ? 'bg-success/20 text-success'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex bg-surface-secondary rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setActivePeriod(period.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  activePeriod === period.key
                    ? 'bg-success/20 text-success'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RevenueChart;
