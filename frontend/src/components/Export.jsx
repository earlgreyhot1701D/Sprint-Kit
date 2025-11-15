import React, { useState } from 'react';
import { api } from '../utils/api';

// Helper to format date from YYYY-MM-DD to MM-DD-YYYY
const formatDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  try {
    const [year, month, day] = isoDate.split('-');
    return `${month}-${day}-${year}`;
  } catch (e) {
    return isoDate;
  }
};

export default function Export({ projectState, onBack, onStartOver }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🔍 DIAGNOSTIC: Log full reflection object at component render
  console.log('=== EXPORT.JSX DIAGNOSTIC ===');
  console.log('Full projectState:', projectState);
  console.log('Reflection object:', projectState.reflection);
  console.log('Reflection prompts:', projectState.reflection?.prompts);
  console.log('Reflection answers:', projectState.reflection?.answers);
  console.log('Prompts length:', projectState.reflection?.prompts?.length);
  console.log('Answers length:', projectState.reflection?.answers?.length);
  console.log('Answers array:', JSON.stringify(projectState.reflection?.answers));
  console.log('=========================');

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await api.exportPDF(projectState);
    } catch (error) {
      alert('Could not download PDF. Try copying to clipboard instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = () => {
    let reflectionText = '';
    if (projectState.reflection?.prompts?.length > 0) {
      // Fix #7: Safely access answers array with bounds checking
      reflectionText = projectState.reflection.prompts
        .map((prompt, idx) => `Q: ${prompt}\nA: ${projectState.reflection.answers?.[idx] || '❌ NO ANSWER FOUND'}`)
        .join('\n\n');
    } else {
      reflectionText = `Went Well:\n${projectState.reflection?.went_well}\n\nWas Hard:\n${projectState.reflection?.was_hard}\n\nWould Do Differently:\n${projectState.reflection?.differently}`;
    }

    const text = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                        PROJECT PLAN SUMMARY                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 PROJECT: ${projectState.title}
   Description: ${projectState.description}

🎯 GOAL: ${projectState.goals?.goal}

👥 TEAM: ${projectState.teamMembers?.join(', ')}

───────────────────────────────────────────────────────────────────────────

📝 TASKS:
${projectState.tasks?.map((t) => `  • ${t.name} (${t.hours}h, ${t.difficulty}) → ${t.assigned_to || 'Unassigned'}`).join('\n')}

⏱️ TIMELINE:
   Total Work: ${projectState.timeline?.total_hours} hours
   Deadline: ${formatDate(projectState.timeline?.deadline)}

───────────────────────────────────────────────────────────────────────────

🤔 REFLECTION:
${reflectionText}

───────────────────────────────────────────────────────────────────────────

${projectState.insights?.length > 0 ? `💡 KEY INSIGHTS:\n${projectState.insights?.map((i) => `   • ${i}`).join('\n')}\n\n───────────────────────────────────────────────────────────────────────────\n\n` : ''}${projectState.badges?.length > 0 ? `🏆 BADGES EARNED:\n${projectState.badges?.map((b) => `   ${b.emoji || '🏆'} ${b.name}: ${b.reason}`).join('\n')}\n\n───────────────────────────────────────────────────────────────────────────` : ''}

═══════════════════════════════════════════════════════════════════════════
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get project-type-specific hints
  const getExportHint = () => {
    const projectType = projectState.project_type || 'other';

    const hints = {
      hardware: "📤 Download your plan to show your team or teacher. Keep this plan handy—you'll want to reference it as you build!",
      software: "📤 Your code repo is your real deliverable, but this plan shows your process. Great for documentation!",
      creative: "📤 Share your plan with your team to show how you managed the creative process from start to finish.",
      event: "📤 Use this to show how you organized an event. Your planning matters as much as the event itself!",
      research: "📤 This shows your research methodology. Include it with your final findings—good process = credible research.",
      other: "📤 You've got your complete project plan. Share it, print it, or save it for next time!"
    };

    return hints[projectType] || hints.other;
  };

  return (
    <div className="step-container">
      <h2>📊 Your Project Plan</h2>

      <div className="project-summary">
        <h3>{projectState.title}</h3>

        <div className="summary-section">
          <h4>Goal</h4>
          <p>{projectState.goals?.goal}</p>
        </div>

        <div className="summary-section">
          <h4>Team</h4>
          <p>{projectState.teamMembers?.join(', ')}</p>
        </div>

        <div className="summary-section">
          <h4>Tasks</h4>
          <ul>
            {projectState.tasks?.map((task, idx) => (
              <li key={idx}>
                <strong>{task.name}</strong> ({task.hours}h, {task.difficulty}) → {task.assigned_to || 'Unassigned'}
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-section">
          <h4>Timeline</h4>
          <p>
            Total: {projectState.timeline?.total_hours} hours | Deadline:{' '}
            {formatDate(projectState.timeline?.deadline)}
          </p>
        </div>

        {projectState.reflection?.prompts?.length > 0 ? (
          <div className="summary-section">
            <h4>Your Reflection</h4>
            <div className="qa-pairs">
              {projectState.reflection.prompts.map((prompt, idx) => {
                // 🔍 DIAGNOSTIC: Log each prompt/answer pair
                console.log(`Rendering Q&A #${idx}:`);
                console.log(`  Prompt: "${prompt}"`);
                console.log(`  Answer: "${projectState.reflection.answers?.[idx]}"`);
                console.log(`  Answer exists: ${!!projectState.reflection.answers?.[idx]}`);

                return (
                  <div key={idx} className="qa-pair">
                    <p><strong>Q: {prompt}</strong></p>
                    {/* Fix #7: Safely access answers array with bounds checking */}
                    <p className="answer">A: {projectState.reflection.answers?.[idx] || '❌ NO ANSWER FOUND'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="summary-section">
            <h4>Your Reflection</h4>
            <p>
              <strong>Went Well:</strong> {projectState.reflection?.went_well}
            </p>
            <p>
              <strong>Was Hard:</strong> {projectState.reflection?.was_hard}
            </p>
            <p>
              <strong>Would Do Differently:</strong> {projectState.reflection?.differently}
            </p>
          </div>
        )}

        {projectState.insights?.length > 0 && (
          <div className="summary-section">
            <h4>Key Insights</h4>
            <ul>
              {projectState.insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {projectState.badges?.length > 0 && (
          <div className="summary-section">
            <h4>Badges Earned</h4>
            <div className="badges-summary">
              {projectState.badges.map((badge, idx) => (
                <div key={idx} className="badge-summary">
                  {badge.emoji || '🏆'} <strong>{badge.name}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="download-section">
        <h3>Download Your Plan</h3>
        <div className="hint-box">
          <p>{getExportHint()}</p>
        </div>
        <div className="download-buttons">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="btn-primary"
          >
            {downloading ? 'Generating PDF...' : '📄 Download as PDF'}
          </button>
          <button onClick={handleCopyToClipboard} className="btn-secondary">
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      </div>

      <div className="completion-message">
        <h3>🎉 You Did It!</h3>
        <p>
          You planned a real project, learned about breaking it down, estimating time, working with a team,
          and thinking about your process. That's what real learners do!
        </p>
      </div>

      <div className="form-actions">
        <button onClick={onBack} className="btn-secondary">
          ← Back to Reflection
        </button>
        <button onClick={onStartOver} className="btn-secondary">
          📄 Start Over
        </button>
      </div>
    </div>
  );
}
