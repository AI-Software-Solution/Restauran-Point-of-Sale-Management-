import { useEffect, useState } from "react";
import { getStatistic } from "../../https";
import { motion } from "framer-motion";
import { RevenueChart, CategoryPieChart, StatsCards, TopProducts } from "./charts";

const Metrics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getStatistic();
        setStatistics(data);
      } catch {
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Statistika yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-6 md:px-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="font-bold text-2xl text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">
            Real vaqtda restoran statistikasi
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Jonli yangilanmoqda</span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards statistics={statistics} />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart statistics={statistics} />
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-1">
          <CategoryPieChart categoryStats={statistics?.categoryStats} />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <TopProducts topProducts={statistics?.topProducts} />

        {/* Quick Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#262626] rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Qisqa Ma'lumot</h3>

          <div className="space-y-4">
            {/* Monthly Target */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Oylik Maqsad</span>
                <span className="text-green-400 text-sm font-medium">
                  {statistics?.monthlyRevenue && statistics.monthlyRevenue > 50000000 ? '100%' :
                   `${Math.round((statistics?.monthlyRevenue || 0) / 50000000 * 100)}%`}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (statistics?.monthlyRevenue || 0) / 50000000 * 100)}%`
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {new Intl.NumberFormat('uz-UZ').format(statistics?.monthlyRevenue || 0)} / 50,000,000 so'm
              </p>
            </div>

            {/* Orders Completion */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Bajarilgan Buyurtmalar</span>
                <span className="text-blue-400 text-sm font-medium">
                  {statistics?.totalOrders > 0
                    ? `${Math.round(((statistics.totalOrders - statistics.activeOrders) / statistics.totalOrders) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: statistics?.totalOrders > 0
                      ? `${((statistics.totalOrders - statistics.activeOrders) / statistics.totalOrders) * 100}%`
                      : '0%'
                  }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {(statistics?.totalOrders || 0) - (statistics?.activeOrders || 0)} ta yakunlangan / {statistics?.totalOrders || 0} ta jami
              </p>
            </div>

            {/* Table Occupancy */}
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Stollar Bandligi</span>
                <span className="text-purple-400 text-sm font-medium">
                  {statistics?.activeOrders && statistics?.totalTable
                    ? `${Math.min(100, Math.round((statistics.activeOrders / statistics.totalTable) * 100))}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: statistics?.activeOrders && statistics?.totalTable
                      ? `${Math.min(100, (statistics.activeOrders / statistics.totalTable) * 100)}%`
                      : '0%'
                  }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                ~{statistics?.activeOrders || 0} ta band / {statistics?.totalTable || 0} ta jami stol
              </p>
            </div>
          </div>

          {/* Total Revenue Summary */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Umumiy Daromad</p>
              <p className="text-3xl font-bold text-white mt-1">
                {new Intl.NumberFormat('uz-UZ').format(statistics?.totalRevenue || 0)}
                <span className="text-lg text-gray-400 ml-1">so'm</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Metrics;
