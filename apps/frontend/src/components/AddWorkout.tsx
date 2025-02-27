import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Modal, Button } from 'react-bootstrap';
import { WorkoutType, IntensityLevel, formatWorkoutType } from 'shared-types';

interface AddWorkoutProps {
  userId: string;
  onWorkoutAdded?: () => void;
}

// Convert HH:MM:SS format to minutes
const timeToMinutes = (timeString: string): number => {
  // Handle empty string
  if (!timeString) return 0;

  // Split the time string by colons
  const parts = timeString.split(':');

  // Parse based on number of parts
  if (parts.length === 3) {
    // HH:MM:SS format
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;
    return hours * 60 + minutes + seconds / 60;
  } else if (parts.length === 2) {
    // MM:SS format
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return minutes + seconds / 60;
  } else {
    // Invalid format
    return 0;
  }
};

// Validate time format (HH:MM:SS or MM:SS)
const isValidTimeFormat = (timeString: string): boolean => {
  if (!timeString) return false;

  // Regular expression for HH:MM:SS or MM:SS format
  const timeRegex = /^(\d+:)?[0-5]?\d:[0-5]\d$/;
  return timeRegex.test(timeString);
};

const AddWorkout: React.FC<AddWorkoutProps> = ({ userId, onWorkoutAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('');
  const [durationString, setDurationString] = useState('');
  const [distance, setDistance] = useState<number | ''>('');
  const [gear, setGear] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>(IntensityLevel.MODERATE);
  const [notes, setNotes] = useState('');
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setWorkoutTypes(Object.values(WorkoutType));
  }, []);

  // Validate duration format when it changes
  useEffect(() => {
    if (durationString && !isValidTimeFormat(durationString)) {
      setDurationError('Please use format HH:MM:SS or MM:SS');
    } else {
      setDurationError(null);
    }
  }, [durationString]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setType('');
    setDurationString('');
    setDistance('');
    setGear('');
    setIntensity(IntensityLevel.MODERATE);
    setNotes('');
    setError(null);
    setDurationError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!durationString) {
      setError('Duration is required');
      setIsSubmitting(false);
      return;
    }

    if (!isValidTimeFormat(durationString)) {
      setError('Duration must be in format HH:MM:SS or MM:SS');
      setIsSubmitting(false);
      return;
    }

    // Convert duration string to minutes for the API
    const durationInMinutes = timeToMinutes(durationString);

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          duration: durationInMinutes,
          distance: distance ? Number(distance) : undefined,
          gear: gear || undefined,
          intensity,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add workout');
      }

      // Reset form and close modal
      resetForm();
      setShowModal(false);

      // Notify parent component that a workout was added
      if (onWorkoutAdded) {
        onWorkoutAdded();
      } else {
        router.reload();
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      setError(error.message || 'Failed to add workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleOpenModal}
        className="d-flex align-items-center justify-content-center w-100 mb-4"
      >
        <i className="bi bi-plus-circle me-2"></i> Add New Workout 💪
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Workout 💪</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form id="addWorkoutForm" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Workout Type*</label>
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
                    {formatWorkoutType(workoutType)}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="duration" className="form-label">Duration (HH:MM:SS)*</label>
                <input
                  type="text"
                  id="duration"
                  className={`form-control ${durationError ? 'is-invalid' : ''}`}
                  value={durationString}
                  onChange={(e) => setDurationString(e.target.value)}
                  placeholder="e.g., 01:30:00"
                  required
                />
                {durationError && (
                  <div className="invalid-feedback">
                    {durationError}
                  </div>
                )}
                <small className="form-text text-muted">
                  Format: HOURS:MINUTES:SECONDS (e.g., 01:30:00) or MINUTES:SECONDS (e.g., 45:30)
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="distance" className="form-label">Distance (kilometers)</label>
                <input
                  type="number"
                  id="distance"
                  className="form-control"
                  value={distance}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDistance(value === '' ? '' : parseFloat(value));
                  }}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="gear" className="form-label">Gear/Equipment</label>
              <input
                type="text"
                id="gear"
                className="form-control"
                value={gear}
                onChange={(e) => setGear(e.target.value)}
                placeholder="e.g., Running shoes, Bike model, etc."
              />
            </div>

            <div className="mb-3">
              <label htmlFor="intensity" className="form-label">Intensity</label>
              <select
                id="intensity"
                className="form-select"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as IntensityLevel)}
              >
                {Object.values(IntensityLevel).map((level) => (
                  <option key={level} value={level}>
                    {formatWorkoutType(level)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional notes about your workout"
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="addWorkoutForm"
            disabled={isSubmitting || !!durationError}
          >
            {isSubmitting ? 'Adding...' : 'Add Workout'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddWorkout;

