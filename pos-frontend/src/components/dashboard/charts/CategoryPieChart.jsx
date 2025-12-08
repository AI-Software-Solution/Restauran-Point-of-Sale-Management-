import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const CategoryPieChart = ({ categoryStats = [] }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' so\'m';
  };

  const totalRevenue = categoryStats.reduce((sum, cat) => sum + (cat.revenue || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-green-400">{formatCurrency(data.revenue)}</p>
          <p className="text-gray-400 text-sm">{percentage}% dan</p>
          <p className="text-gray-400 text-sm">{data.orderCount} ta buyurtma</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show empty state if no data
  if (!categoryStats || categoryStats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#262626] rounded-xl p-6 border border-gray-700"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Kategoriyalar bo'yicha</h3>
          <p className="text-gray-400 text-sm">Sotuv ulushi kategoriyalar kesimida</p>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-gray-500">Hali sotuv ma'lumotlari yo'q</p>
        </div>
      </motion.div>
    );
  }

  const chartData = categoryStats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#262626] rounded-xl p-6 border border-gray-700"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Kategoriyalar bo'yicha</h3>
        <p className="text-gray-400 text-sm">Sotuv ulushi kategoriyalar kesimida</p>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="revenue"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats below chart */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.slice(0, 4).map((cat, index) => (
          <div key={index} className="bg-[#1a1a1a] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-gray-400 text-xs truncate">{cat.name}</span>
            </div>
            <p className="text-white font-semibold text-sm mt-1">
              {formatCurrency(cat.revenue)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryPieChart;
