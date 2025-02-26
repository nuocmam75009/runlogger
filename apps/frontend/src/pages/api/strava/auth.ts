import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Redirect to the backend Strava auth endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const authUrl = `${backendUrl}/api/workouts/strava/auth`;

    return res.redirect(authUrl);
  } catch (error) {
    console.error('Error redirecting to Strava auth:', error);
    return res.status(500).json({ error: 'Failed to redirect to Strava authentication' });
  }
}