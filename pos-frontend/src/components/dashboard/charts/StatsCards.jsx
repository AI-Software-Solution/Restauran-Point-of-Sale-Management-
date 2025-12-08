import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiPackage,
  FiGrid,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';

const StatsCards = ({ statistics }) => {
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M so\'m';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K so\'m';
    }
    return value?.toLocaleString() + ' so\'m';
  };

  const stats = [
    {
      title: 'Kunlik Daromad',
      value: formatCurrency(statistics?.dailyRevenue || 0),
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Haftalik Daromad',
      value: formatCurrency(statistics?.weeklyRevenue || 0),
      icon: FiTrendingUp,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      change: '+8.2%',
      isPositive: true
    },
    {
      title: 'Jami Buyurtmalar',
      value: statistics?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      change: '+15.3%',
      isPositive: true
    },
    {
      title: 'Faol Buyurtmalar',
      value: statistics?.activeOrders || 0,
      icon: FiClock,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400',
      change: 'Hozir',
      isPositive: true
    },
    {
      title: 'Mahsulotlar',
      value: statistics?.totalProducts || 0,
      icon: FiPackage,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-400'
    },
    {
      title: 'Kategoriyalar',
      value: statistics?.totalCategories || 0,
      icon: FiGrid,
      color: 'from-cyan-500 to-teal-600',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Stollar',
      value: statistics?.totalTable || 0,
      icon: FiCheckCircle,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Foydalanuvchilar',
      value: statistics?.totalUsers || 0,
      icon: FiUsers,
      color: 'from-indigo-500 to-violet-600',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="bg-surface rounded-xl p-4 border border-border hover:border-primary-500/50 transition-all cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            {stat.change && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                stat.isPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              }`}>
                {stat.change}
              </span>
            )}
          </div>

          <div className="mt-3">
            <p className="text-text-secondary text-xs font-medium">{stat.title}</p>
            <p className="text-text-primary text-xl font-bold mt-1">{stat.value}</p>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (index + 1) * 12 + 20)}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
