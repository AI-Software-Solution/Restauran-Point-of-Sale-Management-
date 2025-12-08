import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const TopProducts = ({ topProducts = [] }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' so\'m';
  };

  // Show empty state if no data
  if (!topProducts || topProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#262626] rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Eng Ko'p Sotilgan</h3>
            <p className="text-gray-400 text-sm">Top 5 mahsulot</p>
          </div>
          <div className="bg-green-500/10 p-2 rounded-lg">
            <FiTrendingUp className="w-5 h-5 text-green-400" />
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-gray-500">Hali sotuvlar yo'q</p>
        </div>
      </motion.div>
    );
  }

  const products = topProducts;

  const maxQuantity = Math.max(...products.map(p => p.quantity));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-green-400">{formatCurrency(data.revenue)}</p>
          <p className="text-gray-400 text-sm">{data.quantity} ta sotildi</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#262626] rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Eng Ko'p Sotilgan</h3>
          <p className="text-gray-400 text-sm">Top 5 mahsulot</p>
        </div>
        <div className="bg-green-500/10 p-2 rounded-lg">
          <FiTrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[200px] w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={products}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar
              dataKey="quantity"
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {products.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: COLORS[index % COLORS.length] + '30' }}
              >
                {index === 0 ? (
                  <FiAward className="w-4 h-4" style={{ color: COLORS[index] }} />
                ) : (
                  <span style={{ color: COLORS[index] }}>{index + 1}</span>
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-gray-500 text-xs">{product.quantity} ta sotildi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm font-semibold">
                {formatCurrency(product.revenue)}
              </p>
              {/* Progress relative to top */}
              <div className="w-16 h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(product.quantity / maxQuantity) * 100}%`,
                    backgroundColor: COLORS[index]
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopProducts;
