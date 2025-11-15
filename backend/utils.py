"""
Utility functions for Sprint Kit.
All external API calls are wrapped with comprehensive safety checks.
UPDATED: Pass methodology guidance to prompts for context-aware task generation.
"""

import logging
import json
from io import BytesIO
from datetime import datetime
from anthropic import Anthropic
from config import (
    CLAUDE_API_KEY,
    CLAUDE_MODEL,
    MAX_TOKENS
)
from prompts import (
    DETECT_PROJECT_TYPE_PROMPT,
    TASK_BREAKDOWN_PROMPT,
    TIME_ESTIMATION_PROMPT,
    ADAPTIVE_REFLECTION_PROMPT,
    REFLECTION_INSIGHT_PROMPT,
    get_fallback_tasks,
    get_methodology_guidance
)
from safety import (
    validate_before_claude_call,
    validate_claude_response,
    handle_error_safely
)

logger = logging.getLogger(__name__)

def setup_error_logging():
    """Log Claude failures with timestamp to local file."""
    try:
        handler = logging.FileHandler('claude_errors.log')
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    except Exception as e:
        logger.warning(f"Could not setup file logging: {e}")

setup_error_logging()


# ===== LAYER 1: PROJECT TYPE DETECTION =====

def detect_project_type(project_title: str, project_description: str) -> str:
    """
    Detect project type (hardware, software, creative, event, research, other).

    Returns: project_type string
    """
    response = call_claude_safely(
        DETECT_PROJECT_TYPE_PROMPT,
        project_title=project_title,
        project_description=project_description
    )

    if not response["success"]:
        logger.warning("Project type detection failed, defaulting to 'other'")
        return "other"

    try:
        result = parse_json_response(response["data"])
        project_type = result.get("type", "other")
        logger.info(f"Detected project type: {project_type}")
        return project_type
    except Exception as e:
        logger.error(f"Failed to parse project type: {e}")
        return "other"


# ===== LAYER 2: TASK GENERATION (Context-Aware, Methodology-Based) =====

def generate_tasks_with_context(
    project_title: str,
    project_description: str,
    project_type: str,
    experience_level: str,
    team_size: str
) -> dict:
    """
    Generate type-specific tasks scaled by experience level and team size.
    Uses methodology guidance to ensure tasks match project type.

    Returns: {
        "tasks": list of task dicts,
        "source": "claude" or "fallback",
        "message": str or None
    }
    """
    # Get methodology guidance based on project type, experience, team size
    methodology_guidance = get_methodology_guidance(project_type, experience_level, team_size)

    response = call_claude_safely(
        TASK_BREAKDOWN_PROMPT,
        project_title=project_title,
        project_description=project_description,
        project_type=project_type,
        experience_level=experience_level,
        team_size=team_size,
        methodology_guidance=methodology_guidance
    )

    if not response["success"]:
        logger.warning(f"Task generation failed, using {project_type} fallback")
        return {
            "tasks": get_fallback_tasks(project_type),
            "source": "fallback",
            "message": "Using template tasks. Edit them to match your project!"
        }

    try:
        tasks = parse_json_response(response["data"])
        if isinstance(tasks, list) and len(tasks) > 0:
            return {
                "tasks": tasks,
                "source": "claude",
                "message": None
            }
    except Exception as e:
        logger.error(f"Failed to parse tasks: {e}")

    return {
        "tasks": get_fallback_tasks(project_type),
        "source": "fallback",
        "message": "Using template tasks. You can edit them!"
    }


# ===== LAYER 2B: TIME ESTIMATION (Context-Aware) =====

def estimate_timeline_with_context(
    tasks: list,
    deadline_days: int,
    experience_level: str,
    team_size: str
) -> dict:
    """
    Estimate if timeline is realistic based on experience and team size.
    Accounts for parallel work with larger teams and capacity based on experience.

    Returns: {
        "total_hours": int,
        "available_hours": int,
        "realistic": bool,
        "status": "good/tight/too_tight",
        "message": str,
        "suggestion": str or None,
        "explanation": str (HOW we calculated this)
    }
    """
    response = call_claude_safely(
        TIME_ESTIMATION_PROMPT,
        tasks_json=json.dumps(tasks),
        deadline_days=deadline_days,
        experience_level=experience_level,
        team_size=team_size
    )

    if not response["success"]:
        logger.warning("Timeline estimation failed")
        return {
            "total_hours": 0,
            "available_hours": 0,
            "realistic": False,
            "status": "unknown",
            "message": "Could not estimate timeline",
            "suggestion": None,
            "explanation": "Unable to calculate at this time."
        }

    try:
        result = parse_json_response(response["data"])

        # Fix #8: Validate that parse succeeded before accessing keys
        if not result or not isinstance(result, dict):
            logger.error("JSON parse returned empty or invalid result")
            return {
                "total_hours": 0,
                "available_hours": 0,
                "realistic": False,
                "status": "unknown",
                "message": "Could not estimate timeline",
                "suggestion": None,
                "explanation": "Unable to calculate at this time."
            }

        # Add transparency explanation
        total = result.get("total_hours", 0)
        available = result.get("available_hours", 0)
        exp_level = experience_level.capitalize()
        hours_per_day = available // deadline_days if deadline_days > 0 else 0

        explanation = f"You have {deadline_days} days. For {exp_level.lower()}s, that's {hours_per_day}h per day = {available}h total. Your tasks = {total}h."

        result["explanation"] = explanation
        return result
    except Exception as e:
        logger.error(f"Failed to parse timeline: {e}")
        return {
            "total_hours": 0,
            "available_hours": 0,
            "realistic": False,
            "status": "unknown",
            "message": "Could not estimate timeline",
            "suggestion": None,
            "explanation": "Unable to calculate at this time."
        }


