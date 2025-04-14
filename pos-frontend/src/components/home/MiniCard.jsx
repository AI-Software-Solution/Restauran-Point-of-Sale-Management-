import React, { useState, useEffect } from 'react';
import { getStatistic } from '../../https/index';
import LineGraph from './LineGraph'; // o'zingga mos yo'lni tekshir

const MiniCard = ({ title, icon, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [statData, setStatData] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const stats = await getStatistic();
      let value = 0;
      let history = [];

      switch (title) {
        case 'Total Earnings':
          switch (timeRange) {
            case 'daily':
              value = stats.dailyRevenue;
              history = stats.dailyRevenueHistory || [0];
              break;
            case 'weekly':
              value = stats.weeklyRevenue;
              history = stats.weeklyRevenueHistory || [0];
              break;
            case 'monthly':
              value = stats.monthlyRevenue;
              history = stats.monthlyRevenueHistory || [0];
              break;
            case 'yearly':
              value = stats.yearlyRevenue;
              history = stats.yearlyRevenueHistory || [0];
              break;
            default:
              value = 0;
          }
          break;

        case 'In Progress':
        case 'Active Orders':
          value = stats.activeOrders || 0;
          break;

        default:
          value = 0;
      }

      setStatData(value);
      setChartData(history);
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const handleClick = () => {
    if (title === "Total Earnings") {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        className={`bg-[#1a1a1a] py-6 px-6 rounded-2xl w-full cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg ${title === "Total Earnings" ? "hover:border-[#02ca3a]" : "hover:border-[#f6b100]"} border border-transparent flex flex-col h-full`}
      >
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide mb-1'>{title}</h1>
            <h2 className='text-[#f5f5f5] text-3xl md:text-4xl font-bold'>
              {loading || isLoading ? "Loading..." : title === "Total Earnings" ? `${statData} UZS` : statData}
            </h2>
          </div>
          <button
            onClick={handleClick}
            className={`p-4 rounded-xl text-[#f5f5f5] text-2xl ${title === "Total Earnings" ? "bg-[#02ca3a]" : "bg-[#f6b100]"
              }`}
          >
            {icon}
          </button>
        </div>

        {title === 'Total Earnings' && (
          <div className="relative mt-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[#222] text-white px-4 py-2 rounded-md w-full cursor-pointer border border-[#333] focus:ring-2 focus:ring-[#02ca3a] transition duration-300"
            >
              <option value="daily" className="hover:bg-[#02ca3a] text-white font-semibold">Last Day</option>
              <option value="weekly" className="hover:bg-[#02ca3a] text-white font-semibold">Last Week</option>
              <option value="monthly" className="hover:bg-[#02ca3a] text-white font-semibold">Last Month</option>
              <option value="yearly" className="hover:bg-[#02ca3a] text-white font-semibold">Last Year</option>
            </select>
            {/* Selectning pastga tushuvchi ikonasi */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#f5f5f5]">
              ▼
            </div>
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn'>
          <div className='bg-[#1a1a1a] w-[90%] md:w-[60%] p-5 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-white text-xl font-semibold'>📊 {timeRange.toUpperCase()} Revenue</h2>
              <button onClick={() => setShowModal(false)} className='text-white text-2xl'>&times;</button>
            </div>

            {isLoading ? (
              <p className='text-white text-center mt-5'>Loading...</p>
            ) : (
              <>
                <h1 className='text-[#02ca3a] text-4xl font-bold text-center mb-5'>
                  {statData} UZS
                </h1>
                <LineGraph data={chartData} timeRange={timeRange} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MiniCard;
