import React, { useState, useEffect } from "react";
import { Workout as PrismaWorkout } from "@prisma/client";
import {
  WorkoutType,
  WorkoutSource,
  IntensityLevel,
  StravaToEnumWorkoutType,
  normalizeWorkoutType,
  formatWorkoutType
} from "shared-types";
import { Pagination } from "react-bootstrap";

// Extend the Prisma Workout type to ensure it has all the properties we need
interface Workout extends PrismaWorkout {
  distance?: number | null;
  gear?: string | null;
  intensity?: string | null;
}

interface WorkoutListProps {
  userId: string;
  refreshTrigger?: number;
}

interface StravaWorkout {
  id: string;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  total_elevation_gain: number;
  average_speed: number;
  average_heartrate: number;
  max_heartrate: number;
  average_cadence: number;
  average_watts: number;
  max_watts: number;
  average_temp: number;
}

interface CombinedWorkout {
  id: string;
  title: string;
  type: string;
  normalizedType: string;
  duration: number;
  date: Date;
  source: WorkoutSource;
  distance?: number;
  elevationGain?: number;
  gear?: string | null;
  intensity?: string | null;
  additionalData?: any;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  backendUrl?: string;
  error?: string;
  possibleSolutions?: string[];
}

// Update SourceFilter to use WorkoutSource enum values
type SourceFilter = "all" | WorkoutSource;

// Time filter options
type TimeFilter = "all" | "week" | "month" | "year";

