import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AssignRoles({ projectState, onNext, onBack, onUpdate }) {
  const [deadline, setDeadline] = useState(
    projectState.timeline?.deadline || ''
  );
  const [assignments, setAssignments] = useState(projectState.assignments || {});
  const [timelineResult, setTimelineResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateSelected, setDateSelected] = useState(!!projectState.timeline?.deadline);

  function calculateDeadlineDays(deadlineDate) {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffMs = deadline - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // At least 1 day
  }

  // Only validate timeline when user picks a date
  useEffect(() => {
    if (deadline && dateSelected) {
      validateTimeline();
    }
  }, [deadline]);

  const validateTimeline = async () => {
    if (!deadline || !projectState.tasks || projectState.tasks.length === 0) return;

    setLoading(true);

    // NEW: Pass context to backend for personalized estimation
    const deadlineDays = calculateDeadlineDays(deadline);
    const result = await api.estimateTimeline(
      projectState.tasks,
      deadlineDays,
      projectState.experience_level || 'beginner',
      projectState.team_size || '1'
    );

    if (result.success) {
      setTimelineResult(result.data);
    } else {
      console.warn('Timeline estimation failed:', result.error);
      // Fallback: basic calculation
      const totalHours = projectState.tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
      const availableHours = deadlineDays * 8; // Assume 8 hours/day max
      setTimelineResult({
        total_hours: totalHours,
        available_hours: availableHours,
        realistic: totalHours <= availableHours,
        status: totalHours <= availableHours ? 'good' : 'too_tight',
        message: totalHours <= availableHours
          ? 'You have enough time for this project!'
          : 'This timeline is tight. Consider asking for help or extending the deadline.',
        suggestion: null
      });
    }

    setLoading(false);
  };

  const handleAssign = (taskIndex, teamMember) => {
    setAssignments({
      ...assignments,
      [taskIndex]: teamMember
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check that all tasks are assigned
    const unassigned = projectState.tasks.some(
      (_, idx) => !assignments[idx]
    );

    if (unassigned) {
      alert('Please assign all tasks to team members!');
      return;
    }

    // Update tasks with assignments
    const tasksWithAssignments = projectState.tasks.map((task, idx) => ({
      ...task,
      assigned_to: assignments[idx] || ''
    }));

    onUpdate({
      tasks: tasksWithAssignments,
      timeline: {
        deadline,
        total_hours: timelineResult?.total_hours || 0,
        available_hours: timelineResult?.available_hours || 0
      },
      assignments
    });

    onNext();
  };

  return (
    <div className="step-container">
      <h2>👥 Who Does What? When?</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="deadline">When do you need to finish?</label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              setDateSelected(true);
            }}
          />
        </div>

        {loading && (
          <div className="loading-state">
            <p>Checking your timeline...</p>
          </div>
        )}

        {timelineResult && !loading && (
          <div
            className={`timeline-feedback ${
              timelineResult.status === 'good'
                ? 'good'
                : timelineResult.status === 'tight'
                ? 'tight'
                : 'too-tight'
            }`}
          >
            <p>
              <strong>Total work:</strong> {timelineResult.total_hours} hours
            </p>
            <p>
              <strong>You have:</strong> {timelineResult.available_hours} hours
            </p>
            <p className="timeline-message">{timelineResult.message}</p>
            {timelineResult.suggestion && (
              <p className="timeline-suggestion">💡 {timelineResult.suggestion}</p>
            )}
            {/* Status indicator */}
            <div className="timeline-status">
              {timelineResult.status === 'good' && <span className="badge-green">✓ On track</span>}
              {timelineResult.status === 'tight' && <span className="badge-yellow">⚠ Tight timeline</span>}
              {timelineResult.status === 'too-tight' && <span className="badge-red">✕ Too tight</span>}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Who's doing what?</label>

          <div className="assignments-list">
            {projectState.tasks.map((task, idx) => (
              <div key={idx} className="assignment-row">
                <div className="task-info">
                  <strong>{task.name}</strong>
                  <span className="task-meta">
                    {task.hours}h · {task.difficulty}
                  </span>
                </div>

                <select
                  value={assignments[idx] || ''}
                  onChange={(e) => handleAssign(idx, e.target.value)}
                  className="assignment-select"
                >
                  <option value="">Select...</option>
                  {projectState.teamMembers.map((member, midx) => (
                    <option key={midx} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            Looks good →
          </button>
        </div>
      </form>
    </div>
  );
}
