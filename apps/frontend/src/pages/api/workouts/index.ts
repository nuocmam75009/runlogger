import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle POST request (create workout)
  if (req.method === 'POST') {
    try {
      const { userId, type, duration } = req.body;

      if (!userId || !type || !duration) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newWorkout = await prisma.workout.create({
        data: {
          user: { connect: { id: userId } },
          type: type,
          duration: Number(duration)
        }
      });

      return res.status(201).json(newWorkout);
    } catch (error) {
      console.error("Error creating workout:", error);
      return res.status(500).json({ error: "Failed to add workout" });
    }
  }

  // Handle GET request (fetch workouts)
  else if (req.method === 'GET') {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const workouts = await prisma.workout.findMany({
        where: {
          user: { id: userId }
        }
      });

      return res.status(200).json(workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      return res.status(500).json({ error: "Failed to fetch workouts" });
    }
  }

  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}