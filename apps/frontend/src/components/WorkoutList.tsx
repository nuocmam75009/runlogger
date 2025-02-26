import React, { useState, useEffect } from 'react';

interface Workout {
  id: string;
  type: string;
  duration: number;
  date: Date;
}

interface WorkoutListProps {
  userId: string;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ userId }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`/api/workouts?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [userId]);

  if (loading) {
    return <div>Loading workouts...</div>;
  }

  return (
    <div>
      <h2>Your Workouts</h2>
      {workouts.length === 0 ? (
        <p>No workouts found.</p>
      ) : (
        <ul className="list-group">
          {workouts.map((workout) => (
            <li key={workout.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{workout.type}</strong>
                  <p className="mb-0">Duration: {workout.duration} minutes</p>
                  <small>{new Date(workout.date).toLocaleDateString()}</small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WorkoutList;

