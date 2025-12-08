import React from 'react';

const HeatmapChart = ({ data = [] }) => {
  // Create hours array
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Find max value for intensity calculation
  const maxValue = Math.max(...data, 1);

  // Get intensity color
  const getColor = (value) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-gray-800';
    if (intensity < 0.2) return 'bg-blue-900/30';
    if (intensity < 0.4) return 'bg-blue-700/50';
    if (intensity < 0.6) return 'bg-blue-500/70';
    if (intensity < 0.8) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  // Group hours into morning, afternoon, evening, night
  const timeGroups = [
    { label: 'Tun', hours: [0, 1, 2, 3, 4, 5] },
    { label: 'Ertalab', hours: [6, 7, 8, 9, 10, 11] },
    { label: 'Kunduzi', hours: [12, 13, 14, 15, 16, 17] },
    { label: 'Kechqurun', hours: [18, 19, 20, 21, 22, 23] }
  ];

  return (
    <div>
      {/* Heatmap Grid */}
      <div className="grid grid-cols-6 gap-1 mb-4">
        {hours.map((hour) => (
          <div
            key={hour}
            className={`aspect-square rounded-md ${getColor(data[hour] || 0)}
              flex items-center justify-center text-xs cursor-pointer
              hover:ring-2 hover:ring-blue-500 transition-all`}
            title={`${hour}:00 - ${data[hour] || 0} buyurtma`}
          >
            <span className="text-white/60">{hour}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>Kam</span>
        <div className="flex gap-0.5">
          <div className="w-4 h-4 rounded bg-gray-800"></div>
          <div className="w-4 h-4 rounded bg-blue-900/30"></div>
          <div className="w-4 h-4 rounded bg-blue-700/50"></div>
          <div className="w-4 h-4 rounded bg-blue-500/70"></div>
          <div className="w-4 h-4 rounded bg-blue-400"></div>
          <div className="w-4 h-4 rounded bg-blue-300"></div>
        </div>
        <span>Ko'p</span>
      </div>

      {/* Time Groups Summary */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {timeGroups.map((group) => {
          const total = group.hours.reduce((sum, h) => sum + (data[h] || 0), 0);
          return (
            <div key={group.label} className="bg-[#0a0a0a] rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs">{group.label}</p>
              <p className="text-white font-medium mt-1">{total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapChart;