const WorkoutList: React.FC<WorkoutListProps> = ({ userId, refreshTrigger }) => {
  const [manualWorkouts, setManualWorkouts] = useState<Workout[]>([]);
  const [stravaWorkouts, setStravaWorkouts] = useState<StravaWorkout[]>([]);
  const [combinedWorkouts, setCombinedWorkouts] = useState<CombinedWorkout[]>(
    []
  );
  const [filteredWorkouts, setFilteredWorkouts] = useState<CombinedWorkout[]>(
    []
  );
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stravaLoading, setStravaLoading] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] =
    useState<ConnectionTestResult | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [workoutsPerPage] = useState(10);
  const [paginatedWorkouts, setPaginatedWorkouts] = useState<CombinedWorkout[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch workouts");
        }
        const data = await response.json();
        setManualWorkouts(data as Workout[]);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    const fetchStravaWorkouts = async () => {
      try {
        setStravaLoading(true);
        setStravaError(null);

        console.log("Fetching Strava workouts...");
        const response = await fetch("/api/strava/workouts");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch Strava workouts");
        }

        const data = await response.json();

        const transformedWorkouts = data.map((workout: any) => ({
          id: workout.id,
          title: workout.name,
          type: StravaToEnumWorkoutType[workout.type] || WorkoutType.OTHER,
          duration: Math.round(workout.moving_time / 60),
          date: new Date(workout.start_date),
          source: "strava",
          distance: workout.distance,
          elevationGain: workout.total_elevation_gain,
          additionalData: {
            averageHeartRate: workout.average_heartrate,
            maxHeartRate: workout.max_heartrate,
            averageCadence: workout.average_cadence,
            averageWatts: workout.average_watts,
            maxWatts: workout.max_watts,
            averageTemp: workout.average_temp,
          },
        }));

        setStravaWorkouts(transformedWorkouts);

        if (response.status === 401) {
          // Not authenticated with Strava
          setStravaConnected(false);
          setStravaError("Not authenticated with Strava");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Strava API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch Strava workouts");
        }

        //const data = await response.json();
        console.log("Strava workouts received:", data);
        setStravaWorkouts(data);
        setStravaConnected(true);
      } catch (error) {
        console.error("Error fetching Strava workouts:", error);
        setStravaConnected(false);
        setStravaError(error.message || "Failed to fetch Strava workouts");

        // Test backend connection when Strava fetch fails
        testBackendConnection();
      } finally {
        setStravaLoading(false);
      }
    };

    fetchStravaWorkouts();
  }, [userId, refreshTrigger]);

  // Combine workouts when either source changes
  useEffect(() => {
    const combined: CombinedWorkout[] = [
      // Map manual workouts
      ...manualWorkouts.map((workout) => ({
        id: workout.id,
        title: formatWorkoutType(workout.type),
        type: workout.type,
        normalizedType: workout.type, // Already in our enum format
        duration: workout.duration,
        date: new Date(workout.date),
        source: WorkoutSource.MANUAL,
        distance: workout.distance || undefined,
        gear: workout.gear || undefined,
        intensity: workout.intensity || undefined,
      })),

      ...stravaWorkouts.map((workout) => ({
        id: workout.id,
        title: workout.name,
        type: workout.type,
        normalizedType: normalizeWorkoutType(workout.type),
        duration: Math.round(workout.moving_time / 60),
        date: new Date(workout.start_date),
        source: WorkoutSource.STRAVA,
        distance: workout.distance,
        elevationGain: workout.total_elevation_gain,
        additionalData: {
          averageHeartRate: workout.average_heartrate,
          maxHeartRate: workout.max_heartrate,
          averageCadence: workout.average_cadence,
          averageWatts: workout.average_watts,
          maxWatts: workout.max_watts,
          averageTemp: workout.average_temp,
        },
      })),
    ];

    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    setCombinedWorkouts(combined);

    // Extract all unique normalized workout types for filtering
    const types = Array.from(new Set(combined.map(workout => workout.normalizedType)));
    setAvailableTypes(types);
  }, [manualWorkouts, stravaWorkouts]);

  // Apply filters (source, type, and time)
  useEffect(() => {
    // Apply both source and type filters
    let filtered = combinedWorkouts;

    // Apply source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((workout) => workout.source === sourceFilter);
    }


    if (typeFilter !== "all") {
      filtered = filtered.filter((workout) => workout.normalizedType === typeFilter);
    }


    if (timeFilter !== "all") {
      const now = new Date();
      let startDate = new Date();

      if (timeFilter === "week") {

        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "month") {

        startDate.setDate(now.getDate() - 30);
      } else if (timeFilter === "year") {

        startDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter((workout) => workout.date >= startDate);
    }

    setFilteredWorkouts(filtered);


    setCurrentPage(1);
  }, [combinedWorkouts, sourceFilter, typeFilter, timeFilter]);


  useEffect(() => {
    const indexOfLastWorkout = currentPage * workoutsPerPage;
    const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
    const currentWorkouts = filteredWorkouts.slice(indexOfFirstWorkout, indexOfLastWorkout);

    setPaginatedWorkouts(currentWorkouts);
    setTotalPages(Math.ceil(filteredWorkouts.length / workoutsPerPage));
  }, [filteredWorkouts, currentPage, workoutsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const testBackendConnection = async () => {
    try {
      setTestingConnection(true);
      const response = await fetch("/api/strava/test-connection");
      const data = await response.json();
      setConnectionTest(data);
    } catch (error) {
      setConnectionTest({
        success: false,
        message: "Connection test failed",
        error: error.message,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const connectStrava = () => {
    window.location.href = "/api/strava/auth";
  };

  if (loading && stravaLoading) {
    return <div>Loading workouts...</div>;
  }

  return (
    <div className="workout-list-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Your Workouts</h2>

        {/* Filter controls */}
        <div className="d-flex gap-2">
          {/* Source filter */}
          <div className="btn-group btn-group-sm" role="group" aria-label="Filter workouts by source">
            <button
              type="button"
              className={`btn ${
                sourceFilter === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setSourceFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${
                sourceFilter === WorkoutSource.MANUAL ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setSourceFilter(WorkoutSource.MANUAL)}
            >
              Manual
            </button>
            <button
              type="button"
              className={`btn ${
                sourceFilter === WorkoutSource.STRAVA ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setSourceFilter(WorkoutSource.STRAVA)}
              disabled={!stravaConnected}
            >
              Strava
            </button>
          </div>

          {/* Time filter */}
          <div className="btn-group btn-group-sm" role="group" aria-label="Filter workouts by time">
            <button
              type="button"
              className={`btn ${
                timeFilter === "all" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTimeFilter("all")}
            >
              All Time
            </button>
            <button
              type="button"
              className={`btn ${
                timeFilter === "week" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTimeFilter("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`btn ${
                timeFilter === "month" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTimeFilter("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`btn ${
                timeFilter === "year" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTimeFilter("year")}
            >
              Year
            </button>
          </div>

          {/* Type filter dropdown */}
          <select
            className="form-select form-select-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ maxWidth: '150px' }}
          >
            <option value="all">All Types</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {formatWorkoutType(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Strava connection prompt if not connected */}
      {!stravaConnected && (
        <div className="alert alert-info py-2 px-3 mb-3 small">
          <div className="d-flex align-items-center">
            <p className="mb-0 me-2">Connect Strava to see all your workouts in one place.</p>
            <button className="btn btn-sm btn-primary" onClick={connectStrava}>
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Combined workouts list */}
      {filteredWorkouts.length === 0 ? (
        <p className="text-muted small">
          No workouts found with the selected filters.{" "}
          <button
            className="btn btn-link btn-sm p-0"
            onClick={() => {
              setSourceFilter("all");
              setTypeFilter("all");
              setTimeFilter("all");
            }}
          >
            Clear all filters
          </button>
        </p>
      ) : (
        <>
          <div className="workout-list">
            {paginatedWorkouts.map((workout) => (
              <div key={workout.id} className="card mb-2">
                <div className="card-body py-2 px-3">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-1">
                        {workout.source === WorkoutSource.STRAVA ? (
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: "#FC4C02", fontSize: "0.7rem" }}
                          >
                            Strava
                          </span>
                        ) : (
                          <span className="badge bg-secondary me-2" style={{ fontSize: "0.7rem" }}>
                            Manual
                          </span>
                        )}
                        <h5 className="card-title mb-0 h6">{workout.title}</h5>
                      </div>
                      <p className="card-text text-muted small mb-0">
                        {workout.date.toLocaleDateString()} • {formatWorkoutType(workout.normalizedType)} • {workout.duration} min
                      </p>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex flex-wrap justify-content-md-end">
                        {workout.distance && (
                          <span className="badge bg-light text-dark me-1 mb-1">
                            {(workout.distance / 1000).toFixed(1)} km
                          </span>
                        )}
                        {workout.elevationGain && workout.elevationGain > 0 && (
                          <span className="badge bg-light text-dark me-1 mb-1">
                            {workout.elevationGain} m ↑
                          </span>
                        )}
                        {workout.additionalData?.averageHeartRate && (
                          <span className="badge bg-light text-dark me-1 mb-1">
                            ♥ {Math.round(workout.additionalData.averageHeartRate)} bpm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          {/* Results summary */}
          <div className="text-muted text-center small mt-2">
            Showing {paginatedWorkouts.length} of {filteredWorkouts.length} workouts
          </div>
        </>
      )}

      {/* Error display */}
      {stravaError && (
        <div className="alert alert-warning mt-3 py-2 px-3 small">
          <p className="mb-1">Error connecting to Strava: {stravaError}</p>
          <button
            className="btn btn-outline-primary btn-sm mt-1"
            onClick={testBackendConnection}
            disabled={testingConnection}
          >
            {testingConnection ? "Testing..." : "Test Connection"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
