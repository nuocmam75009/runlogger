export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RunLogger Backend API</h1>
      <p>This is the backend server for the RunLogger application.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><code>/api/workouts</code> - Manage workouts</li>
        <li><code>/api/workouts/strava/auth</code> - Strava authentication</li>
        <li><code>/api/workouts/strava/callback</code> - Strava OAuth callback</li>
        <li><code>/api/workouts/strava/workouts</code> - Fetch Strava workouts</li>
        <li><code>/api/health-check</code> - Server health check</li>
      </ul>
      <p>The API is running and ready to accept requests.</p>
    </div>
  );
}