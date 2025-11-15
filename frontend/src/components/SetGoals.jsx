import React, { useState } from 'react';

export default function SetGoals({ projectState, onNext, onBack }) {
  const [goal, setGoal] = useState(projectState.goals?.goal || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!goal.trim()) {
      setErrors({ goal: 'Tell us your goal!' });
      setLoading(false);
      return;
    }

    // Just check minimum length
    if (goal.trim().length < 15) {
      setErrors({ goal: "Tell us a bit more about what you want to make and how you'll know it worked" });
      setLoading(false);
      return;
    }

    onNext({
      goals: { goal }
    });

    setLoading(false);
  };

  return (
    <div className="step-container">
      <h2>🎯 Your Goal</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="goal">By the end, what will you have made/done, and how will you know it worked?</label>
          <div className="hint">
            Example: "We will have a working robot that picks up tennis balls. We'll know it worked when it picks up at least 10 balls in 3 tries."
          </div>
          <textarea
            id="goal"
            placeholder="Write your goal here..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={4}
            className={errors.goal ? 'input-error' : ''}
          />
          <div className="char-count">
            {goal.length}/15 characters
          </div>
          {errors.goal && <span className="error-text">{errors.goal}</span>}
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
