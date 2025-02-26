import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { PrismaService } from '../prisma.service';
import { StravaController } from './strava/strava.controller';
import { StravaService } from './strava/strava.service';

@Module({
  controllers: [WorkoutsController, StravaController],
  providers: [WorkoutsService, StravaService, PrismaService],
})
export class WorkoutsModule {}