import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const STRAVA_ACCESS_TOKEN = "YOUR_SAVED_ACCESS_TOKEN"; // Retrieve this from your database

  const response = await fetch("https://www.strava.com/api/v3/athlete/activities", {
    headers: { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` },
  });

  const workouts = await response.json();
  return NextResponse.json(workouts);
}
