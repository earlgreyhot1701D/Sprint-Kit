import React, { useState } from 'react';

export default function Brainstorm({ projectState, onNext, onBack }) {
  const [brainstormIdeas, setBrainstormIdeas] = useState(
    projectState.brainstormIdeas.join('\n') || ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brainstormIdeas.trim()) {
      alert('Please write down some ideas!');
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
      <h2>💡 Brainstorm: Big Ideas First</h2>

      <div className="hint-box">
        <p>💡 Just write down ideas. No idea is bad. Don't worry about whether it's possible yet.</p>
        <p>💡 Write ideas fast. Don't stop to judge them.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="ideas">What are 3-5 ideas for your project?</label>
          <textarea
            id="ideas"
            placeholder="Build a robot&#10;Make it fly&#10;Use solar power&#10;Add lights&#10;Make it colorful"
            value={brainstormIdeas}
            onChange={(e) => setBrainstormIdeas(e.target.value)}
            rows={6}
          />
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
