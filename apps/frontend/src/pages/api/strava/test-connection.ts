import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get the backend URL from environment variables or use default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    // Log the URL we're trying to connect to
    console.log(`Testing connection to backend at: ${backendUrl}`);

    // Try to connect with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${backendUrl}/api/health-check`, {
        method: 'GET',
        signal: controller.signal
      }).catch(error => {
        if (error.name === 'AbortError') {
          throw new Error('Connection timed out after 5 seconds');
        }
        throw error;
      });

      clearTimeout(timeoutId);

      // Return success with connection details
      return res.status(200).json({
        success: true,
        message: 'Successfully connected to backend',
        backendUrl,
        status: response.status,
        statusText: response.statusText
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Return detailed error information
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to backend server',
      error: error.message,
      errorName: error.name,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      possibleSolutions: [
        'Make sure your backend server is running',
        'Check if the backend URL is correct (currently using: ' + (process.env.BACKEND_URL || 'http://localhost:3001') + ')',
        'Verify there are no network issues or firewalls blocking the connection',
        'If running in Docker, ensure proper network configuration between containers'
      ]
    });
  }
}