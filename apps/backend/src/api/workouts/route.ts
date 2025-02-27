import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { WorkoutSource } from '@prisma/client';

// Log available models to debug
console.log('Available models on prisma:', Object.keys(prisma));

export async function POST(req: Request) {
  try {
    const body = await req.json() as any;
    const {
      userId,
      type,
      duration,
      distance,
      gear,
      intensity,
      notes,
      elevationGain,
      heartRate,
      calories,
      averageSpeed,
      maxSpeed,
      cadence,
      power,
      stravaActivityId
    } = body;

    if (!userId || !type || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newWorkout = await prisma.workout.create({
      data: {
        user: { connect: { id: userId } },
        type: type as any,
        duration: Number(duration),
        distance: distance ? Number(distance) : null,
        gear: gear || null,
        intensity: intensity || null,
        notes: notes || null,
        elevationGain: elevationGain ? Number(elevationGain) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        calories: calories ? Number(calories) : null,
        averageSpeed: averageSpeed ? Number(averageSpeed) : null,
        maxSpeed: maxSpeed ? Number(maxSpeed) : null,
        cadence: cadence ? Number(cadence) : null,
        power: power ? Number(power) : null,
        stravaActivityId: stravaActivityId || null,
        source: WorkoutSource.MANUAL,
      }
    });

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
      },
      orderBy: {
        date: 'desc'
      }
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}
