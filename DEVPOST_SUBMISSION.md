# DevPost Submission - Sprint Kit

## Project Title
**Sprint Kit: AI-Powered Project Planner for Middle Schoolers**

## Tagline
AI scaffolds real project planning skills. Students learn decomposition, estimation, collaboration, and reflection during the optimal metacognitive development window (ages 12-15).

---

## Project Description

### What It Does

Sprint Kit is an AI-powered project planner built from the ground up for middle school students (grades 6-8). It guides students through a 7-step workflow to plan school projects while teaching four core skills: breaking big goals into steps, estimating realistic timelines, collaborating effectively, and reflecting on learning.

Unlike generic project tools adapted for kids, Sprint Kit is grounded in **Gold Standard Project-Based Learning (PBL)** — a research-backed framework used by educators for 30+ years.

### How It Works

**The 7-Step Journey:**

1. **Create Project** - Students define their project and team
2. **Brainstorm Ideas** - Explore possibilities without judgment
3. **Set Goals** - Define success criteria with clarity
4. **Break It Down** ⭐ - AI scaffolds task decomposition (students see examples, then practice)
5. **Assign Roles & Timeline** - Distribute work and validate timeline realism
6. **Reflection** ⭐ - AI generates personalized insights; students earn badges for real learning
7. **Export** - PDF or text summary for sharing/portfolios

**Key Innovation: Authentic Gamification**

Rather than points and streaks, Sprint Kit awards three research-backed badges tied to actual skill demonstration:

- 🧩 **"I Can Break It Down"** - Awarded when decomposition is evident
- ⏰ **"Planner Power"** - Awarded when timeline estimates are accurate (±20%)
- 👥 **"Team Player"** - Awarded when collaboration is demonstrated

Research shows middle schoolers detect manipulation. Authentic badges celebrating real learning work. Generic point systems don't.

### Why It Matters

**The Metacognitive Window**

Most growth of metacognitive ability happens between ages 12-15. When teachers cultivate students' abilities to reflect on, monitor, and evaluate their learning strategies, young people become more self-reliant, flexible, and productive. This window closes. Sprint Kit captures it.

**Educational Impact**

Students using Gold Standard PBL frameworks show:
- 7+ months additional academic progress (metacognitive reflection)
- Improved project completion rates
- Better time management skills
- Stronger collaboration behaviors

**Research-Backed Design**

Every feature aligns with the 7 essentials of Gold Standard PBL:
1. Challenging problem/question → "Create Project" step
2. Sustained inquiry → 7-step flow (not a one-off)
3. Authenticity → Real projects, real teams, exported artifacts
4. Student voice & choice → Students choose projects, define success
5. Reflection → Embedded at Step 6, not afterthought
6. Critique & revision → Students edit AI-generated tasks, get timeline feedback
7. Public product → PDF export = real, shareable deliverable

### Who It's For

- **Middle School Students (6-8)** - Learning to plan projects, think about thinking
- **Teachers** - Need tools grounded in pedagogy, not guessing
- **Parents** - Want to see kids developing real life skills
- **Districts** - Looking for evidence-based learning tools

### What Inspired It

During research on project-based learning for middle school, we discovered a gap: Most project planning tools were built for adults and adapted for kids. They use adult jargon, don't teach decomposition, and treat gamification as reward mechanics rather than learning celebration.

At the same time, neuroscience research showed ages 12-15 are *the* window for metacognitive development. If we don't teach reflection and strategic thinking during this period, it's harder later.

**Sprint Kit was built to fill that gap: pedagogically grounded, age-appropriate, safety-first.**

---

## Technologies Used

- **Backend**: Flask (Python), Anthropic Claude API, reportlab (PDF generation)
- **Frontend**: React 18, Tailwind CSS, Axios
- **Testing**: pytest (backend), comprehensive safety tests
- **Architecture**: REST API, in-memory session state (no database for MVP)

### Why These Choices

- **Flask**: Lightweight, easy to reason about, perfect for a 48-hour build
- **Claude API**: Advanced language model for intelligent task scaffolding
- **React 18**: Fast, component-based, excellent for multi-step forms
- **Tailwind**: Responsive design out of box, great for accessible UI

### Notable Implementation Details

