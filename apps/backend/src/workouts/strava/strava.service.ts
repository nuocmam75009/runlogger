import { Injectable } from '@nestjs/common';

@Injectable()
export class StravaService {
  private readonly STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  private readonly STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
  private readonly REDIRECT_URI = 'http://localhost:3000/api/strava/callback';

  // This would normally be stored in a database
  private accessToken: string | null = null;

  getAuthUrl(): string {
    return `https://www.strava.com/oauth/authorize?client_id=${this.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${this.REDIRECT_URI}&scope=activity:read_all`;
  }

  async exchangeCodeForToken(code: string) {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.STRAVA_CLIENT_ID,
        client_secret: this.STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    return data;
  }

  async getWorkouts() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Strava');
    }

    const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workouts: ${response.statusText}`);
    }

    return response.json();
  }
}