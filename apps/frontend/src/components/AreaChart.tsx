import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Workout } from '@prisma/client';
import { WorkoutType, IntensityLevel, formatWorkoutType, WorkoutStat } from 'shared-types';
import { useSession } from 'next-auth/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { useRouter } from 'next/router';

interface ChartProps {
  userId: string;
  refreshTrigger?: number;
}

type ChartMetric = 'duration' | 'distance' | 'count' | 'elevationGain' | 'calories' | 'heartRate';
type ChartPeriod = 'week' | 'month' | 'year';
type ChartType = 'area' | 'bar' | 'line' | 'pie';

interface PieDataItem {
  name: string;
  value: number;
}

export default function WorkoutAnalysis({ userId, refreshTrigger }: ChartProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [chartData, setChartData] = useState<WorkoutStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<ChartMetric>('duration');
  const [period, setPeriod] = useState<ChartPeriod>('month');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [totalStats, setTotalStats] = useState({
    workouts: 0,
    duration: 0,
    distance: 0,
    elevationGain: 0,
    calories: 0
  });

  // Colors for different workout types
  const colors = {
    running: '#FF5733',
    cycling: '#33A1FF',
    swimming: '#33FF57',
    other: '#A233FF',
    // Additional colors for pie charts
    easy: '#4CAF50',
    moderate: '#FFC107',
    hard: '#FF5722',
    veryHard: '#F44336'
  };

  useEffect(() => {
    if (!userId) return;

    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch workouts");
        }
        const workouts = await response.json();

        // Process workouts into chart data
        processWorkoutsData(workouts);
      } catch (error) {
        console.error("Error fetching workouts for chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId, refreshTrigger, period]);

  const processWorkoutsData = (workouts: any[]) => {
    if (!workouts.length) {
      setChartData([]);
      setTotalStats({
        workouts: 0,
        duration: 0,
        distance: 0,
        elevationGain: 0,
        calories: 0
      });
      return;
    }

    // Calculate total stats
    const totals = {
      workouts: workouts.length,
      duration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      distance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      elevationGain: workouts.reduce((sum, w) => sum + (w.elevationGain || 0), 0),
      calories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    };

    setTotalStats(totals);

    // Sort workouts by date
    workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group workouts by period (week, month, year)
    const groupedData = new Map<string, WorkoutStat>();

    workouts.forEach(workout => {
      const date = new Date(workout.date);
      let periodKey: string;

      if (period === 'week') {
        // Get the week number and year
        const weekNumber = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${weekNumber}`;
      } else if (period === 'month') {
        // Format: YYYY-MM
        periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        // Year only
        periodKey = date.getFullYear().toString();
      }

      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          date: periodKey,
          duration: 0,
          distance: 0,
          count: 0,
          elevationGain: 0,
          calories: 0,
          heartRate: 0,
          runningDuration: 0,
          cyclingDuration: 0,
          swimmingDuration: 0,
          otherDuration: 0,
          runningDistance: 0,
          cyclingDistance: 0,
          swimmingDistance: 0,
          otherDistance: 0
        });
      }

      const stats = groupedData.get(periodKey)!;
      stats.duration += workout.duration || 0;
      stats.distance += workout.distance || 0;
      stats.count += 1;
      stats.elevationGain += workout.elevationGain || 0;
      stats.calories += workout.calories || 0;

      // Calculate average heart rate properly
      if (workout.heartRate) {
        const currentTotal = stats.heartRate * (stats.count - 1);
        stats.heartRate = (currentTotal + workout.heartRate) / stats.count;
      }

      // Group by workout type
      if (workout.type === WorkoutType.RUNNING || workout.type === WorkoutType.TRAIL_RUNNING) {
        stats.runningDuration = (stats.runningDuration || 0) + (workout.duration || 0);
        stats.runningDistance = (stats.runningDistance || 0) + (workout.distance || 0);
      } else if (workout.type === WorkoutType.CYCLING || workout.type === WorkoutType.INDOOR_CYCLING) {
        stats.cyclingDuration = (stats.cyclingDuration || 0) + (workout.duration || 0);
        stats.cyclingDistance = (stats.cyclingDistance || 0) + (workout.distance || 0);
      } else if (workout.type === WorkoutType.SWIMMING) {
        stats.swimmingDuration = (stats.swimmingDuration || 0) + (workout.duration || 0);
        stats.swimmingDistance = (stats.swimmingDistance || 0) + (workout.distance || 0);
      } else {
        stats.otherDuration = (stats.otherDuration || 0) + (workout.duration || 0);
        stats.otherDistance = (stats.otherDistance || 0) + (workout.distance || 0);
      }
    });

    // Convert map to array and sort by date
    const result = Array.from(groupedData.values());
    result.sort((a, b) => a.date.localeCompare(b.date));

    // Format date labels based on period
    result.forEach(item => {
      if (period === 'week') {
        // Format: Week X
        const [year, week] = item.date.split('-W');
        item.date = `W${week}`;
      } else if (period === 'month') {
        // Format: MMM YYYY
        const [year, month] = item.date.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        item.date = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      // Year stays as is
    });

    setChartData(result);
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatYAxis = (value: number): string => {
    if (metric === 'duration') {
      return `${value} min`;
    } else if (metric === 'distance') {
      return `${value.toFixed(1)} km`;
    } else if (metric === 'elevationGain') {
      return `${value} m`;
    } else if (metric === 'calories') {
      return `${value} cal`;
    } else if (metric === 'heartRate') {
      return `${value} bpm`;
    }
    return value.toString();
  };

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;

    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="mb-1 fw-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="mb-0" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {
                metric === 'duration' ? 'min' :
                metric === 'distance' ? 'km' :
                metric === 'elevationGain' ? 'm' :
                metric === 'calories' ? 'cal' :
                metric === 'heartRate' ? 'bpm' : ''
              }
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderChart = () => {
    if (loading) {
      return <div className="text-center py-4">Loading chart data...</div>;
    }

    if (chartData.length === 0) {
      return <div className="text-center py-4">No workout data available</div>;
    }

    if (chartType === 'pie') {
      // For pie charts, we need to transform the data
      const pieData: PieDataItem[] = [];

      if (metric === 'duration') {
        if (chartData.reduce((sum, item) => sum + (item.runningDuration || 0), 0) > 0) {
          pieData.push({ name: 'Running', value: chartData.reduce((sum, item) => sum + (item.runningDuration || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.cyclingDuration || 0), 0) > 0) {
          pieData.push({ name: 'Cycling', value: chartData.reduce((sum, item) => sum + (item.cyclingDuration || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.swimmingDuration || 0), 0) > 0) {
          pieData.push({ name: 'Swimming', value: chartData.reduce((sum, item) => sum + (item.swimmingDuration || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.otherDuration || 0), 0) > 0) {
          pieData.push({ name: 'Other', value: chartData.reduce((sum, item) => sum + (item.otherDuration || 0), 0) });
        }
      } else if (metric === 'distance') {
        if (chartData.reduce((sum, item) => sum + (item.runningDistance || 0), 0) > 0) {
          pieData.push({ name: 'Running', value: chartData.reduce((sum, item) => sum + (item.runningDistance || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.cyclingDistance || 0), 0) > 0) {
          pieData.push({ name: 'Cycling', value: chartData.reduce((sum, item) => sum + (item.cyclingDistance || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.swimmingDistance || 0), 0) > 0) {
          pieData.push({ name: 'Swimming', value: chartData.reduce((sum, item) => sum + (item.swimmingDistance || 0), 0) });
        }
        if (chartData.reduce((sum, item) => sum + (item.otherDistance || 0), 0) > 0) {
          pieData.push({ name: 'Other', value: chartData.reduce((sum, item) => sum + (item.otherDistance || 0), 0) });
        }
      } else {
        // For count, just use the total counts
        pieData.push({ name: 'Workouts', value: totalStats.workouts });
      }

      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => {
                let color;
                if (entry.name === 'Running') color = colors.running;
                else if (entry.name === 'Cycling') color = colors.cycling;
                else if (entry.name === 'Swimming') color = colors.swimming;
                else color = colors.other;

                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <Tooltip formatter={(value: any) => {
              if (metric === 'duration') return [`${value} min`, 'Duration'];
              if (metric === 'distance') return [`${Number(value).toFixed(1)} km`, 'Distance'];
              return [value, ''];
            }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = chartType === 'area' ? AreaChart : chartType === 'bar' ? BarChart : LineChart;
    const DataComponent = chartType === 'area' ? Area : chartType === 'bar' ? Bar : Line;

    return (
      <ResponsiveContainer width="100%" height={220}>
        <ChartComponent
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickMargin={5}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            width={45}
          />
          <Tooltip content={renderTooltip} />
          <Legend wrapperStyle={{ fontSize: '12px', marginTop: '5px' }} />

          {metric === 'duration' ? (
            <>
              <DataComponent
                type="monotone"
                dataKey="runningDuration"
                name="Running"
                stroke={colors.running}
                fill={colors.running}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="cyclingDuration"
                name="Cycling"
                stroke={colors.cycling}
                fill={colors.cycling}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="swimmingDuration"
                name="Swimming"
                stroke={colors.swimming}
                fill={colors.swimming}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="otherDuration"
                name="Other"
                stroke={colors.other}
                fill={colors.other}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
            </>
          ) : metric === 'distance' ? (
            <>
              <DataComponent
                type="monotone"
                dataKey="runningDistance"
                name="Running"
                stroke={colors.running}
                fill={colors.running}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="cyclingDistance"
                name="Cycling"
                stroke={colors.cycling}
                fill={colors.cycling}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="swimmingDistance"
                name="Swimming"
                stroke={colors.swimming}
                fill={colors.swimming}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
              <DataComponent
                type="monotone"
                dataKey="otherDistance"
                name="Other"
                stroke={colors.other}
                fill={colors.other}
                fillOpacity={0.6}
                stackId={chartType === 'area' ? "1" : undefined}
              />
            </>
          ) : (
            <DataComponent
              type="monotone"
              dataKey={metric}
              name={
                metric === 'count' ? 'Workouts' :
                metric === 'elevationGain' ? 'Elevation Gain (m)' :
                metric === 'calories' ? 'Calories Burned' :
                metric === 'heartRate' ? 'Heart Rate (bpm)' : ''
              }
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (!session) {
    router.push('/Login');
    return null;
  }

  return (
    <Container className="py-5">
      <h2>Your workout charts</h2>
      <p>Work in progress: charts of your workouts</p>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 mb-0">Workout Analysis</h3>

        <div className="d-flex gap-2">
          {/* Chart Type Selector */}
          <ButtonGroup size="sm">
            {[
              { name: 'Area', value: 'area' },
              { name: 'Bar', value: 'bar' },
              { name: 'Line', value: 'line' },
              { name: 'Pie', value: 'pie' }
            ].map((type) => (
              <ToggleButton
                key={type.value}
                id={`chart-type-${type.value}`}
                type="radio"
                variant="outline-secondary"
                name="chart-type"
                value={type.value}
                checked={chartType === type.value}
                onChange={(e) => setChartType(e.currentTarget.value as ChartType)}
                size="sm"
              >
                {type.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-3">
        {/* Metric Selector */}
        <ButtonGroup size="sm">
          {[
            { name: 'Duration', value: 'duration' },
            { name: 'Distance', value: 'distance' },
            { name: 'Count', value: 'count' },
            { name: 'Elevation', value: 'elevationGain' },
            { name: 'Calories', value: 'calories' },
            { name: 'Heart Rate', value: 'heartRate' }
          ].map((m) => (
            <ToggleButton
              key={m.value}
              id={`metric-${m.value}`}
              type="radio"
              variant="outline-primary"
              name="metric"
              value={m.value}
              checked={metric === m.value}
              onChange={(e) => setMetric(e.currentTarget.value as ChartMetric)}
              size="sm"
            >
              {m.name}
            </ToggleButton>
          ))}
        </ButtonGroup>

        {/* Period Selector */}
        <ButtonGroup size="sm">
          {[
            { name: 'Weekly', value: 'week' },
            { name: 'Monthly', value: 'month' },
            { name: 'Yearly', value: 'year' }
          ].map((p) => (
            <ToggleButton
              key={p.value}
              id={`period-${p.value}`}
              type="radio"
              variant="outline-secondary"
              name="period"
              value={p.value}
              checked={period === p.value}
              onChange={(e) => setPeriod(e.currentTarget.value as ChartPeriod)}
              size="sm"
            >
              {p.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary d-flex flex-wrap justify-content-between mb-3">
        <div className="stat-item text-center px-2">
          <div className="h4 mb-0">{totalStats.workouts}</div>
          <div className="small text-muted">Workouts</div>
        </div>
        <div className="stat-item text-center px-2">
          <div className="h4 mb-0">{totalStats.duration}</div>
          <div className="small text-muted">Minutes</div>
        </div>
        <div className="stat-item text-center px-2">
          <div className="h4 mb-0">{(totalStats.distance / 1000).toFixed(1)}</div>
          <div className="small text-muted">Kilometers</div>
        </div>
        <div className="stat-item text-center px-2">
          <div className="h4 mb-0">{totalStats.calories.toLocaleString()}</div>
          <div className="small text-muted">Calories</div>
        </div>
      </div>

      {renderChart()}
    </Container>
  );
}