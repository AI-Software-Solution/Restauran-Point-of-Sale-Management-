import React from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const ForecastChart = ({ forecast }) => {
  if (!forecast || !forecast.dailyPredictions) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-400">
        Prognoz ma'lumotlari yo'q
      </div>
    );
  }

  // Generate forecast data with dates
  const today = new Date();
  const data = forecast.dailyPredictions.map((value, idx) => {
    const date = new Date(today);
    date.setDate(date.getDate() + idx + 1);
    return {
      date: date.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' }),
      predicted: value,
      confidence: forecast.confidence * 100
    };
  });

  // Calculate average for reference line
  const avgValue = data.reduce((sum, d) => sum + d.predicted, 0) / data.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">
          Jami: <span className="text-white font-medium">
            {forecast.nextWeekRevenue?.toLocaleString() || 0} so'm
          </span>
        </div>
        <div className="text-sm">
          <span className={`px-2 py-1 rounded-full ${
            forecast.confidence > 0.7
              ? 'bg-green-500/20 text-green-400'
              : forecast.confidence > 0.5
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {(forecast.confidence * 100).toFixed(0)}% ishonchlilik
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            formatter={(value) => [`${value.toLocaleString()} so'm`, 'Prognoz']}
          />
          <ReferenceLine
            y={avgValue}
            stroke="#666"
            strokeDasharray="5 5"
            label={{ value: 'O\'rtacha', fill: '#666', fontSize: 10 }}
          />
          <Bar dataKey="predicted" fill="url(#colorForecast)" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500 text-center">
        * Prognoz tarixiy ma'lumotlar va AI model asosida hisoblangan
      </div>
    </div>
  );
};

export default ForecastChart;
