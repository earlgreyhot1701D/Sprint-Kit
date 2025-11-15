import React from 'react'; // Removed useState, useEffect as state is simplified
import styles from './Intro.module.css';

export default function Intro({ onStart, darkMode, toggleTheme }) {
  // Removed all state: teamMembers, expandedSkill, expandedTip, showSkipWarning

  const skills = [
    {
      id: 'break-down',
      emoji: '🔨',
      title: 'Break It Down',
      short: 'Split big goals into small tasks',
      long: 'Your brain is better at handling small steps than huge goals. This skill teaches you how to take any project and break it into tasks your team can actually do.'
    },
    {
      id: 'time-takes',
      emoji: '⏱️',
      title: 'Time It Takes',
      short: 'Know how long things really take',
      long: 'Most people think projects will finish faster than they actually do. This skill helps you guess realistically, so you are not stressed at the last minute.'
    },
    {
      id: 'team-up',
      emoji: '👥',
      title: 'Team Up',
      short: 'Work together without chaos',
      long: 'When everyone knows who does what and when, teams actually work. This skill teaches you how to assign work fairly and help each other finish.'
    },
    {
      id: 'what-learned',
      emoji: '💡',
      title: 'What I Learned',
      short: 'Think about your thinking',
      long: 'The best learners think about HOW they learn, not just WHAT they learned. This skill helps you notice what works for you and what you would do differently next time.'
    }
  ];

  const tips = [
    {
      id: 'tip-1',
      title: 'Real projects work best',
      text: 'Use Sprint Kit for actual school or team projects. Not fake ones.'
    },
    {
      id: 'tip-2',
      title: 'Edit the AI suggestions',
      text: 'The AI gives you ideas, but YOU decide if they are right. Change them, add to them, delete them.'
    },
    {
      id: 'tip-3',
      title: 'Honest estimation wins',
      text: 'Guess how long stuff REALLY takes, not how fast you wish it could be.'
    },
    {
      id: 'tip-4',
      title: 'Reflection is the magic',
      text: 'At the end, you will reflect on what you learned. That is where the real growth happens.'
    }
  ];

  const handleStart = () => {
    // Call onStart without team members. They will handle team setup later.
    onStart({});
  };

  return (
    <div className={styles.introContainer}>
      {/* Header */}
      <div className={styles.introHeader}>
        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className={styles.introThemeToggleBtn} title="Toggle Light/Dark Mode">
          {darkMode ? '☀️ Light Mode' : '🌑 Dark Mode'}
        </button>
        <h1>🚀 Sprint Kit</h1>
        <p className={styles.tagline}>Your Project Power-Up!</p>
      </div>

      {/* Why Section */}
      <div className={styles.whySection}>
        <h2>Why use Sprint Kit</h2>
        <p>
          Most project planning tools use boring adult words. Sprint Kit uses language that makes sense, teaches you real skills, and actually helps you finish your projects on time.
        </p>
        <p>
          In 7 levels, you will learn the skills professional teams use every day.
        </p>
      </div>

      {/* The 7 Steps Overview (Levels) - IMPROVED GRID */}
      <div className={styles.stepsOverview}>
        <h3>Your 7 Project Levels</h3>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>1️⃣ Create Project</div>
          <div className={styles.step}>2️⃣ Brainstorm Ideas</div>
          <div className={styles.step}>3️⃣ Set Goals</div>
          <div className={styles.step}>4️⃣ Break It Down</div>
          <div className={styles.step}>5️⃣ Assign & Timeline</div>
          <div className={styles.step}>6️⃣ Reflect</div>
          <div className={styles.step}>7️⃣ Export Your Project Plan</div>
        </div>
      </div>

      {/* 4 Core Skills (INLINE EXPLANATIONS) */}
      <div className={styles.skillsSection}>
        <h3>The 4 Skills You Will Learn</h3>
        <div className={styles.skillsList}>
          {skills.map(skill => (
            <div key={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                <span className={styles.skillEmoji}>{skill.emoji}</span>
                <span className={styles.skillTitle}>{skill.title}</span>
              </div>
              {/* Short and Long text displayed inline */}
              <p className={styles.skillShort}>{skill.short}</p>
              <div className={styles.skillExpanded}>
                <p>{skill.long}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level-Up Tips (INLINE EXPLANATIONS) */}
      <div className={styles.tipsSection}>
        <h3>Level-Up Tips</h3>
        <div className={styles.tipsList}>
          {tips.map(tip => (
            <div key={tip.id} className={styles.tipCard}>
              <div className={styles.tipHeader}>
                <span className={styles.tipTitle}>{tip.title}</span>
              </div>
              <div className={styles.tipExpanded}>
                <p>{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Input section is REMOVED */}

      {/* Button Row */}
      <div className={styles.buttonRow}>
        <button
          onClick={handleStart}
          className={styles.startButton}
          aria-label="Start your mission"
        >
          Start My Mission! 🚀
        </button>
      </div>
    </div>
  );
}
