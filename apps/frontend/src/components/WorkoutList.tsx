import React, { useState, useEffect } from 'react';
import { Workout } from '@prisma/client';

interface WorkoutListProps {
  userId: string;
}

interface StravaWorkout {
    // rajouter ça dans schema prisma pour BDD
  id: string;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  total_elevation_gain: number;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  backendUrl?: string;
  error?: string;
  possibleSolutions?: string[];
}

const WorkoutList: React.FC<WorkoutListProps> = ({ userId }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stravaWorkouts, setStravaWorkouts] = useState<StravaWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [stravaLoading, setStravaLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchWorkouts();
    fetchStravaWorkouts();
  }, [userId]);

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

      {/* Regular workouts */}
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <div className="mb-4">
          <h3>Manual Workouts</h3>
          <ul className="list-group">
            {workouts.map((workout) => (
              <li key={workout.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{workout.type}</strong>
                    <p className="mb-0">Duration: {workout.duration} minutes</p>
                    <small>{new Date(workout.date).toLocaleDateString()}</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strava workouts */}
      <div className="mt-4">
        <h3>Strava Workouts</h3>

        {/* Connection test results */}
        {connectionTest && (
          <div className={`alert ${connectionTest.success ? 'alert-success' : 'alert-danger'} mb-3`}>
            <h5>{connectionTest.message}</h5>
            {connectionTest.backendUrl && (
              <p>Backend URL: {connectionTest.backendUrl}</p>
            )}
            {connectionTest.error && (
              <p>Error: {connectionTest.error}</p>
            )}
            {connectionTest.possibleSolutions && (
              <>
                <p className="mb-1">Possible solutions:</p>
                <ul>
                  {connectionTest.possibleSolutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {stravaError && (
          <div className="alert alert-warning">
            <p>Error connecting to Strava: {stravaError}</p>
            <p className="mb-0">This could be due to:</p>
            <ul>
              <li>Backend server not running (should be on port 3001)</li>
              <li>Missing Strava API credentials in backend</li>
              <li>Not authenticated with Strava</li>
            </ul>
            <button
              className="btn btn-outline-primary mt-2"
              onClick={testBackendConnection}
              disabled={testingConnection}
            >
              {testingConnection ? 'Testing Connection...' : 'Test Backend Connection'}
            </button>
          </div>
        )}

        {!stravaConnected ? (
          <div className="alert alert-info">
            <p>Connect your Strava account to see your workouts here.</p>
            <button className="btn btn-primary" onClick={connectStrava}>
              Connect Strava
            </button>
          </div>
        ) : stravaLoading ? (
          <p>Loading Strava workouts...</p>
        ) : stravaWorkouts.length === 0 ? (
          <p>No Strava workouts found.</p>
        ) : (
          <ul className="list-group">
            {stravaWorkouts.map((workout) => (
              <li key={workout.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{workout.name}</strong>
                    <p className="mb-0">Type: {workout.type}</p>
                    <p className="mb-0">Duration: {Math.round(workout.moving_time / 60)} minutes</p>
                    <p className="mb-0">Distance: {(workout.distance / 1000).toFixed(2)} km</p>
                    {workout.total_elevation_gain > 0 && (
                      <p className="mb-0">Elevation Gain: {workout.total_elevation_gain} m</p>
                    )}
                    <small>{new Date(workout.start_date).toLocaleDateString()}</small>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WorkoutList;

