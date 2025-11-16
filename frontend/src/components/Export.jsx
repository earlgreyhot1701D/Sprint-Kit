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
    if (projectState.reflection?.prompts?.length > 0 && projectState.reflection?.answers?.length > 0) {
      // New format: Q&A pairs
      reflectionText = projectState.reflection.prompts
        .map((prompt, idx) => `Q: ${prompt}\nA: ${projectState.reflection.answers[idx] || 'No answer provided'}`)
        .join('\n\n');
    } else {
      // Fallback to old format
      reflectionText = `Went Well:\n${projectState.reflection?.went_well}\n\nWas Hard:\n${projectState.reflection?.was_hard}\n\nWould Do Differently:\n${projectState.reflection?.differently}`;
    }

    const text = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                        PROJECT PLAN SUMMARY                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 PROJECT: ${projectState.title}
   Description: ${projectState.description}

🎯 GOAL: ${projectState.goals?.goal}

👥 TEAM: ${projectState.teamMembers?.length > 0 ? projectState.teamMembers.join(', ') : 'Solo project'}

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

  // Generate personalized celebration message based on actual project details
  const generateCelebrationMessage = () => {
    const projectType = projectState.project_type || 'project';
    const taskCount = projectState.tasks?.length || 0;
    const totalHours = projectState.tasks?.reduce((sum, t) => sum + (parseInt(t.hours) || 0), 0) || 0;
    const teamSize = projectState.teamMembers?.length || 0;
    const teamNames = projectState.teamMembers?.join(', ') || '';

    // Build team description
    let teamDesc = '';
    if (teamSize === 0) {
      teamDesc = 'solo';
    } else if (teamSize === 1) {
      teamDesc = `with ${teamNames}`;
    } else {
      teamDesc = `with your team (${teamNames})`;
    }

    // Build task description
    let taskDesc = '';
    if (taskCount > 0) {
      taskDesc = `, broke it into ${taskCount} concrete tasks`;
    }

    // Build hours description
    let hoursDesc = '';
    if (totalHours > 0) {
      hoursDesc = `, estimated ${totalHours} hours of work`;
    }

    // Extract key learnings from reflection
    const reflectionAnswers = projectState.reflection?.answers || [];
    const combinedReflection = reflectionAnswers.join(' ').toLowerCase();

    const learnings = [];
    if (combinedReflection.includes('break') || combinedReflection.includes('task') || combinedReflection.includes('step')) {
      learnings.push('breaking goals into steps');
    }
    if (combinedReflection.includes('plan') || combinedReflection.includes('time') || combinedReflection.includes('estimate')) {
      learnings.push('planning ahead');
    }
    if (combinedReflection.includes('team') || combinedReflection.includes('together') || combinedReflection.includes('help')) {
      learnings.push('working with others');
    }
    if (combinedReflection.includes('learn') || combinedReflection.includes('better') || combinedReflection.includes('improve')) {
      learnings.push('growing your skills');
    }

    // Build learnings description
    let learningsDesc = '';
    if (learnings.length > 0) {
      learningsDesc = `, and reflected on ${learnings.slice(0, 2).join(' and ')}`;
    }

    // Construct the full message
    const message = `You planned a ${projectType} project ${teamDesc}${taskDesc}${hoursDesc}${learningsDesc}. That's real project planning!`;

    return message;
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
          <p>
            {projectState.teamMembers?.length > 0
              ? projectState.teamMembers.join(', ')
              : 'Solo project'}
          </p>
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

        {/* Badges Section - Prominent Achievement Display */}
        <div className="summary-section badges-showcase">
          <h4>🏆 Your Badges</h4>
          {projectState.badges?.length > 0 ? (
            <div className="badges-grid">
              {projectState.badges.map((badge, idx) => (
                <div key={idx} className="badge-card">
                  <div className="badge-emoji">{badge.emoji || '🏆'}</div>
                  <h3>{badge.name}</h3>
                  <p>{badge.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-badges-message">
              Keep learning! Badges unlock as you develop real skills.
            </p>
          )}
        </div>

        {projectState.reflection?.prompts?.length > 0 && projectState.reflection?.answers?.length > 0 ? (
          <div className="summary-section">
            <h4>Your Reflection</h4>
            <div className="qa-pairs">
              {projectState.reflection.prompts.map((prompt, idx) => (
                <div key={idx} className="qa-pair">
                  <p><strong>Q: {prompt}</strong></p>
                  <p className="answer">A: {projectState.reflection.answers[idx] || 'No answer provided'}</p>
                </div>
              ))}
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
        <p>{generateCelebrationMessage()}</p>
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
