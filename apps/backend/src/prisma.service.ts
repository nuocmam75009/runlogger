import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    console.log('Available models on prisma:', Object.keys(this));
  }

  async onModuleInit() {
    await this.$connect();
  }
}