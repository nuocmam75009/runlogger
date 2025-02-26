import { Controller, Get, Post, Body, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  async createWorkout(@Body() data: { userId: string; type: string; duration: number }) {
    try {
      const { userId, type, duration } = data;

      if (!userId || !type || !duration) {
        throw new BadRequestException('Missing required fields');
      }

      return await this.workoutsService.createWorkout(userId, type, Number(duration));
    } catch (error) {
      console.error('Error creating workout:', error);
      throw new InternalServerErrorException('Failed to add workout');
    }
  }

  @Get()
  async getWorkouts(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      return await this.workoutsService.getWorkouts(userId);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw new InternalServerErrorException('Failed to fetch workouts');
    }
  }
}