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

  // Fix #3: Add dateSelected to dependency array to prevent race condition
  useEffect(() => {
    if (deadline && dateSelected) {
      validateTimeline();
    }
  }, [deadline, dateSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateTimeline = async () => {
    if (!deadline || !projectState.tasks || projectState.tasks.length === 0) return;

    setLoading(true);

    // Calculate timeline based on actual deadline
    const deadlineDays = calculateDeadlineDays(deadline);
    const hoursPerDay = 2; // Realistic for school projects
    const totalHours = projectState.tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    const availableHours = deadlineDays * hoursPerDay;
    const hoursPerDayNeeded = totalHours / deadlineDays;

    // Try API call for personalized estimation
    const result = await api.estimateTimeline(
      projectState.tasks,
      deadlineDays,
      projectState.experience_level || 'beginner',
      projectState.team_size || '1'
    );

    // Use API result if successful, otherwise use calculated values
    let timelineData;
    if (result.success && result.data) {
      timelineData = {
        ...result.data,
        days_available: deadlineDays,
        hours_per_day: hoursPerDay,
        hours_per_day_needed: hoursPerDayNeeded
      };
    } else {
      console.warn('Timeline estimation failed, using fallback calculation:', result.error);
      // Fallback: Calculate status based on school project reality (2h/day)
      let status, message, suggestion;

      if (totalHours > availableHours) {
        status = 'too_tight';
        message = `You need ${Math.round(hoursPerDayNeeded * 10) / 10}h per day, but only have ${hoursPerDay}h/day available. This won't work.`;
        suggestion = `Try: 1) Push deadline ${Math.ceil((totalHours - availableHours) / hoursPerDay)} more days, 2) Remove ${totalHours - availableHours}h of work, or 3) Get help from teammates`;
      } else if (totalHours > availableHours * 0.7) {
        status = 'tight';
        message = `You need ${Math.round(hoursPerDayNeeded * 10) / 10}h per day. That's tight but doable if you stay focused.`;
        suggestion = `Build in buffer time in case tasks take longer than expected.`;
      } else {
        status = 'good';
        message = `You only need ${Math.round(hoursPerDayNeeded * 10) / 10}h per day. Great planning!`;
        suggestion = null;
      }

      timelineData = {
        total_hours: totalHours,
        available_hours: availableHours,
        days_available: deadlineDays,
        hours_per_day: hoursPerDay,
        hours_per_day_needed: hoursPerDayNeeded,
        realistic: totalHours <= availableHours,
        status,
        message,
        suggestion
      };
    }

    setTimelineResult(timelineData);
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

    // Fix #4: Validate that tasks exist before checking assignments
    if (!projectState.tasks || projectState.tasks.length === 0) {
      alert('No tasks to assign! Please go back and add tasks.');
      return;
    }

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
          <div className="timeline-assessment">
            <h4>📊 Is Your Timeline Realistic?</h4>

            <div
              className={`timeline-status ${
                timelineResult.status === 'good'
                  ? 'good'
                  : timelineResult.status === 'tight'
                  ? 'tight'
                  : 'too_tight'
              }`}
            >
              <p className="timeline-message">{timelineResult.message}</p>

              <div className="timeline-breakdown">
                <p>📊 <strong>Total work:</strong> {timelineResult.total_hours} hours</p>
                <p>📅 <strong>Available:</strong> {timelineResult.days_available} days ({timelineResult.available_hours} hours at {timelineResult.hours_per_day}h/day)</p>
                <p>⏱️ <strong>Daily pace needed:</strong> {Math.round(timelineResult.hours_per_day_needed * 10) / 10}h/day</p>
              </div>

              {timelineResult.suggestion && (
                <div className="timeline-suggestion">
                  <p>💡 <strong>Suggestion:</strong> {timelineResult.suggestion}</p>
                </div>
              )}

              {/* Status indicator */}
              <div className="timeline-status-badge">
                {timelineResult.status === 'good' && <span className="badge-green">✓ On track</span>}
                {timelineResult.status === 'tight' && <span className="badge-yellow">⚠ Tight timeline</span>}
                {timelineResult.status === 'too_tight' && <span className="badge-red">✕ Too tight</span>}
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Who's doing what?</label>

          <div className="assignments-list">
            {projectState.tasks && projectState.tasks.map((task, idx) => {
              // Build team member list - always include "Me" as an option
              const teamMembers = projectState.teamMembers && projectState.teamMembers.length > 0
                ? projectState.teamMembers
                : ['Me'];

              return (
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
                    required
                  >
                    <option value="">-- Select person --</option>
                    {teamMembers.map((member, midx) => (
                      <option key={midx} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
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