# ===== LAYER 3: ADAPTIVE REFLECTION PROMPTS =====

def generate_adaptive_reflection_prompts(
    project_type: str,
    project_title: str,
    what_went_well: str,
    what_was_hard: str,
    what_learned: str
) -> dict:
    """
    Generate 3 custom reflection prompts based on student's project.
    Customized to project type and what student has already shared.

    Returns: {
        "prompts": list of 3 custom prompts,
        "source": "claude" or "generic"
    }
    """
    response = call_claude_safely(
        ADAPTIVE_REFLECTION_PROMPT,
        project_type=project_type,
        project_title=project_title,
        what_went_well=what_went_well,
        what_was_hard=what_was_hard,
        what_learned=what_learned
    )

    if not response["success"]:
        logger.warning("Adaptive prompts generation failed, using generic")
        return {
            "prompts": [
                "What went well with your project?",
                "What was challenging?",
                "What did you learn?"
            ],
            "source": "generic"
        }

    try:
        result = parse_json_response(response["data"])
        if "prompts" in result and isinstance(result["prompts"], list):
            return {
                "prompts": result["prompts"],
                "source": "claude"
            }
    except Exception as e:
        logger.error(f"Failed to parse adaptive prompts: {e}")

    return {
        "prompts": [
            "What went well with your project?",
            "What was challenging?",
            "What did you learn?"
        ],
        "source": "generic"
    }


# ===== CLAUDE SAFETY WRAPPER =====

def call_claude_safely(prompt_template: str, **kwargs) -> dict:
    """
    Call Claude with comprehensive safety checks before and after.
    This is the ONLY place Claude gets called. All safety happens here.

    Returns: {
        "success": bool,
        "data": str or None (Claude's response),
        "user_message": str or None (error message if failed)
    }
    """
    # PRE-CALL: Format prompt with kwargs
    try:
        input_text = prompt_template.format(**kwargs)
    except KeyError as e:
        logger.error(f"Prompt template missing key: {e}")
        return {
            "success": False,
            "data": None,
            "user_message": "Prompt formatting error"
        }

    # PRE-CALL: Check input safety
    pre_validation = validate_before_claude_call(input_text)

    if not pre_validation["safe"]:
        logger.warning(f"Pre-validation failed: {pre_validation['reason']}")
        return {
            "success": False,
            "data": None,
            "user_message": "Request contains unsafe content"
        }

    # CLAUDE CALL
    try:
        if not CLAUDE_API_KEY:
            raise ValueError("Claude API key not configured")

        client = Anthropic(api_key=CLAUDE_API_KEY)
        message = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS,
            messages=[{"role": "user", "content": input_text}]
        )
        response_text = message.content[0].text
        logger.info("Claude API call successful")

    except Exception as e:
        error_response = handle_error_safely(e, "call_claude_safely")
        logger.error(f"Claude API error: {error_response['internal_error']}")
        return {
            "success": False,
            "data": None,
            "user_message": error_response["user_message"]
        }

    # POST-CALL: Validate response
    response_validation = validate_claude_response(response_text)

    if not response_validation["safe"]:
        logger.warning(f"Response validation failed: {response_validation['reason']}")
        return {
            "success": False,
            "data": None,
            "user_message": "Response validation failed. Using template instead."
        }

    return {
        "success": True,
        "data": response_text,
        "user_message": None
    }


# ===== REFLECTION INSIGHTS (Analyzes actual reflection content) =====

