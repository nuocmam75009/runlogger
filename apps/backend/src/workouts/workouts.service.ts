import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  async createWorkout(userId: string, type: string, duration: number) {
    return this.prisma.workout.create({
      data: {
        user: { connect: { id: userId } },
        type: type as any,
        duration: duration
      }
    });
  }

  async getWorkouts(userId: string) {
    return this.prisma.workout.findMany({
      where: {
        user: { id: userId }
      }
    });
  }
}