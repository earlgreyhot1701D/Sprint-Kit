import React, { useState } from 'react';
import { FORM_LIMITS, showSoftPrompt } from '../utils/formValidation';

export default function Brainstorm({ projectState, onNext, onBack }) {
  // Fix #2: Prevent crash if brainstormIdeas is undefined
  const [brainstormIdeas, setBrainstormIdeas] = useState(
    projectState.brainstormIdeas?.join('\n') || ''
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!brainstormIdeas.trim()) {
      setErrors({ ideas: 'Please write down some ideas!' });
      return;
    }

    if (brainstormIdeas.trim().length < FORM_LIMITS.brainstorm.min) {
      setErrors({ ideas: `Write a bit more! Need at least ${FORM_LIMITS.brainstorm.min} characters` });
      return;
    }

    const ideas = brainstormIdeas
      .split('\n')
      .map((idea) => idea.trim())
      .filter((idea) => idea.length > 0);

    onNext({ brainstormIdeas: ideas });
  };

  return (
    <div className="step-container">
      <h2>💡 Brainstorm: Different Approaches</h2>

      <div className="hint-box">
        <p>💡 Just write down ideas. No idea is bad. Don't worry about whether it's possible yet.</p>
        <p>💡 Write ideas fast. Don't stop to judge them. Think: different materials, different steps, different ways to test it.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="ideas">Brainstorm 3-5 ideas *</label>
          <div className="field-requirement">
            <span>20-500 characters. Write FAST, don't judge. No idea is bad.</span>
            <span className="example">Example: "Build it from cardboard, use a motor from old drill, add wheels from skateboard, make it solar powered"</span>
          </div>
          <textarea
            id="ideas"
            placeholder="Write ideas fast. Don't stop to judge. Examples: use solar power, make it smaller, use recyclable materials..."
            value={brainstormIdeas}
            onChange={(e) => setBrainstormIdeas(e.target.value)}
            rows={6}
            minLength={FORM_LIMITS.brainstorm.min}
            maxLength={FORM_LIMITS.brainstorm.max}
            className={errors.ideas ? 'input-error' : ''}
            required
          />
          <div className="char-counter">
            {brainstormIdeas.length > 0 && (
              <small>{brainstormIdeas.length}/{FORM_LIMITS.brainstorm.max} characters</small>
            )}
            {brainstormIdeas.length > 0 && brainstormIdeas.length < FORM_LIMITS.brainstorm.min && (
              <small className="requirement-warning">⚠ Need at least {FORM_LIMITS.brainstorm.min} characters</small>
            )}
            {showSoftPrompt(brainstormIdeas.length, FORM_LIMITS.brainstorm.soft) && (
              <small className="soft-prompt">💡 More ideas? ({brainstormIdeas.length}/{FORM_LIMITS.brainstorm.soft} good)</small>
            )}
            {brainstormIdeas.length >= FORM_LIMITS.brainstorm.soft && (
              <small className="requirement-success">✓ Great brainstorm</small>
            )}
          </div>
          {errors.ideas && <span className="error-text">{errors.ideas}</span>}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
