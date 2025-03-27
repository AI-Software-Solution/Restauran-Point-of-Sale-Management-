import React, { useEffect, useState } from "react";
import { getStatistic } from "../../https";
import { motion } from "framer-motion";

const Metrics = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getStatistic();

        const formattedStatistics = Object.entries(data).map(([key, value]) => ({
          title: key.replace(/([A-Z])/g, " $1").trim(),
          value,
          color: "#262626", // Dashboard'ga mos qoramtir fon
          isIncrease: true,
          percentage: "N/A",
        }));

        setStatistics(formattedStatistics);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStatistics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <p className="text-center text-white">Loading statistics...</p>;
  }

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">Overall Performance</h2>
          <p className="text-sm text-[#ababab]">Here's an overview of the key statistics.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {statistics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="shadow-lg rounded-lg p-4 border border-gray-700"
            style={{ backgroundColor: metric.color }}
          >
            <div className="flex justify-between items-center">
              <p className="font-medium text-xs text-[#f5f5f5]">{metric.title}</p>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" fill="none"
                  style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}>
                  <path d={metric.isIncrease ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                <p className="font-medium text-xs text-[#f5f5f5]">{metric.percentage}</p>
              </div>
            </div>
            <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">{metric.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;