- **Safety-First**: Every Claude call wrapped in validation layer (prompt injection detection, PII checking, jailbreak detection)
- **Fallback Behavior**: If Claude fails, app uses template tasks. Always works.
- **Grade-Appropriate Language**: All student-facing text at 6-8 grade reading level
- **No Data Collection**: COPPA compliant—session only, no persistence, deleted on browser close

---

## Track

**Make Learning Fun** (Gamify the Learning Journey)

Sprint Kit uses authentic gamification (real badges for real learning) to make project planning engaging, not through empty points but through celebrating actual skill development.

---

## Judging Alignment

### Educational Impact ⭐⭐⭐
- Grounded in Gold Standard PBL (30+ years research)
- Teaches 4 core skills during optimal metacognitive window
- Measurable learning outcomes (badges require skill demonstration)

### Creativity & Innovation ⭐⭐⭐
- AI scaffolding for decomposition (unique approach)
- Authentic badges vs. pointification (research-backed design choice)
- Grade-appropriate, age-appropriate language throughout

### Technical Craft & Execution ⭐⭐⭐
- Modular, testable code (pytest with 15+ tests)
- Safety layer at every step (prompt injection, PII, jailbreak detection)
- Error handling and fallback behavior (app always works)

### Design & UX ⭐⭐⭐
- Clean, intuitive interface
- Progress visualization (step counter + progress bar)
- Accessible color scheme and typography

### Community & Accessibility ⭐⭐⭐
- No leaderboards (research shows competition harms collaboration at this age)
- Privacy-first (COPPA compliant, zero data collection)
- Inclusive language, age-appropriate tone
- Post-MVP roadmap includes accessibility features

---

## How It Works (Technical Flow)

```
1. Student creates project → Validated locally + backend
2. AI breaks down project into tasks → Claude API with safety constraints
3. Timeline validated → Realistic? App warns if too tight
4. Team assigned → Workload balanced?
5. Student reflects → AI generates insights, badges awarded
6. PDF exported → Student has shareable project plan
```

**Safety at Every Layer:**
- Prompt injection detection (student can't jailbreak Claude)
- Response validation (PII checking on Claude output)
- Safe error messages (never expose system details)
- Fallback tasks (app works even if Claude fails)

---

## Demo

**[Link to 1-3 minute demo video on YouTube]**

Video shows:
- Full 7-step flow (40 seconds)
- AI task breakdown in action (20 seconds)
- Reflection insights generation (15 seconds)
- PDF export (10 seconds)
- Why it matters: Gold Standard PBL alignment (30 seconds)

---

## GitHub Repository

**[Public GitHub link]**

- Clean, modular code
- Comprehensive README
- Safety framework documented
- Tests passing (pytest)
- Ready to clone and run

---

## Future Vision

Sprint Kit is Phase 1. Future versions will include:

- Teacher dashboard (see student projects, standards alignment)
- Database persistence + authentication
- Real-time collaboration
- LMS integration (Google Classroom, Canvas)
- Accessibility features (text-to-speech, dyslexia font)
- Mobile app

But **Phase 1 is focused**: 7-step flow, Claude scaffolding, authentic badges, safety-first.

---

## Team

- **Product/Design**: Focus on educational pedagogy and age-appropriateness
- **Backend**: Flask, safety layer, Claude integration, PDF generation
- **Frontend**: React, component architecture, UX polish

---

## Key Insight

**Middle schoolers don't need another game. They need real skills taught at the moment they're most developmentally ready to learn them.**

Sprint Kit teaches project planning, decomposition, estimation, collaboration, and reflection—skills that transfer to college, careers, and life—during the metacognitive window when the brain is optimized to learn them.

That's not just a learning tool. That's educational responsibility.

---

## Final Note

This project was built with the conviction that building for children requires:
1. Research-backed pedagogy (not guessing)
2. Safety built in from day 1 (not bolted on)
3. Age-appropriate design (respecting who they are)
4. Authentic learning (celebrating real skill, not effort)

Sprint Kit demonstrates all four.

---

**Tech Stack**: Flask, React 18, Claude API, Tailwind CSS, pytest  
**Status**: MVP complete, ready for classroom pilots  
**License**: Open source (MIT)  
**Built for**: CS Girlies "Make Learning Cool Again" hackathon (Nov 14-16, 2025)
