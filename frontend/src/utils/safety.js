/**
 * Client-side safety checks for Sprint Kit
 * These are UX improvements, not security (security happens on backend)
 */

const DISALLOWED_KEYWORDS = [
  'homework',
  'essay',
  'test answers',
  'cheating',
  'depression',
  'anxiety',
  'personal',
  'family'
];

export const checkIfShouldRefuse = (userInput) => {
  /**
   * Quick client-side check before sending to backend.
   * This is UX only - backend does the real validation.
   */
  if (!userInput) return { shouldRefuse: false };

  const inputLower = userInput.toLowerCase();

  for (const keyword of DISALLOWED_KEYWORDS) {
    if (inputLower.includes(keyword)) {
      return {
        shouldRefuse: true,
        message:
          "I can help you plan projects, but that question is outside what I'm designed for. Let's focus on your project!"
      };
    }
  }

  return { shouldRefuse: false };
};

export const logSafetyEvent = (eventType, reason) => {
  /**
   * Log safety events for monitoring
   */
  console.warn(`[Safety Event] ${eventType}: ${reason}`);

  // In production, could send to logging endpoint:
  // fetch('/api/log-safety-event', {
  //   method: 'POST',
  //   body: JSON.stringify({ eventType, reason, timestamp: new Date() })
  // });
};
