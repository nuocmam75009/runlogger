import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface PieChartPlotProps {
  data: { name: string; value: number }[];
}
