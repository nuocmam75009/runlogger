import React, { useState, useEffect } from 'react';
import { Workout } from '@prisma/client';

interface WorkoutListProps {
  userId: string;
}

interface StravaWorkout {
  id: string;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  total_elevation_gain: number;
  average_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  average_cadence: number;
  average_watts: number;
  max_watts: number;
  average_temp: number;
}

interface CombinedWorkout {
  id: string;
  title: string;
  type: string;
  duration: number;
  date: Date;
  source: 'manual' | 'strava';
  distance?: number;
  elevationGain?: number;
  additionalData?: any;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  backendUrl?: string;
  error?: string;
  possibleSolutions?: string[];
}

//  todo: Link to Enum WorkoutSource
type SourceFilter = 'all' | 'manual' | 'strava' | 'nike_run_club' | 'apple_health' | 'kiprun_pacer' | 'garmin' | 'coros' | 'suunto';

const WorkoutList: React.FC<WorkoutListProps> = ({ userId }) => {
  const [manualWorkouts, setManualWorkouts] = useState<Workout[]>([]);
  const [stravaWorkouts, setStravaWorkouts] = useState<StravaWorkout[]>([]);
  const [combinedWorkouts, setCombinedWorkouts] = useState<CombinedWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<CombinedWorkout[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [loading, setLoading] = useState(true);
  const [stravaLoading, setStravaLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Fetch manual workouts
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        const data = await response.json();
        setManualWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId]);

  // Fetch Strava workouts
  useEffect(() => {
    const fetchStravaWorkouts = async () => {
      try {
        setStravaLoading(true);
        setStravaError(null);

        console.log('Fetching Strava workouts...');
        const response = await fetch('/api/strava/workouts');

        if (response.status === 401) {
          // Not authenticated with Strava
          setStravaConnected(false);
          setStravaError('Not authenticated with Strava');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Strava API error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch Strava workouts');
        }

        const data = await response.json();
        console.log('Strava workouts received:', data);
        setStravaWorkouts(data);
        setStravaConnected(true);
      } catch (error) {
        console.error('Error fetching Strava workouts:', error);
        setStravaConnected(false);
        setStravaError(error.message || 'Failed to fetch Strava workouts');

        // Test backend connection when Strava fetch fails
        testBackendConnection();
      } finally {
        setStravaLoading(false);
      }
    };

    fetchStravaWorkouts();
  }, [userId]);

  // Combine workouts when either source changes
  useEffect(() => {
    const combined: CombinedWorkout[] = [
      // Map manual workouts
      ...manualWorkouts.map(workout => ({
        id: workout.id,
        title: workout.type,
        type: workout.type,
        duration: workout.duration,
        date: new Date(workout.date),
        source: 'manual' as const,
      })),

      ...stravaWorkouts.map(workout => ({
        id: workout.id,
        title: workout.name,
        type: workout.type,
        duration: Math.round(workout.moving_time / 60),
        date: new Date(workout.start_date),
        source: 'strava' as const,
        distance: workout.distance,
        elevationGain: workout.total_elevation_gain,
        additionalData: {
          averageHeartRate: workout.average_heartrate,
          maxHeartRate: workout.max_heartrate,
          averageCadence: workout.average_cadence,
          averageWatts: workout.average_watts,
          maxWatts: workout.max_watts,
          averageTemp: workout.average_temp,
        }
      }))
    ];

    // Sort by date, newest first
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    setCombinedWorkouts(combined);
  }, [manualWorkouts, stravaWorkouts]);

  // Apply source filter when combinedWorkouts or sourceFilter changes
  useEffect(() => {
    if (sourceFilter === 'all') {
      setFilteredWorkouts(combinedWorkouts);
    } else {
      setFilteredWorkouts(combinedWorkouts.filter(workout => workout.source === sourceFilter));
    }
  }, [combinedWorkouts, sourceFilter]);

  const testBackendConnection = async () => {
    try {
      setTestingConnection(true);
      const response = await fetch('/api/strava/test-connection');
      const data = await response.json();
      setConnectionTest(data);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: 'Connection test failed',
        error: error.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const connectStrava = () => {
    window.location.href = '/api/strava/auth';
  };

  if (loading && stravaLoading) {
    return <div>Loading workouts...</div>;
  }

  return (
    <div>
      <h2>Your Workouts</h2>

      {/* Strava connection prompt if not connected */}
      {!stravaConnected && (
        <div className="alert alert-info mb-4">
          <p>Connect your Strava account to see all your workouts in one place.</p>
          <button className="btn btn-primary" onClick={connectStrava}>
            Connect Strava
          </button>
        </div>
      )}

      {/* Source filter */}
      <div className="mb-4">
        <div className="btn-group" role="group" aria-label="Filter workouts by source">
          <button
            type="button"
            className={`btn ${sourceFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSourceFilter('all')}
          >
            All Sources
          </button>
          <button
            type="button"
            className={`btn ${sourceFilter === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSourceFilter('manual')}
          >
            Manual Only
          </button>
          <button
            type="button"
            className={`btn ${sourceFilter === 'strava' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSourceFilter('strava')}
            disabled={!stravaConnected}
          >
            Strava Only
          </button>
        </div>
      </div>

      {/* Combined workouts list */}
      {filteredWorkouts.length === 0 ? (
        <p>No workouts found with the selected filter. {sourceFilter !== 'all' && <button className="btn btn-link p-0" onClick={() => setSourceFilter('all')}>Show all workouts</button>}</p>
      ) : (
        <ul className="list-group">
          {filteredWorkouts.map((workout) => (
            <li key={workout.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {/* Source badge */}
                  <div className="mb-2">
                    {workout.source === 'strava' ? (
                      <span className="badge bg-orange text-white me-2" style={{ backgroundColor: '#FC4C02' }}>
                        Strava
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white me-2">
                        Added Manually
                      </span>
                    )}
                    <span className="text-muted small">
                      {workout.date.toLocaleDateString()} {workout.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Workout title */}
                  <h5 className="mb-1">{workout.title}</h5>

                  {/* Basic workout info */}
                  <p className="mb-0">Type: {workout.type}</p>
                  <p className="mb-0">Duration: {workout.duration} minutes</p>

                  {/* Strava-specific data */}
                  {workout.source === 'strava' && (
                    <div className="mt-2">
                      {workout.distance && (
                        <p className="mb-0">Distance: {(workout.distance / 1000).toFixed(2)} km</p>
                      )}
                      {workout.elevationGain && workout.elevationGain > 0 && (
                        <p className="mb-0">Elevation Gain: {workout.elevationGain} m</p>
                      )}
                      {workout.additionalData?.averageHeartRate && (
                        <p className="mb-0">Heart Rate: {Math.round(workout.additionalData.averageHeartRate)} bpm</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Error display */}
      {stravaError && (
        <div className="alert alert-warning mt-4">
          <p>Error connecting to Strava: {stravaError}</p>
          <button
            className="btn btn-outline-primary mt-2"
            onClick={testBackendConnection}
            disabled={testingConnection}
          >
            {testingConnection ? 'Testing Connection...' : 'Test Backend Connection'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutList;