def generate_reflection_insights(reflection_data: dict) -> dict:
    """
    Generate personalized insights from student reflection.
    Analyzes actual reflection answers to generate specific, relevant insights.

    Args:
        reflection_data: Dict with went_well, was_hard, learned, project_title, project_type

    Returns: {
        "insights": list of insight strings,
        "source": "claude" or "generic"
    }
    """

    reflection_text = f"{reflection_data.get('went_well', '')} {reflection_data.get('was_hard', '')} {reflection_data.get('learned', '')}"
    pre_validation = validate_before_claude_call(reflection_text)

    if not pre_validation["safe"]:
        logger.warning("Reflection input failed safety check")
        return {
            "insights": [
                "You worked on a project and completed it.",
                "You reflected on your experience.",
                "Keep building these skills!"
            ],
            "source": "generic"
        }

    response = call_claude_safely(
        REFLECTION_INSIGHT_PROMPT,
        project_title=reflection_data.get('project_title', 'Project'),
        project_type=reflection_data.get('project_type', 'other'),
        what_went_well=reflection_data.get('went_well', ''),
        what_was_hard=reflection_data.get('was_hard', ''),
        what_learned=reflection_data.get('learned', '')
    )

    if not response["success"]:
        logger.warning("Reflection insights generation failed, using generic")
        return {
            "insights": [
                "You worked on a project and completed it.",
                "You reflected on your experience.",
                "Keep building these skills!"
            ],
            "source": "generic"
        }

    try:
        insights_data = parse_json_response(response["data"])
        if "insights" in insights_data and isinstance(insights_data["insights"], list):
            return {
                "insights": insights_data["insights"],
                "source": "claude"
            }
    except Exception as e:
        logger.error(f"Failed to parse insights: {e}")

    return {
        "insights": [
            "You worked on a project and completed it.",
            "You reflected on your experience.",
            "Keep building these skills!"
        ],
        "source": "generic"
    }


# ===== RESPONSE PARSING =====

def parse_json_response(response_text: str) -> dict:
    """Safely parse JSON from Claude response."""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text

            return json.loads(json_str)
        except (json.JSONDecodeError, IndexError) as e:
            logger.error(f"Could not parse JSON: {e}")
            return {}


# ===== PDF EXPORT =====

def export_project_to_pdf(project_data: dict) -> bytes:
    """Generate PDF of completed project."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from datetime import datetime

        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch,
            leftMargin=0.5*inch,
            rightMargin=0.5*inch
        )
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=1
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=10,
            spaceBefore=12
        )

        story.append(Paragraph(f"<b>{project_data.get('title', 'Project Plan')}</b>", title_style))
        story.append(Spacer(1, 0.2*inch))

        goal = project_data.get('goals', {}).get('goal', 'N/A') if isinstance(project_data.get('goals', {}), dict) else 'N/A'
        story.append(Paragraph(f"<b>Goal:</b> {goal}", styles['Normal']))

        team = ", ".join(project_data.get('team_members', [])) or "Solo"
        story.append(Paragraph(f"<b>Team:</b> {team}", styles['Normal']))
        story.append(Paragraph(f"<b>Created:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))

        story.append(Paragraph("📋 Project Tasks", heading_style))

        tasks_data = [['Task', 'Hours', 'Difficulty', 'Assigned To']]
        for task in project_data.get('tasks', []):
            tasks_data.append([
                task.get('name', 'Unnamed'),
                str(task.get('hours', '?')),
                task.get('difficulty', 'Medium'),
                task.get('assigned_to', 'Unassigned')
            ])

        tasks_table = Table(tasks_data, colWidths=[2.2*inch, 0.6*inch, 0.9*inch, 1.3*inch])
        tasks_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9)
        ]))
        story.append(tasks_table)
        story.append(Spacer(1, 0.3*inch))

        story.append(Paragraph("⏱️ Timeline", heading_style))
        timeline = project_data.get('timeline', {})
        if isinstance(timeline, dict):
            story.append(Paragraph(f"<b>Expected Duration:</b> {timeline.get('total_hours', '?')} hours", styles['Normal']))
            story.append(Paragraph(f"<b>Deadline:</b> {timeline.get('deadline', 'N/A')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))

        story.append(Paragraph("🤔 What We Learned", heading_style))
        reflection = project_data.get('reflection', {})
        if isinstance(reflection, dict):
            story.append(Paragraph(f"<b>What Went Well:</b>", styles['Normal']))
            story.append(Paragraph(reflection.get('went_well', 'N/A'), styles['Normal']))
            story.append(Spacer(1, 0.15*inch))

            story.append(Paragraph(f"<b>What Was Hard:</b>", styles['Normal']))
            story.append(Paragraph(reflection.get('was_hard', 'N/A'), styles['Normal']))
            story.append(Spacer(1, 0.15*inch))

            story.append(Paragraph(f"<b>What I Learned:</b>", styles['Normal']))
            story.append(Paragraph(reflection.get('learned', 'N/A'), styles['Normal']))
        story.append(Spacer(1, 0.3*inch))

        insights = project_data.get('insights', [])
        if insights and isinstance(insights, list):
            story.append(Paragraph("💡 Key Insights", heading_style))
            for insight in insights:
                story.append(Paragraph(f"• {insight}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))

        badges = project_data.get('badges', [])
        if badges and isinstance(badges, list):
            story.append(Paragraph("🏆 Badges Earned", heading_style))
            for badge in badges:
                if isinstance(badge, dict):
                    story.append(Paragraph(
                        f"<b>{badge.get('name', 'Badge')}:</b> {badge.get('reason', '')}",
                        styles['Normal']
                    ))

        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()

    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise ValueError("Could not generate PDF")
