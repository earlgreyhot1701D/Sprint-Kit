import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function BreakItDown({ projectState, onNext, onBack, onUpdate }) {
  const [tasks, setTasks] = useState(projectState.tasks || []);
  const [loading, setLoading] = useState(!projectState.tasks || projectState.tasks.length === 0);
  const [tasksEdited, setTasksEdited] = useState(projectState.tasksEdited || false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectState.tasks || projectState.tasks.length === 0) {
      generateTasks();
    }
  }, []);

  const generateTasks = async () => {
    setLoading(true);
    setError(null);

    const result = await api.breakDownTasks(
      projectState.goals.goal,
      projectState.description
    );

    if (result.success && result.data.tasks) {
      setTasks(result.data.tasks);
    } else {
      setError('Could not generate tasks. Using template instead.');
      // Fallback is handled by backend
    }

    setLoading(false);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
    setTasksEdited(true);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { task: '', hours: 1, difficulty: 'Medium' }]);
    setTasksEdited(true);
  };

  const handleDeleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setTasksEdited(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tasks.length === 0) {
      alert('Add at least one task!');
      return;
    }

    // Format tasks for storage
    const formattedTasks = tasks.map((task) => ({
      name: task.task || task.name || 'Unnamed Task',
      hours: parseInt(task.hours) || 1,
      difficulty: task.difficulty || 'Medium',
      assigned_to: ''
    }));

    onUpdate({ tasks: formattedTasks, tasksEdited });
    onNext();
  };

  return (
    <div className="step-container">
      <h2>🔨 Break It Down Into Tasks</h2>

      <p className="section-intro">
        Your goal: <strong>{projectState.goals.goal}</strong>
      </p>

      <div className="hint-box">
        <p>
          💡 AI is helping you think about smaller tasks. These are steps your team can
          actually do.
        </p>
      </div>

      {loading && (
        <div className="loading">
          <p>⏳ Generating tasks...</p>
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="warning-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="form">
          <div className="tasks-list">
            {tasks.map((task, index) => (
              <div key={index} className="task-card">
                <div className="form-group">
                  <label>Task Name</label>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={task.task || task.name || ''}
                    onChange={(e) => handleTaskChange(index, 'task', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Hours</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={task.hours || 1}
                      onChange={(e) => handleTaskChange(index, 'hours', e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Difficulty</label>
                    <select
                      value={task.difficulty || 'Medium'}
                      onChange={(e) => handleTaskChange(index, 'difficulty', e.target.value)}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(index)}
                  className="btn-remove-task"
                >
                  Delete Task
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddTask} className="btn-secondary">
            + Add Custom Task
          </button>

          <div className="form-actions">
            <button type="button" onClick={onBack} className="btn-secondary">
              ← Back
            </button>
            <button type="submit" className="btn-primary">
              This looks good →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
