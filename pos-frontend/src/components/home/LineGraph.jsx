// components/LineGraph.js
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const LineGraph = ({ data, timeRange }) => {
  const formattedData = data.map((value, index) => ({
    name: `${timeRange} ${index + 1}`,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#02ca3a" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineGraph;
