import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AssignRoles({ projectState, onNext, onBack, onUpdate }) {
  const [deadline, setDeadline] = useState(
    projectState.timeline?.deadline || getDefaultDeadline()
  );
  const [assignments, setAssignments] = useState(projectState.assignments || {});
  const [timelineResult, setTimelineResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function getDefaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    validateTimeline();
  }, [deadline]);

  const validateTimeline = async () => {
    if (!deadline) return;

    const result = await api.validateTimeline(projectState.tasks, deadline);
    if (result.success) {
      setTimelineResult(result.data);
    }
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
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {timelineResult && (
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
