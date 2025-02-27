// Workout types that match the Prisma schema
export enum WorkoutType {
  RUNNING = "RUNNING",
  CYCLING = "CYCLING",
  SWIMMING = "SWIMMING",
  STRENGTH_TRAINING = "STRENGTH_TRAINING",
  YOGA = "YOGA",
  HIKING = "HIKING",
  CROSS_TRAINING = "CROSS_TRAINING",
  SKIING = "SKIING",
  INDOOR_CYCLING = "INDOOR_CYCLING",
  INDOOR_RUNNING = "INDOOR_RUNNING",
  INDOOR_WALKING = "INDOOR_WALKING",
  STAIRMASTER = "STAIRMASTER",
  TRIATHLON = "TRIATHLON",
  TRAIL_RUNNING = "TRAIL_RUNNING",
  KICKBOXING = "KICKBOXING",
  PILATES = "PILATES",
  DANSE = "DANSE",
  OTHER = "OTHER"
}

export enum WorkoutSource {
  STRAVA = "STRAVA",
  NIKE_RUN_CLUB = "NIKE_RUN_CLUB",
  APPLE_HEALTH = "APPLE_HEALTH",
  KIPRUN_PACER = "KIPRUN_PACER",
  GARMIN = "GARMIN",
  COROS = "COROS",
  SUUNTO = "SUUNTO",
  MANUAL = "MANUAL"
}

export enum IntensityLevel {
  EASY = "EASY",
  MODERATE = "MODERATE",
  HARD = "HARD",
  VERY_HARD = "VERY_HARD"
}

// Map Strava workout types to our internal enum types
export const StravaToEnumWorkoutType: { [key: string]: WorkoutType } = {
  Run: WorkoutType.RUNNING,
  WeightTraining: WorkoutType.STRENGTH_TRAINING,
  Ride: WorkoutType.CYCLING,
  VirtualRide: WorkoutType.INDOOR_CYCLING,
  Hike: WorkoutType.HIKING,
  Walk: WorkoutType.INDOOR_WALKING,
  Yoga: WorkoutType.YOGA,
  Swim: WorkoutType.SWIMMING,
  Workout: WorkoutType.STRENGTH_TRAINING,
  Alpine: WorkoutType.SKIING,
  TrailRun: WorkoutType.TRAIL_RUNNING,
  Other: WorkoutType.OTHER,
};

// Normalize workout types for display and filtering
export const normalizeWorkoutType = (type: string): string => {
  // For manual workouts (which use WorkoutType enum)
  if (Object.values(WorkoutType).includes(type as WorkoutType)) {
    return type;
  }

  // For Strava workouts, map to our internal types
  return StravaToEnumWorkoutType[type] || WorkoutType.OTHER;
};

// Format workout type for display
export const formatWorkoutType = (type: string): string => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};