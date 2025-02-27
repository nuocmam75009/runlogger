import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ButtonGroup, ToggleButton, Form } from 'react-bootstrap';
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
type DateFilter = 'week' | 'month' | 'year' | 'all';

interface PieDataItem {
  name: string;
  value: number;
}

interface WorkoutData {
  id: string;
  type: string;
  duration: number;
  distance?: number | null;
  date: Date;
  heartRate?: number | null;
  elevationGain?: number | null;
  calories?: number | null;
}

interface ChartDataPoint {
  date: string;
  heartRate?: number;
  distance?: number;
  originalHeartRate?: number | null;
  originalDistance?: number | null;
}

const WorkoutAnalysis: React.FC<ChartProps> = ({ userId, refreshTrigger }) => {
    const { data: session } = useSession();
    const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<'heartRate' | 'distance'>('heartRate');
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
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

  // Fetch workouts
  useEffect(() => {
    if (!userId) return;

    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch workouts");
        }
        const data = await response.json();

        console.log("Raw API response:", data); // Debug the raw API response

        // Transform and sort workouts by date
        const transformedWorkouts = data.map((workout: any) => ({
          id: workout.id,
          type: workout.type,
          duration: workout.duration,
          distance: typeof workout.distance === 'number' ? workout.distance : null,
          date: new Date(workout.date),
          heartRate: typeof workout.heartRate === 'number' ? workout.heartRate : null,
          elevationGain: typeof workout.elevationGain === 'number' ? workout.elevationGain : null,
          calories: typeof workout.calories === 'number' ? workout.calories : null
        }));

        // Calculate total stats
        const totals = {
          workouts: transformedWorkouts.length,
          duration: transformedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
          distance: transformedWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
          elevationGain: transformedWorkouts.reduce((sum, w) => sum + (w.elevationGain || 0), 0),
          calories: transformedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0)
        };
        setTotalStats(totals);

        console.log("Transformed workouts:", transformedWorkouts); // Debug transformed data

        // Sort by date (oldest first for charts)
        transformedWorkouts.sort((a: WorkoutData, b: WorkoutData) =>
          a.date.getTime() - b.date.getTime()
        );

        setWorkouts(transformedWorkouts);

        // Extract unique workout types
        const types = Array.from(
          new Set(transformedWorkouts.map((w: WorkoutData) => w.type))
        ) as string[];
        setAvailableTypes(types);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId, refreshTrigger]);

  // Apply date filter to workouts
  const getFilteredByDateWorkouts = (workouts: WorkoutData[]): WorkoutData[] => {
    if (dateFilter === 'all') return workouts;

    const now = new Date();
    let cutoffDate = new Date();

    switch (dateFilter) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return workouts.filter(workout => workout.date >= cutoffDate);
  };

  // Process data for charts when filters change
  useEffect(() => {
    if (!workouts.length) {
      console.log("No workouts available for chart data");
      return;
    }

    // Apply date filter
    let dateFilteredWorkouts = getFilteredByDateWorkouts(workouts);

    // Filter workouts by selected type
    let filteredWorkouts = dateFilteredWorkouts;
    if (selectedType !== "all") {
      filteredWorkouts = dateFilteredWorkouts.filter(workout => workout.type === selectedType);
    }

    // Limit number of data points for performance
    const MAX_DATA_POINTS = 50;
    if (filteredWorkouts.length > MAX_DATA_POINTS) {
      // For large datasets, sample or aggregate data
      const step = Math.ceil(filteredWorkouts.length / MAX_DATA_POINTS);
      filteredWorkouts = filteredWorkouts.filter((_, index) => index % step === 0);
    }

    // For demonstration purposes, generate some sample data if real data is missing
    const formattedData = filteredWorkouts.map((workout) => {
      // Generate sample heart rate data (between 120-180 bpm) if missing
      const sampleHeartRate = workout.heartRate || (120 + Math.floor(Math.random() * 60));

      // Generate sample distance data (between 3-10 km) if missing
      const sampleDistance = workout.distance ? workout.distance / 1000 : (3 + Math.random() * 7);

      // Format date based on the date filter
      let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      if (dateFilter === 'year') {
        dateFormat = { month: 'short', year: '2-digit' };
      }

      return {
        date: workout.date.toLocaleDateString('en-US', dateFormat),
        heartRate: sampleHeartRate,
        distance: sampleDistance,
        // Include the original values for reference
        originalHeartRate: workout.heartRate,
        originalDistance: workout.distance
      };
    });

    setChartData(formattedData);
  }, [workouts, selectedType, dateFilter]);

  const renderHeartRateChart = () => {
    if (chartData.length === 0) {
      return <div className="text-center py-4">No workout data available for the selected period</div>;
    }

    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={chartData.length > 20 ? Math.floor(chartData.length / 10) : 0}
            />
            <YAxis
              label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip formatter={(value) => [`${value} bpm`, 'Heart Rate']} />
            <Legend />
            <Line
              type="monotone"
              dataKey="heartRate"
              name="Heart Rate"
              stroke="#ff5733"
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={chartData.length > 15 ? false : { r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {chartData.some(d => !d.originalHeartRate) && (
          <div className="text-center text-muted small mt-2">
            <i>Note: Sample heart rate data is shown where actual data is missing</i>
          </div>
        )}
      </>
    );
  };

  const renderDistanceChart = () => {
    if (chartData.length === 0) {
      return <div className="text-center py-4">No workout data available for the selected period</div>;
    }

    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={chartData.length > 20 ? Math.floor(chartData.length / 10) : 0}
            />
            <YAxis
              label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip formatter={(value) => [`${value} km`, 'Distance']} />
            <Legend />
            <Area
              type="monotone"
              dataKey="distance"
              name="Distance"
              stroke="#33a1ff"
              fill="#33a1ff"
              fillOpacity={0.3}
            />
                </AreaChart>
            </ResponsiveContainer>
        {chartData.some(d => !d.originalDistance) && (
          <div className="text-center text-muted small mt-2">
            <i>Note: Sample distance data is shown where actual data is missing</i>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading workout data...</div>;
  }

  return (
    <Container fluid className="p-0">
      <h4 className="mb-3">Endurance Analysis</h4>

      <Row className="mb-3">
        <Col xs={12} md={4} className="mb-2 mb-md-0">
          <Form.Group>
            <Form.Label>Filter by Workout Type</Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Workout Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {formatWorkoutType(type)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} md={4} className="mb-2 mb-md-0">
          <Form.Group>
            <Form.Label>Time Period</Form.Label>
            <ButtonGroup className="d-flex">
              <ToggleButton
                id="date-filter-week"
                type="radio"
                variant="outline-secondary"
                name="date-filter"
                value="week"
                checked={dateFilter === 'week'}
                onChange={() => setDateFilter('week')}
                size="sm"
              >
                Week
              </ToggleButton>
              <ToggleButton
                id="date-filter-month"
                type="radio"
                variant="outline-secondary"
                name="date-filter"
                value="month"
                checked={dateFilter === 'month'}
                onChange={() => setDateFilter('month')}
                size="sm"
              >
                Month
              </ToggleButton>
              <ToggleButton
                id="date-filter-year"
                type="radio"
                variant="outline-secondary"
                name="date-filter"
                value="year"
                checked={dateFilter === 'year'}
                onChange={() => setDateFilter('year')}
                size="sm"
              >
                Year
              </ToggleButton>
              <ToggleButton
                id="date-filter-all"
                type="radio"
                variant="outline-secondary"
                name="date-filter"
                value="all"
                checked={dateFilter === 'all'}
                onChange={() => setDateFilter('all')}
                size="sm"
              >
                All
              </ToggleButton>
            </ButtonGroup>
          </Form.Group>
        </Col>

        <Col xs={12} md={4}>
          <Form.Label>Chart Type</Form.Label>
          <div>
            <ButtonGroup>
              <ToggleButton
                id="chart-type-heartrate"
                type="radio"
                variant="outline-primary"
                name="chart-type"
                value="heartRate"
                checked={chartType === 'heartRate'}
                onChange={() => setChartType('heartRate')}
              >
                Heart Rate
              </ToggleButton>
              <ToggleButton
                id="chart-type-distance"
                type="radio"
                variant="outline-primary"
                name="chart-type"
                value="distance"
                checked={chartType === 'distance'}
                onChange={() => setChartType('distance')}
              >
                Distance
              </ToggleButton>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          {chartType === 'heartRate' ? renderHeartRateChart() : renderDistanceChart()}
        </Card.Body>
      </Card>

      {workouts.length > 0 && (
        <div className="text-muted small">
          Showing data for {chartData.length} workouts
          {selectedType !== "all" && ` (filtered to ${formatWorkoutType(selectedType)})`}
          {dateFilter !== "all" && ` from the past ${dateFilter}`}
        </div>
      )}
    </Container>
  );
};

export default WorkoutAnalysis;