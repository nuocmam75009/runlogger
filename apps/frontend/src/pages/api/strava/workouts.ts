import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Forward the request to the backend Strava API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const stravaEndpoint = `${backendUrl}/api/workouts/strava/workouts`;

    console.log(`Attempting to fetch Strava workouts from: ${stravaEndpoint}`);

    const response = await fetch(stravaEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Log response status for debugging
    console.log(`Strava API response status: ${response.status}`);

    // If the backend returns an error, try to get more details
    if (!response.ok) {
      let errorMessage = 'Failed to fetch Strava workouts';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('Strava API error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response from Strava API');
      }

      return res.status(response.status).json({
        error: errorMessage,
        statusCode: response.status,
        endpoint: stravaEndpoint
      });
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length || 0} Strava workouts`);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Strava workouts:', error);
    return res.status(500).json({
      error: `Failed to fetch Strava workouts: ${error.message}`,
      details: error.toString()
    });
  }
}