import React, { useState } from 'react';
import { FORM_LIMITS } from '../utils/formValidation';

export default function SetGoals({ projectState, onNext, onBack }) {
  const [goal, setGoal] = useState(projectState.goals?.goal || '');
  const [criteria, setCriteria] = useState(projectState.goals?.criteria || '');
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

    if (goal.trim().length < FORM_LIMITS.goal.min) {
      setErrors({ goal: `Tell us a bit more about your goal (at least ${FORM_LIMITS.goal.min} characters)` });
      setLoading(false);
      return;
    }

    if (!criteria.trim()) {
      setErrors({ criteria: 'Tell us how you\'ll know you\'re done!' });
      setLoading(false);
      return;
    }

    if (criteria.trim().length < FORM_LIMITS.criteria.min) {
      setErrors({ criteria: `Tell us a bit more about your success criteria (at least ${FORM_LIMITS.criteria.min} characters)` });
      setLoading(false);
      return;
    }

    onNext({
      goals: { goal, criteria }
    });

    setLoading(false);
  };

  return (
    <div className="step-container">
      <h2>🎯 Your Goal</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="goal">What's your project goal? *</label>
          <div className="field-requirement">
            <span>10-200 characters. Be specific and measurable.</span>
            <span className="example">Good: "Build a robot that picks up 10 tennis balls"</span>
            <span className="example">Bad: "Make a robot"</span>
          </div>
          <input
            id="goal"
            type="text"
            placeholder="e.g., Build a robot that picks up 10 tennis balls"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            minLength={FORM_LIMITS.goal.min}
            maxLength={FORM_LIMITS.goal.max}
            className={errors.goal ? 'input-error' : ''}
            required
          />
          <div className="char-counter">
            {goal.length > 0 && <small>{goal.length}/{FORM_LIMITS.goal.max} characters</small>}
            {goal.length > 0 && goal.length < FORM_LIMITS.goal.min && (
              <small className="requirement-warning">⚠ Need at least {FORM_LIMITS.goal.min} characters</small>
            )}
            {goal.length >= FORM_LIMITS.goal.min && (
              <small className="requirement-success">✓ Goal looks good</small>
            )}
          </div>
          {errors.goal && <span className="error-text">{errors.goal}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="criteria">How will you know you're done? *</label>
          <div className="field-requirement">
            <span>10-200 characters. Describe what SUCCESS looks like.</span>
            <span className="example">Good: "We'll test it 3 times and it picks up at least 8 balls"</span>
            <span className="example">Bad: "It works"</span>
          </div>
          <input
            id="criteria"
            type="text"
            placeholder="e.g., We'll test it 3 times and it picks up at least 8 balls"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            minLength={FORM_LIMITS.criteria.min}
            maxLength={FORM_LIMITS.criteria.max}
            className={errors.criteria ? 'input-error' : ''}
            required
          />
          <div className="char-counter">
            {criteria.length > 0 && <small>{criteria.length}/{FORM_LIMITS.criteria.max} characters</small>}
            {criteria.length > 0 && criteria.length < FORM_LIMITS.criteria.min && (
              <small className="requirement-warning">⚠ Need at least {FORM_LIMITS.criteria.min} characters</small>
            )}
            {criteria.length >= FORM_LIMITS.criteria.min && (
              <small className="requirement-success">✓ Success criteria clear</small>
            )}
          </div>
          {errors.criteria && <span className="error-text">{errors.criteria}</span>}
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
