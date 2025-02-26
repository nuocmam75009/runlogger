import { Controller, Get, Query, Redirect, InternalServerErrorException } from '@nestjs/common';
import { StravaService } from './strava.service';

@Controller('workouts/strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Get('auth')
  @Redirect()
  getAuthUrl() {
    try {
      const authUrl = this.stravaService.getAuthUrl();
      return { url: authUrl };
    } catch (error) {
      console.error('Error generating Strava auth URL:', error);
      throw new InternalServerErrorException('Failed to generate Strava auth URL');
    }
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('error') error: string) {
    if (error) {
      console.error('Strava auth error:', error);
      throw new InternalServerErrorException('Strava authentication denied');
    }

    if (!code) {
      throw new InternalServerErrorException('No code received from Strava');
    }

    try {
      return await this.stravaService.exchangeCodeForToken(code);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new InternalServerErrorException('Failed to exchange code for token');
    }
  }

  @Get('workouts')
  async getWorkouts() {
    try {
      return await this.stravaService.getWorkouts();
    } catch (error) {
      console.error('Error fetching Strava workouts:', error);
      throw new InternalServerErrorException('Failed to fetch Strava workouts');
    }
  }
}