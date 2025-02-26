import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { PrismaClient, Prisma } from '@prisma/client';

// Log available models to debug
console.log('Available models on prisma:', Object.keys(prisma));

export async function POST(req: Request) {
  try {
    const { userId, type, duration } = await req.json();

    if (!userId || !type || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create with correct field structure
    const data: Prisma.WorkoutCreateInput = {
      user: { connect: { id: userId } },
      type: type as any,
      duration: duration
    };

    const newWorkout = await prisma.workout.create({ data });

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Failed to add workout" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const workouts = await prisma.workout.findMany({
      where: {
        user: { id: userId }
      }
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}
