"""
Utility functions for Sprint Kit.
All external API calls are wrapped with comprehensive safety checks.
"""

import logging
import json
from io import BytesIO
from datetime import datetime
from anthropic import Anthropic
from config import (
    CLAUDE_API_KEY,
    CLAUDE_MODEL,
    MAX_TOKENS,
    FALLBACK_TASKS,
    GENERIC_REFLECTION_INSIGHTS
)
from prompts import (
    TASK_BREAKDOWN_PROMPT,
    TIME_ESTIMATION_PROMPT,
    REFLECTION_INSIGHT_PROMPT
)
from safety import (
    validate_before_claude_call,
    validate_claude_response,
    handle_error_safely
)

logger = logging.getLogger(__name__)

# Setup file logging for Claude failures (for debugging)
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


# ===== CLAUDE API CALLS =====

def call_claude_safely(prompt_template: str, **kwargs) -> dict:
    """
    Call Claude with comprehensive safety checks before AND after.
    This is the ONLY place Claude gets called. All safety happens here.
    
    Returns: {
        "success": bool,
        "data": str or None,
        "user_message": str or None
    }
    """
    
    # PRE-CALL: Format prompt and check safety
    try:
        input_text = prompt_template.format(**kwargs)
    except KeyError as e:
        logger.error(f"Prompt format error: {e}")
        return {
            "success": False,
            "data": None,
            "user_message": "Something went wrong. Please try again."
        }
    
    pre_validation = validate_before_claude_call(input_text)
    
    if not pre_validation["safe"]:
        logger.warning(f"Pre-validation failed: {pre_validation['reason']}")
        return {
            "success": False,
            "data": None,
            "user_message": "That request isn't something I can help with."
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
    
    # POST-CALL: Validate response safety
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


def generate_tasks(project_goal: str, project_description: str) -> dict:
    """
    Break down project into student-friendly tasks using Claude.
    Falls back to template if Claude fails.
    
    Returns: {
        "tasks": list of task dicts,
        "source": "claude" or "fallback",
        "message": str or None
    }
    """
    
    response = call_claude_safely(
        TASK_BREAKDOWN_PROMPT,
        project_title=project_goal,
        project_description=project_description
    )
    
    if not response["success"]:
        logger.warning("Task generation failed, using fallback")
        return {
            "tasks": FALLBACK_TASKS,
            "source": "fallback",
            "message": "Using template tasks. Edit them to match your project!"
        }
    
    # Parse Claude response
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
    
    # If parsing failed, use fallback
    return {
        "tasks": FALLBACK_TASKS,
        "source": "fallback",
        "message": "Using template tasks. You can edit them!"
    }


def generate_reflection_insights(reflection_data: dict) -> dict:
    """
    Use Claude to generate personalized insights from student reflection.
    Falls back to generic insights if Claude fails.
    
    Args:
        reflection_data: Dict with went_well, was_hard, learned, project_title
    
    Returns: {
        "insights": list of insight strings,
        "source": "claude" or "generic"
    }
    """
    
    # Validate input
    reflection_text = f"{reflection_data.get('went_well', '')} {reflection_data.get('was_hard', '')} {reflection_data.get('learned', '')}"
    pre_validation = validate_before_claude_call(reflection_text)
    
    if not pre_validation["safe"]:
        logger.warning("Reflection input failed safety check")
        return {
            "insights": GENERIC_REFLECTION_INSIGHTS,
            "source": "generic"
        }
    
    response = call_claude_safely(
        REFLECTION_INSIGHT_PROMPT,
        project_title=reflection_data.get('project_title', 'Project'),
        what_went_well=reflection_data.get('went_well', ''),
        what_was_hard=reflection_data.get('was_hard', ''),
        what_learned=reflection_data.get('learned', '')
    )
    
    if not response["success"]:
        logger.warning("Reflection insights generation failed, using generic")
        return {
            "insights": GENERIC_REFLECTION_INSIGHTS,
            "source": "generic"
        }
    
    # Parse response
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
        "insights": GENERIC_REFLECTION_INSIGHTS,
        "source": "generic"
    }


# ===== RESPONSE PARSING =====

def parse_json_response(response_text: str) -> dict:
    """
    Safely parse JSON from Claude response.
    Handles malformed JSON gracefully.
    
    Returns: Parsed dict or empty dict
    """
    try:
        # Try direct parse first
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text
            
            return json.loads(json_str)
        except (json.JSONDecodeError, IndexError) as e:
            logger.error(f"Could not parse JSON from response: {e}")
            return {}


# ===== PDF EXPORT =====

def export_project_to_pdf(project_data: dict) -> bytes:
    """
    Generate a PDF of the completed project.
    Returns PDF as bytes (can be downloaded or emailed).
    
    Args:
        project_data: Dict with title, description, tasks, team, reflection, badges, insights
    
    Returns:
        PDF bytes
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
        from reportlab.lib.units import inch
        from reportlab.lib import colors
        from datetime import datetime
        
        # Create PDF in memory
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
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=1  # Center
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=10,
            spaceBefore=12
        )
        
        # ===== TITLE =====
        story.append(Paragraph(f"<b>{project_data.get('title', 'Project Plan')}</b>", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # ===== METADATA =====
        goal = project_data.get('goals', {}).get('goal', 'N/A') if isinstance(project_data.get('goals', {}), dict) else 'N/A'
        story.append(Paragraph(f"<b>Goal:</b> {goal}", styles['Normal']))
        
        team = ", ".join(project_data.get('team_members', [])) or "Solo"
        story.append(Paragraph(f"<b>Team:</b> {team}", styles['Normal']))
        story.append(Paragraph(f"<b>Created:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # ===== TASKS TABLE =====
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
        
        # ===== TIMELINE =====
        story.append(Paragraph("⏱️ Timeline", heading_style))
        timeline = project_data.get('timeline', {})
        if isinstance(timeline, dict):
            story.append(Paragraph(f"<b>Expected Duration:</b> {timeline.get('total_hours', '?')} hours", styles['Normal']))
            story.append(Paragraph(f"<b>Deadline:</b> {timeline.get('deadline', 'N/A')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # ===== REFLECTION =====
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
        
        # ===== INSIGHTS =====
        insights = project_data.get('insights', [])
        if insights and isinstance(insights, list):
            story.append(Paragraph("💡 Key Insights", heading_style))
            for insight in insights:
                story.append(Paragraph(f"• {insight}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # ===== BADGES =====
        badges = project_data.get('badges', [])
        if badges and isinstance(badges, list):
            story.append(Paragraph("🏆 Badges Earned", heading_style))
            for badge in badges:
                if isinstance(badge, dict):
                    story.append(Paragraph(
                        f"<b>{badge.get('name', 'Badge')}:</b> {badge.get('reason', '')}",
                        styles['Normal']
                    ))
        
        # ===== BUILD PDF =====
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
    
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise ValueError("Could not generate PDF")


def get_fallback_tasks() -> list:
    """Return fallback tasks if Claude fails."""
    return FALLBACK_TASKS
