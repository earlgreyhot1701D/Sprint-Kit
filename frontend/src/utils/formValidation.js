/**
 * Form validation utilities for Sprint Kit
 * Centralized form limits and validation logic
 */

export const FORM_LIMITS = {
  projectTitle: { min: 3, max: 100 },
  projectDescription: { min: 10, max: 500 },
  goal: { min: 5, max: 200 },
  successCriteria: { min: 5, max: 200 },
  reflection: { min: 5, soft: 50, max: 500 },  // soft = encouragement threshold
  taskName: { min: 3, max: 100 },
};

/**
 * Show soft prompt at character threshold (encouragement, not blocking)
 * @param {number} charCount - Current character count
 * @param {number} softLimit - Soft limit threshold
 * @returns {boolean} - True if should show soft prompt
 */
export function showSoftPrompt(charCount, softLimit) {
  return charCount > 0 && charCount < softLimit;
}

/**
 * Validate field against limits
 * @param {string} value - Field value
 * @param {string} fieldType - Type of field (from FORM_LIMITS keys)
 * @returns {object} - { valid: bool, message: str }
 */
export function validateField(value, fieldType) {
  const limits = FORM_LIMITS[fieldType];
  
  if (!limits) {
    return { valid: true, message: '' };
  }
  
  if (value.length < limits.min) {
    return {
      valid: false,
      message: `Say a bit more (at least ${limits.min} characters)`
    };
  }
  
  if (value.length > limits.max) {
    return {
      valid: false,
      message: `Too long (max ${limits.max} characters)`
    };
  }
  
  return { valid: true, message: '' };
}

/**
 * Get error message for field type
 * @param {string} fieldType - Type of field
 * @returns {object} - { minMessage: str, maxMessage: str, softMessage: str }
 */
export function getFieldMessages(fieldType) {
  const limits = FORM_LIMITS[fieldType];
  
  if (!limits) {
    return {
      minMessage: 'Say a bit more',
      maxMessage: 'Too long',
      softMessage: 'Keep going!'
    };
  }
  
  return {
    minMessage: `Say a bit more (${limits.min}+ characters)`,
    maxMessage: `Max ${limits.max} characters`,
    softMessage: `Tell us more! (${limits.soft}+ characters)`
  };
}
