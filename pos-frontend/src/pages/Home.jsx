import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import { getStatistic } from "../https";

const Home = () => {
  const [statistics, setStatistics] = useState({ totalEarnings: 0, activeOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getStatistic();
        setStatistics(data);
      } catch (error) {
        setStatistics({ totalEarnings: 0, activeOrders: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard title="Total Earnings" icon={<BsCashCoin />} number={statistics.totalRevenue} loading={loading} />
          <MiniCard title="In Progress" icon={<GrInProgress />} number={statistics.activeOrders} loading={loading} />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <BottomNav />
    </section>
  );
};

export default Home;