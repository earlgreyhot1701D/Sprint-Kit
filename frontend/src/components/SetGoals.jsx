import React, { useState } from 'react';
import { api } from '../utils/api';

export default function SetGoals({ projectState, onNext, onBack }) {
  const [goal, setGoal] = useState(projectState.goals?.goal || '');
  const [successCriteria, setSuccessCriteria] = useState(
    projectState.goals?.successCriteria || ''
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!goal.trim()) {
      setErrors({ goal: 'What is your goal?' });
      setLoading(false);
      return;
    }

    if (!successCriteria.trim()) {
      setErrors({ successCriteria: 'How will you know you finished?' });
      setLoading(false);
      return;
    }

    // Validate with backend
    const validation = await api.validateSuccessCriteria(successCriteria);

    if (!validation.success || !validation.data?.valid) {
      setErrors({
        successCriteria: validation.data?.error || 'Please be more specific'
      });
      setLoading(false);
      return;
    }

    onNext({
      goals: { goal, successCriteria }
    });

    setLoading(false);
  };

  return (
    <div className="step-container">
      <h2>🎯 What Do You Want to Finish?</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="goal">By the end of your project, what will be done?</label>
          <div className="hint">
            Example: "We will have a working robot that picks up tennis balls"
          </div>
          <textarea
            id="goal"
            placeholder="Write your goal here..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            className={errors.goal ? 'input-error' : ''}
          />
          {errors.goal && <span className="error-text">{errors.goal}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="criteria">How will you KNOW you finished? What does "done" look like?</label>
          <div className="hint">
            Example: "We'll test it 3 times and it will pick up at least 10 balls"
          </div>
          <textarea
            id="criteria"
            placeholder="What will be the proof that you finished?"
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            rows={3}
            className={errors.successCriteria ? 'input-error' : ''}
          />
          {errors.successCriteria && (
            <span className="error-text">{errors.successCriteria}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Checking...' : 'Next →'}
          </button>
        </div>
      </form>
    </div>
  );
}
