import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp, FiActivity, FiTarget, FiZap, FiClock,
  FiDollarSign, FiShoppingBag, FiBarChart2, FiPieChart,
  FiCalendar, FiRefreshCw, FiArrowUp, FiArrowDown,
  FiStar, FiAlertCircle, FiUsers
} from 'react-icons/fi';
import {
  getSalesAnalytics,
  getSalesForecast,
  getDemandAnalysis,
  getProductRecommendations,
  getCustomerInsights,
  getRealTimeAnalytics
} from '../../https';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
  </div>
);

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    document.title = "POS | Analytics";
  }, []);

  const tabs = [
    { id: 'realtime', label: 'Real-time', icon: FiZap },
    { id: 'sales', label: 'Sotuvlar', icon: FiBarChart2 },
    { id: 'forecast', label: 'Prognoz', icon: FiTrendingUp },
    { id: 'demand', label: 'Talab', icon: FiTarget },
    { id: 'recommendations', label: 'Tavsiyalar', icon: FiStar },
  ];

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Analytics</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Real vaqtda tahlil va bashoratlar
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <FiRefreshCw size={16} className="mr-2" />
            Yangilash
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${refreshKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'realtime' && <RealTimeTab />}
            {activeTab === 'sales' && <SalesTab />}
            {activeTab === 'forecast' && <ForecastTab />}
            {activeTab === 'demand' && <DemandTab />}
            {activeTab === 'recommendations' && <RecommendationsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, live }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 relative overflow-hidden"
  >
    {live && (
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs text-[var(--color-text-secondary)]">LIVE</span>
      </div>
    )}
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {change >= 0 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
            {Math.abs(change).toFixed(1)}% kechagidan
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </motion.div>
);

// Summary Card Component
const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3 mb-2">
      <Icon className={color || 'text-[var(--color-primary)]'} size={20} />
      <span className="text-sm text-[var(--color-text-secondary)]">{title}</span>
    </div>
    <p className={`text-2xl font-bold ${color || 'text-[var(--color-text)]'}`}>{value}</p>
  </Card>
);

