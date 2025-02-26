import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { WorkoutType } from '@prisma/client';

interface AddWorkoutProps {
  userId: string;
}



const getWorkoutTypeName = (type: string): string => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const AddWorkout: React.FC<AddWorkoutProps> = ({ userId }) => {
  const [type, setType] = useState('');
  const [duration, setDuration] = useState(0);
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);

  const router = useRouter();
  const { data: session } = useSession();


  useEffect(() => {
    setWorkoutTypes(Object.values(WorkoutType));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add workout');
      }

      // Reset form
      setType('');
      setDuration(0);


      router.reload();
    } catch (error) {
      console.error('Error adding workout:', error);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Add New Workout</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="type" className="form-label">Workout Type</label>
            <select
              id="type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select workout type</option>
              {workoutTypes.map((workoutType) => (
                <option key={workoutType} value={workoutType}>
                  {getWorkoutTypeName(workoutType)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="duration" className="form-label">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Workout</button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkout;

