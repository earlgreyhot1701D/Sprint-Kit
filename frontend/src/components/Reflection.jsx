import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Reflection({ projectState, onNext, onBack, onUpdate }) {
  const [reflection, setReflection] = useState(projectState.reflection || {});
  const [insights, setInsights] = useState(projectState.insights || []);
  const [badges, setBadges] = useState(projectState.badges || []);
  const [badgesRevealed, setBadgesRevealed] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const MIN_LENGTH = 20;

  const generateInsights = async () => {
    const allFilled =
      (reflection.went_well?.length || 0) >= MIN_LENGTH &&
      (reflection.was_hard?.length || 0) >= MIN_LENGTH &&
      (reflection.learned?.length || 0) >= MIN_LENGTH;

    if (!allFilled) {
      alert('Please fill all reflection fields with at least 20 characters each');
      return;
    }

    setInsightsLoading(true);

    const result = await api.generateReflectionInsights(projectState.title, reflection);

    if (result.success && result.data.insights) {
      setInsights(result.data.insights);
    } else {
      setInsights([
        'You reflected on your learning. That is what real learners do!',
        'You worked through challenges and kept going. That is persistence.',
        'You are thinking about how you work. That is metacognition!'
      ]);
    }

    setInsightsLoading(false);
  };

  const awardBadges = async () => {
    setBadgesLoading(true);

    // Calculate timeline accuracy (mock for now)
    const timelineAccuracy = 1.0; // This would come from actual project data

    const result = await api.awardBadges(
      JSON.stringify(reflection),
      projectState.tasksEdited || false,
      timelineAccuracy
    );

    if (result.success && result.data.badges) {
      setBadges(result.data.badges);
      // Trigger animation after short delay
      setTimeout(() => setBadgesRevealed(true), 200);
    }

    setBadgesLoading(false);
  };

  const handleReflectionChange = (field, value) => {
    setReflection({ ...reflection, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};

    if (!reflection.went_well || reflection.went_well.length < MIN_LENGTH) {
      newErrors.went_well = `At least ${MIN_LENGTH} characters`;
    }

    if (!reflection.was_hard || reflection.was_hard.length < MIN_LENGTH) {
      newErrors.was_hard = `At least ${MIN_LENGTH} characters`;
    }

    if (!reflection.learned || reflection.learned.length < MIN_LENGTH) {
      newErrors.learned = `At least ${MIN_LENGTH} characters`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Award badges if not already done
    if (badges.length === 0) {
      awardBadges();
    }

    onUpdate({
      reflection,
      insights,
      badges
    });

    onNext();
  };

  return (
    <div className="step-container">
      <h2>🤔 What Did You Learn?</h2>

      <p className="section-intro">
        Your project: <strong>{projectState.title}</strong>
      </p>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="went_well">What went well?</label>
          <textarea
            id="went_well"
            placeholder="What did your team do right?"
            value={reflection.went_well || ''}
            onChange={(e) => handleReflectionChange('went_well', e.target.value)}
            rows={3}
            className={errors.went_well ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.went_well || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.went_well && <span className="error-text">{errors.went_well}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="was_hard">What was hard?</label>
          <textarea
            id="was_hard"
            placeholder="What gave you trouble?"
            value={reflection.was_hard || ''}
            onChange={(e) => handleReflectionChange('was_hard', e.target.value)}
            rows={3}
            className={errors.was_hard ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.was_hard || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.was_hard && <span className="error-text">{errors.was_hard}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="learned">What did YOU learn about yourself?</label>
          <textarea
            id="learned"
            placeholder="About how you work, think, or help others"
            value={reflection.learned || ''}
            onChange={(e) => handleReflectionChange('learned', e.target.value)}
            rows={3}
            className={errors.learned ? 'input-error' : ''}
          />
          <div className="char-count">
            {(reflection.learned || '').length}/{MIN_LENGTH} characters
          </div>
          {errors.learned && <span className="error-text">{errors.learned}</span>}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={generateInsights}
            disabled={insightsLoading}
            className="btn-secondary"
          >
            {insightsLoading ? 'Thinking...' : '✨ Generate Insights'}
          </button>

          {insights.length > 0 && (
            <div className="insights-section">
              <h3>💡 Your Learning Insights</h3>
              {insights.map((insight, idx) => (
                <p key={idx} className="insight">
                  {insight}
                </p>
              ))}
            </div>
          )}
        </div>

        {badges.length > 0 && (
          <div className={`badges-section ${badgesRevealed ? 'revealed' : ''}`}>
            <h3>🏆 Badges Earned</h3>
            <div className="badges-list">
              {badges.map((badge, idx) => (
                <div key={idx} className="badge-card" style={{
                  animation: badgesRevealed ? `slideIn 0.4s ease-out ${idx * 0.1}s both` : 'none'
                }}>
                  <div className="badge-icon">{badge.emoji || '🏆'}</div>
                  <div className="badge-info">
                    <strong>{badge.name}</strong>
                    <p>{badge.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="submit" className="btn-primary">
            See my project →
          </button>
        </div>
      </form>
    </div>
  );
}