// Comparison Row Component
const ComparisonRow = ({ label, today, yesterday, format }) => {
  const diff = yesterday > 0 ? ((today - yesterday) / yesterday * 100) : 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <div className="text-right">
        <span className="font-bold text-[var(--color-text)]">
          {format === 'currency' ? `${(today || 0).toLocaleString()} so'm` : today || 0}
        </span>
        <div className={`text-xs flex items-center gap-1 justify-end ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {diff >= 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
          {Math.abs(diff).toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

// ==================== REAL-TIME TAB ====================
const RealTimeTab = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['realTimeAnalytics'],
    queryFn: getRealTimeAnalytics,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return <LoadingSpinner />;

  const realTime = data?.data?.realTime || {};
  const comparison = data?.data?.comparison || {};
  const hourlyToday = data?.data?.hourlyToday || [];

  return (
    <div className="space-y-6">
      {/* Live Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bugungi Daromad"
          value={`${(realTime.todayRevenue || 0).toLocaleString()} so'm`}
          change={comparison.revenueChange}
          icon={FiDollarSign}
          color="bg-emerald-500"
        />
        <StatCard
          title="Bugungi Buyurtmalar"
          value={realTime.todayOrders || 0}
          change={comparison.ordersChange}
          icon={FiShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Faol Buyurtmalar"
          value={realTime.activeOrders || 0}
          icon={FiActivity}
          color="bg-orange-500"
          live
        />
        <StatCard
          title="Band Stollar"
          value={realTime.activeTables || 0}
          icon={FiUsers}
          color="bg-purple-500"
          live
        />
      </div>

      {/* Hourly Chart */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Bugungi Soatlik Buyurtmalar</h3>
        <div className="flex items-end gap-1 h-48">
          {hourlyToday.map((h, idx) => {
            const maxOrders = Math.max(...hourlyToday.map(x => x.orders), 1);
            const height = (h.orders / maxOrders) * 100;
            const isCurrentHour = idx === new Date().getHours();
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                <div
                  className={`w-full rounded-t transition-all ${
                    isCurrentHour
                      ? 'bg-emerald-500'
                      : 'bg-[var(--color-primary)]/60 hover:bg-[var(--color-primary)]'
                  }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <span className="text-xs text-[var(--color-text-secondary)] mt-1">{h.hour}</span>
                <div className="absolute -top-8 bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded text-xs text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  {h.orders} buyurtma
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Kechagi Taqqoslash</h3>
          <div className="space-y-2">
            <ComparisonRow
              label="Daromad"
              today={realTime.todayRevenue}
              yesterday={comparison.yesterdayRevenue}
              format="currency"
            />
            <ComparisonRow
              label="Buyurtmalar"
              today={realTime.todayOrders}
              yesterday={comparison.yesterdayOrders}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">O'rtacha Ko'rsatkichlar</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">O'rtacha buyurtma</span>
              <span className="font-bold text-[var(--color-text)]">
                {(realTime.averageOrderValue || 0).toLocaleString()} so'm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">Bugungi mahsulotlar</span>
              <span className="font-bold text-[var(--color-text)]">{realTime.todayItems || 0} ta</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== SALES TAB ====================
const SalesTab = () => {
  const [groupBy, setGroupBy] = useState('day');

  const { data, isLoading } = useQuery({
    queryKey: ['salesAnalytics', groupBy],
    queryFn: () => getSalesAnalytics({ groupBy }),
  });

  if (isLoading) return <LoadingSpinner />;

  const summary = data?.data?.summary || {};
  const salesByPeriod = data?.data?.salesByPeriod || [];
  const weekdayDistribution = data?.data?.weekdayDistribution || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Jami Daromad" value={`${summary.totalRevenue?.toLocaleString()} so'm`} icon={FiDollarSign} color="text-emerald-500" />
        <SummaryCard title="Jami Buyurtmalar" value={summary.totalOrders} icon={FiShoppingBag} color="text-blue-500" />
        <SummaryCard title="O'rtacha Buyurtma" value={`${Math.round(summary.averageOrderValue || 0).toLocaleString()} so'm`} icon={FiBarChart2} color="text-purple-500" />
        <SummaryCard
          title="O'sish"
          value={`${summary.growthRate >= 0 ? '+' : ''}${summary.growthRate?.toFixed(1)}%`}
          icon={summary.growthRate >= 0 ? FiArrowUp : FiArrowDown}
          color={summary.growthRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}
        />
      </div>

      {/* Group By Selector */}
      <div className="flex gap-2">
        {[
          { value: 'day', label: 'Kunlik' },
          { value: 'week', label: 'Haftalik' },
          { value: 'month', label: 'Oylik' },
        ].map(g => (
          <Button
            key={g.value}
            variant={groupBy === g.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setGroupBy(g.value)}
          >
            {g.label}
          </Button>
        ))}
      </div>

      {/* Sales Chart */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Sotuvlar Dinamikasi</h3>
        <div className="flex items-end gap-2 h-64 overflow-x-auto">
          {salesByPeriod.map((s, idx) => {
            const maxRevenue = Math.max(...salesByPeriod.map(x => x.revenue), 1);
            const height = (s.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex flex-col items-center min-w-[60px]">
                <div className="text-xs text-[var(--color-text-secondary)] mb-1">{s.revenue?.toLocaleString()}</div>
                <div
                  className="w-12 bg-[var(--color-primary)] rounded-t"
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
                <span className="text-xs text-[var(--color-text-secondary)] mt-2 whitespace-nowrap">{s.period?.slice(-5)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekday Distribution */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Hafta Kunlari Bo'yicha</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekdayDistribution.map((d, idx) => {
            const maxOrders = Math.max(...weekdayDistribution.map(x => x.orders), 1);
            const intensity = (d.orders / maxOrders);
            return (
              <div key={idx} className="text-center">
                <div
                  className="h-24 rounded-lg flex items-end justify-center transition-all"
                  style={{ backgroundColor: `rgba(113, 75, 103, ${0.2 + intensity * 0.8})` }}
                >
                  <span className="text-white text-sm font-bold pb-2">{d.orders}</span>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] mt-2 block">{d.day?.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ==================== FORECAST TAB ====================
const ForecastTab = () => {
  const [days, setDays] = useState(7);

  const { data, isLoading } = useQuery({
    queryKey: ['salesForecast', days],
    queryFn: () => getSalesForecast(days),
  });

  if (isLoading) return <LoadingSpinner />;

  const forecast = data?.data?.forecast || [];
  const weekdayPatterns = data?.data?.weekdayPatterns || [];
  const trendInfo = data?.data?.trendInfo || {};

  return (
    <div className="space-y-6">
      {/* Trend Info */}
      <Card className="p-5 bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-primary)]/30 rounded-lg">
            <FiTrendingUp className="text-[var(--color-primary)]" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Trend Tahlili</h3>
            <p className="text-[var(--color-text-secondary)]">
              Sotuv trendi: <span className="text-[var(--color-primary)] font-medium">{trendInfo.direction}</span>,
              Kuch: <span className="text-blue-500 font-medium">{trendInfo.strength}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Days Selector */}
      <div className="flex gap-2">
        {[7, 14, 30].map(d => (
          <Button
            key={d}
            variant={days === d ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDays(d)}
          >
            {d} kun
          </Button>
        ))}
      </div>

      {/* Forecast Chart */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Sotuv Prognozi</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {forecast.map((f, idx) => (
              <div key={idx} className="bg-[var(--color-background)] rounded-lg p-4 min-w-[140px]">
                <div className="text-[var(--color-text-secondary)] text-sm">{f.weekday}</div>
                <div className="text-[var(--color-text)] text-xs">{f.date}</div>
                <div className="mt-3">
                  <div className="text-[var(--color-primary)] font-bold text-lg">
                    {f.predictedRevenue?.toLocaleString()} so'm
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm">~{f.predictedOrders} buyurtma</div>
                </div>
                <Badge
                  variant={
                    f.confidence === 'yuqori' ? 'success' :
                    f.confidence === "o'rtacha" ? 'warning' : 'danger'
                  }
                  className="mt-2"
                >
                  {f.confidence} ishonch
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Weekday Patterns */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Hafta Kunlari Naqshlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekdayPatterns.map((p, idx) => (
            <div key={idx} className="bg-[var(--color-background)] rounded-lg p-4 text-center">
              <div className="text-[var(--color-text-secondary)] text-sm mb-2">{p.weekday}</div>
              <div className="text-[var(--color-text)] font-bold">{p.avgRevenue?.toLocaleString()}</div>
              <div className="text-xs text-[var(--color-text-secondary)]">so'm/kun</div>
              <div className="text-xs text-[var(--color-primary)] mt-1">~{p.avgOrders} buyurtma</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ==================== DEMAND TAB ====================
const DemandTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['demandAnalysis'],
    queryFn: () => getDemandAnalysis({}),
  });

  if (isLoading) return <LoadingSpinner />;

  const peakHours = data?.data?.peakHours || [];
  const topProducts = data?.data?.topProducts || [];
  const lowDemandProducts = data?.data?.lowDemandProducts || [];
  const insights = data?.data?.insights || [];

  return (
    <div className="space-y-6">
      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <Card
              key={idx}
              className={`p-4 flex items-start gap-3 ${
                insight.priority === 'high' ? 'bg-rose-500/10 border-rose-500/30' :
                insight.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <FiAlertCircle className={
                insight.priority === 'high' ? 'text-rose-500' :
                insight.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
              } />
              <p className="text-[var(--color-text)]">{insight.message}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Peak Hours & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Eng Band Soatlar</h3>
          <div className="space-y-3">
            {peakHours.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
                <div className="flex items-center gap-3">
                  <FiClock className="text-orange-500" />
                  <span className="text-[var(--color-text)]">{h.hour}</span>
                </div>
                <span className="text-orange-500 font-bold">{h.demand} ta</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Top Mahsulotlar</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
                <div>
                  <span className="text-[var(--color-text)]">{p.name}</span>
                  <span className="text-xs text-[var(--color-text-secondary)] ml-2">{p.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-emerald-500 font-bold">{p.quantity} ta</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">{p.revenue?.toLocaleString()} so'm</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Demand Products */}
      {lowDemandProducts.length > 0 && (
        <Card className="p-5">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Past Talab Mahsulotlar</h3>
          <div className="flex flex-wrap gap-2">
            {lowDemandProducts.map((p, idx) => (
              <Badge key={idx} variant="danger">
                {p.name} ({p.quantity} ta)
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ==================== RECOMMENDATIONS TAB ====================
const RecommendationsTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['productRecommendations'],
    queryFn: () => getProductRecommendations(),
  });

  if (isLoading) return <LoadingSpinner />;

  const recommendations = data?.data?.recommendations || [];
  const bestSellers = data?.data?.bestSellers || [];

  return (
    <div className="space-y-6">
      {/* Popular Combinations */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Ko'p Birgalikda Buyuriladigan Mahsulotlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.slice(0, 6).map((r, idx) => (
            <div key={idx} className="bg-[var(--color-background)] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <span>{r.products?.[0]}</span>
                <span className="text-[var(--color-primary)]">+</span>
                <span>{r.products?.[1]}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">{r.count} marta birgalikda</span>
                <span className="text-[var(--color-primary)]">{r.support?.toFixed(1)}% support</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Best Sellers */}
      <Card className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Eng Ko'p Sotilganlar</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {bestSellers.map((b, idx) => {
            const rankColors = {
              0: 'bg-yellow-500',
              1: 'bg-gray-400',
              2: 'bg-amber-600'
            };
            return (
              <div key={idx} className="bg-[var(--color-background)] rounded-lg p-4 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto ${rankColors[idx] || 'bg-[var(--color-primary)]'}`}>
                  {idx + 1}
                </div>
                <div className="text-[var(--color-text)] mt-3 font-medium">{b.name}</div>
                <div className="text-[var(--color-primary)] text-sm mt-1">{b.orderCount} buyurtma</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
