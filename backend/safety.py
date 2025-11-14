"""
Safety utilities for Sprint Kit.
Centralizes all safety checks, validation, and logging.
CRITICAL: Child safety is non-negotiable.
"""

import logging
import re
from config import (
    DISALLOWED_KEYWORDS,
    OUT_OF_SCOPE_RESPONSE,
    PROMPT_INJECTION_KEYWORDS
)

# Setup safety logger
safety_logger = logging.getLogger("sprint_kit.safety")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - [SAFETY] %(levelname)s - %(message)s')
handler.setFormatter(formatter)
if not safety_logger.handlers:
    safety_logger.addHandler(handler)
safety_logger.setLevel(logging.WARNING)


def is_request_in_scope(user_input: str) -> dict:
    """
    Check if user input is appropriate for Sprint Kit.
    
    Returns: 
        {
            "in_scope": bool,
            "reason": str,
            "should_respond": bool,
            "response": str or None
        }
    """
    input_lower = user_input.lower()
    
    # Check for disallowed keywords
    for keyword in DISALLOWED_KEYWORDS:
        if keyword in input_lower:
            safety_logger.warning(f"Disallowed keyword detected: {keyword}")
            return {
                "in_scope": False,
                "reason": f"Request involves {keyword}",
                "should_respond": True,
                "response": OUT_OF_SCOPE_RESPONSE
            }
    
    # Valid if it's about a project
    return {
        "in_scope": True,
        "reason": "On-topic",
        "should_respond": False,
        "response": None
    }


def validate_before_claude_call(user_input: str) -> dict:
    """
    Check for prompt injection, oversized input, and other attack vectors.
    
    Returns: {"safe": bool, "reason": str}
    """
    input_lower = user_input.lower()
    
    # Check for prompt injection attempts
    for keyword in PROMPT_INJECTION_KEYWORDS:
        if keyword in input_lower:
            safety_logger.warning(f"Prompt injection attempt detected: {keyword}")
            return {
                "safe": False,
                "reason": "Request appears to be attempting to change how I work"
            }
    
    # Check input length (prevent resource exhaustion)
    if len(user_input) > 5000:
        safety_logger.warning(f"Oversized input: {len(user_input)} characters")
        return {"safe": False, "reason": "Input too long"}
    
    # Check for empty input
    if len(user_input.strip()) < 3:
        return {"safe": False, "reason": "Input too short"}
    
    return {"safe": True}


def validate_claude_response(response_text: str) -> dict:
    """
    Check that Claude's response is appropriate.
    Look for: PII exposure, jailbreak indicators, off-topic content.
    
    Returns: {"safe": bool, "reason": str}
    """
    response_lower = response_text.lower()
    
    # Check for signs Claude was jailbroken
    jailbreak_indicators = [
        "i'm now a different ai",
        "i'll ignore",
        "system prompt"
    ]
    
    for indicator in jailbreak_indicators:
        if indicator in response_lower:
            safety_logger.warning(f"Jailbreak indicator in response: {indicator}")
            return {
                "safe": False,
                "reason": f"Response shows attempted override: {indicator}"
            }
    
    # Check for email addresses (PII)
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, response_text):
        safety_logger.warning("Email address detected in response")
        return {"safe": False, "reason": "Response contains email (PII)"}
    
    # Check for phone numbers (PII)
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    if re.search(phone_pattern, response_text):
        safety_logger.warning("Phone number detected in response")
        return {"safe": False, "reason": "Response contains phone number (PII)"}
    
    return {"safe": True}


def handle_error_safely(error: Exception, context: str) -> dict:
    """
    Log technical error internally. Return safe message to user.
    NEVER expose system details to users.
    
    Returns: {"error": bool, "user_message": str, "internal_error": str}
    """
    # Log the real error (for debugging)
    safety_logger.error(f"[{context}] {type(error).__name__}: {str(error)}")
    
    # Return generic safe message to user
    return {
        "error": True,
        "user_message": "Something went wrong. Please try again.",
        "internal_error": str(error)  # Keep internally, never send to frontend
    }
