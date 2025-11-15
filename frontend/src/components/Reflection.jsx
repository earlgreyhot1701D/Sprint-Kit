import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { FORM_LIMITS, showSoftPrompt } from '../utils/formValidation';

export default function Reflection({ projectState, onNext, onBack, onUpdate }) {
  const [reflectionPrompts, setReflectionPrompts] = useState(
    projectState.reflection?.prompts || []
  );
  const [reflectionAnswers, setReflectionAnswers] = useState(
    projectState.reflection?.answers || []
  );
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptsError, setPromptsError] = useState(null);

  // Fetch adaptive reflection prompts on mount
  useEffect(() => {
    if (reflectionPrompts.length === 0) {
      fetchAdaptivePrompts();
    }
  }, []);

  const fetchAdaptivePrompts = async () => {
    setLoadingPrompts(true);
    setPromptsError(null);

    // Call with correct parameters: projectType, projectTitle, whatWentWell, whatWasHard, whatLearned
    const result = await api.getReflectionPrompts(
      projectState.project_type || 'other',
      projectState.title || 'Project',
      '', // what_went_well (student hasn't answered yet)
      '', // what_was_hard (student hasn't answered yet)
      ''  // what_learned (student hasn't answered yet)
    );

    if (result.success && result.data.prompts && result.data.prompts.length > 0) {
      setReflectionPrompts(result.data.prompts);
      // Initialize empty answers for each prompt
      setReflectionAnswers(new Array(result.data.prompts.length).fill(''));
    } else {
      setPromptsError('Could not load custom prompts. Using defaults.');
      // Fallback to generic prompts
      setReflectionPrompts([
        'What went well with your project?',
        'What was hard or challenging?',
        'What did you learn about yourself?'
      ]);
      setReflectionAnswers(['', '', '']);
    }

    setLoadingPrompts(false);
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...reflectionAnswers];
    newAnswers[idx] = value;
    setReflectionAnswers(newAnswers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate: all answers have minimum length
    const minLength = FORM_LIMITS.reflection.min;
    const allValid = reflectionAnswers.every(
      (answer) => answer && answer.trim().length >= minLength
    );

    if (!allValid) {
      alert(`Please answer all questions (at least ${minLength} characters each)`);
      return;
    }

    // Store both new format (prompts + answers) and old format for backward compatibility
    const oldFormatReflection = {
      went_well: reflectionAnswers[0] || '',
      was_hard: reflectionAnswers[1] || '',
      learned: reflectionAnswers[2] || ''
    };

    onUpdate({
      reflection: {
        prompts: reflectionPrompts,        // NEW
        answers: reflectionAnswers,        // NEW
        ...oldFormatReflection             // OLD (for compatibility)
      }
    });

    onNext();
  };

  const limits = FORM_LIMITS.reflection;

  return (
    <div className="step-container">
      <h2>🤔 What Did You Learn?</h2>

      <p className="section-intro">
        Your project: <strong>{projectState.title}</strong>
      </p>

      <div className="hint-box">
        <p>
          💡 Take a moment to think about your journey. Real learning happens when you
          reflect on what went well, what was hard, and what you'd do differently next time.
        </p>
      </div>

      {loadingPrompts && (
        <div className="loading-state">
          <div className="spinner">
            <div className="spinner-circle"></div>
          </div>
          <p className="loading-text">⏳ Claude is personalizing your reflection questions...</p>
        </div>
      )}

      {promptsError && (
        <div className="warning-message">
          <p>{promptsError}</p>
        </div>
      )}

      {!loadingPrompts && (
        <form onSubmit={handleSubmit} className="form">
          <div className="reflection-fields">
            {reflectionPrompts.map((prompt, idx) => (
              <div key={idx} className="form-group reflection-group">
                <label htmlFor={`reflection-${idx}`}>
                  <strong>{prompt}</strong>
                </label>

                <textarea
                  id={`reflection-${idx}`}
                  placeholder="Share your thoughts here..."
                  value={reflectionAnswers[idx] || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  minLength={limits.min}
                  maxLength={limits.max}
                  required
                  className="reflection-textarea"
                />

                {/* Character counter with soft prompt */}
                <div className="char-counter">
                  {showSoftPrompt(reflectionAnswers[idx]?.length || 0, limits.soft) && (
                    <small className="soft-prompt">
                      💡 Tell us more! ({reflectionAnswers[idx]?.length || 0}/{limits.soft})
                    </small>
                  )}

                  {(reflectionAnswers[idx]?.length || 0) > limits.soft && (
                    <small className="char-count">
                      {reflectionAnswers[idx]?.length || 0}/{limits.max}
                    </small>
                  )}

                  {(reflectionAnswers[idx]?.length || 0) > limits.max && (
                    <small className="char-warning">
                      ✕ Max {limits.max} characters
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onBack} className="btn-secondary">
              ← Back
            </button>
            <button type="submit" className="btn-primary">
              See my project →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
