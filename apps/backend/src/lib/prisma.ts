import { PrismaClient } from '@prisma/client';
import path from 'path';

// Force console output with prominent markers
console.log('\n\n==== PRISMA INITIALIZATION STARTING ====');

// Use an absolute path to the schema in the backend directory
const schemaPath = path.resolve(__dirname, '../../../schema.prisma');
console.log('🔍 Looking for Prisma schema at:', schemaPath);

// Check if file exists
try {
  const fs = require('fs');
  const exists = fs.existsSync(schemaPath);
  console.log(`📁 Schema file exists: ${exists}`);

  if (exists) {
    const content = fs.readFileSync(schemaPath, 'utf8');
    console.log(`📄 Schema file first 100 chars: ${content.substring(0, 100)}...`);
  }
} catch (error) {
  console.error('❌ Error checking schema file:', error);
}

// Use PrismaClient with global caching to prevent multiple instances during hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma Client
let prisma: PrismaClient;

try {
  console.log('🔄 Initializing Prisma client...');
  prisma = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  // Save PrismaClient on the global object in development
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }

  // Log available models to debug
  console.log('📊 Available Prisma models:', Object.keys(prisma));
  console.log('✅ Prisma client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  throw error;
}

console.log('==== PRISMA INITIALIZATION COMPLETE ====\n\n');

export { prisma };
