import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get the authorization code from the query parameters
    const { code, error } = req.query;

    // If there's an error or no code, handle it
    if (error) {
      console.error('Strava auth error:', error);
      return res.redirect('/?error=strava_auth_denied');
    }

    if (!code) {
      console.error('No code received from Strava');
      return res.redirect('/?error=no_code');
    }

    // Forward the code to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/workouts/strava/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error exchanging code for token:', await response.text());
      return res.redirect('/?error=token_exchange');
    }

    // Successfully authenticated
    return res.redirect('/?strava=connected');
  } catch (error) {
    console.error('Error in Strava callback:', error);
    return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
}