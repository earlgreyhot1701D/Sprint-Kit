# Sprint Kit 🚀

**AI-powered project planner built for middle school students (grades 6-8) teaching real project management skills through the lens of Gold Standard PBL.**

---
# Sprint Kit: Project Story

## The Problem

Middle schoolers need real project management skills—decomposition, estimation, collaboration, reflection—to succeed not just in school, but throughout their lives. Yet they're rarely taught these skills explicitly. Most project planning tools fail them in two ways:

1. **Adult jargon barrier**: Tools use terminology like "deliverables," "stakeholders," and "synergy" that alienates 12-14 year olds
2. **False choice**: Either tools infantilize students OR throw complex concepts at them with no scaffolding

Result: Students don't learn project planning. They just fill out forms.

And critically, ages 12-15 are the *optimal window* for this learning—metacognitive ability (the ability to think about their own thinking) grows fastest during middle school. If we don't teach these skills now, they're harder to develop later.

## How I'm Solving It

Sprint Kit uses **AI scaffolding** to bridge this gap. Instead of generic task templates, Claude detects each student's project type (hardware, software, creative, research, event) and generates methodology-specific guidance. Students see *what good looks like*, then practice by editing tasks, assigning roles, and reflecting on what they learned.

The key insight: **AI as teacher's aide, not replacement**. Claude models thinking; students do the learning.

---

## Inspiration

I didn't learn real project management skills until college. Decomposition, estimation, collaboration, reflection—nobody taught me these in middle school. I had to figure them out the hard way through failed projects and trial-and-error.

Now I work in government—at the Superior Court in public service—and I see the same problem everywhere: people struggle with project planning because they never learned it when their brains were optimized to learn it. Ages 12-15 is when metacognitive ability (thinking about your own thinking) grows fastest, but that's exactly when schools *don't* teach these skills explicitly.

I realized: why wait until college or a career in public service to learn this? Why not teach it when kids can actually absorb it deeply? These skills matter whether you're running a court system or running a school project.

That's when I decided to build Sprint Kit—a tool that teaches project management at the optimal moment, in language kids understand, with AI scaffolding instead of corporate jargon.

---

## What It Does

Sprint Kit guides students through a 7-step project planning journey:

1. **Create Project** - Define your project and team
2. **Brainstorm Ideas** - Explore possibilities freely
3. **Set Goals** - Define success criteria
4. **Break It Down** ⭐ - AI scaffolds task decomposition (students learn real planning)
5. **Assign Roles & Timeline** - Distribute work and validate timeline realism
6. **Reflect** ⭐ - Metacognition embedded with AI-generated insights
7. **Export** - PDF or text summary of project plan

## Why It Matters

### Educational Foundation

Sprint Kit is grounded in the **Gold Standard Project-Based Learning (PBL)** framework validated through 30+ years of education research by the Buck Institute. It explicitly teaches four core skills:

- **🧩 Decomposition** ("Break It Down") - Breaking big goals into manageable steps
- **⏰ Estimation** ("Time It Takes") - Realistic time planning
- **👥 Collaboration** ("Team Up") - Working effectively with others
- **🤔 Reflection** ("What I Learned") - Metacognitive thinking about learning

Research & Pedagogy
This project is grounded in rigorous educational research, not guessing.
Sprint Kit aligns with Gold Standard Project-Based Learning (validated through 30+ years of research by the Buck Institute for Education) and targets the critical developmental window (ages 12-15) when metacognitive ability undergoes rapid growth.
See the full pedagogy whitepaper: docs/PEDAGOGY_WHITEPAPER.md
Key research backing:

Metacognitive ability growth peaks 12-15 (Price-Mitchell, 2015)
Project-based learning: 30+ years evidence (Larmer & Mergendoller, 2015)
Gamification effect size 0.822 for learning (Huang et al., 2019)
Authentic badges > generic points (Sailer & Homner, 2020)

### Why Ages 12-15?

Research shows most metacognitive ability growth happens between ages 12-15. Sprint Kit captures this critical window when students develop the ability to think about their own thinking—a skill that improves academic performance by 7+ months.

### Authentic Gamification (Not "Pointification")

Unlike point-based gamification, Sprint Kit awards **three research-backed badges tied to real skill demonstration**:

#### Badge 1: 🧩 "I Can Break It Down"
**Awarded when:**
- Student mentions decomposition in reflection ("task", "step", "break", "smaller", "split", "chunk", "divided")
- **OR** student edited the AI-generated tasks (demonstrates active decomposition practice)
- **AND** reflection is substantive (minimum 20 characters)

**Reason shown**: "You learned how to split big goals into manageable tasks."

**Why this matters**: Decomposition is a core computer science and project management skill. If students can articulate it in reflection, they're internalizing the concept.

#### Badge 2: ⏰ "Planner Power"
**Awarded when:**
- Timeline estimates are accurate (within ±20% of actual time)
- Calculation: `0.8 <= timeline_accuracy <= 1.2`

**Reason shown**: "You're good at guessing how long things take!"

**Why this matters**: Realistic time estimation is critical for project success. This badge celebrates metacognitive awareness of task difficulty.

#### Badge 3: 👥 "Team Player"
**Awarded when:**
- Student mentions collaboration in reflection ("team", "together", "helped", "worked with", "partner", "group", "collaborated")
- **AND** reflection is substantive (minimum 20 characters)

**Reason shown**: "Your teamwork and collaboration made the difference!"

**Why this matters**: Collaboration is a 21st-century skill. This badge celebrates students who reflect on teamwork dynamics.

---

**Key Design Principle**: Badges are earned based on **actual learning demonstrated in reflection**, not participation trophies. Middle schoolers detect manipulation. Real learning celebrations work.

**Code**: Badge logic in `backend/core_logic.py:award_badges()` (lines 259-336)

## How to Run

### Prerequisites

- Python 3.8+
- Node.js 14+
- Claude API key from Anthropic

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your CLAUDE_API_KEY

# Run tests (optional but recommended)
pytest tests/ -v

# Start server
python app.py
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on `http://localhost:3000`

### Testing Both Together

```
Backend: python app.py
Frontend: npm start

Visit http://localhost:3000 in browser
Complete full 7-step flow to test end-to-end
```

## Project Structure

```
sprint-kit/
├── backend/                      # Flask API
│   ├── app.py                    # Entry point + endpoints
│   ├── config.py                 # Configuration + safety config
│   ├── prompts.py                # All Claude prompts (with safety)
│   ├── core_logic.py             # Business logic (no external deps)
│   ├── utils.py                  # Claude integration + PDF export
│   ├── safety.py                 # Safety validation layer
│   ├── requirements.txt          # Python dependencies
│   └── tests/
│       ├── test_core_logic.py    # Unit tests for logic
│       └── test_safety.py        # Safety guardrail tests
│
├── frontend/                     # React 18 application
│   ├── src/
│   │   ├── App.jsx               # Main routing + state
│   │   ├── index.jsx             # React entry
│   │   ├── components/
│   │   │   ├── ProjectCreate.jsx # Step 1
│   │   │   ├── Brainstorm.jsx    # Step 2
│   │   │   ├── SetGoals.jsx      # Step 3
│   │   │   ├── BreakItDown.jsx   # Step 4 (Claude integration)
│   │   │   ├── AssignRoles.jsx   # Step 5
│   │   │   ├── Reflection.jsx    # Step 6 (Insights + Badges)
│   │   │   ├── Export.jsx        # Step 7 (PDF + Text)
│   │   │   └── Navigation.jsx    # Navigation footer
│   │   ├── utils/
│   │   │   ├── api.js            # Backend API client
│   │   │   └── safety.js         # Client-side safety checks
│   │   └── styles/
│   │       └── App.css           # All styling (Tailwind-based)
│   ├── package.json              # Node dependencies
│   └── public/                   # Static files
│
├── docs/                         # Documentation
│   ├── PEDAGOGY_WHITEPAPER.md    # Research backing + PBL alignment
│   ├── CHILD_SAFETY_FRAMEWORK.md # Safety implementation details
│   └── PRIVACY_POLICY.md         # Child-friendly privacy policy
│
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## Technical Architecture

### 3-Layer AI Personalization System ⭐

Sprint Kit doesn't use generic templates. It uses a **3-layer personalization system** to generate methodology-specific guidance:

#### **Layer 1: Project Type Detection**

Claude analyzes the project title and description to identify the project type:
- **Hardware**: Building robots, physical prototypes, electronics
- **Software**: Coding apps, games, websites
- **Creative**: Videos, art projects, music, writing
- **Event**: Organizing fundraisers, school events, clubs
- **Research**: Papers, investigations, experiments

**Purpose**: Tasks should match the actual methodology (hardware projects need materials gathering, research projects need source evaluation)

**Code**: `backend/prompts.py:DETECT_PROJECT_TYPE_PROMPT`

#### **Layer 2: Context-Aware Task Generation**

Claude receives:
- **Project type** (from Layer 1)
- **Team experience level** (beginner, intermediate, advanced)
- **Team size** (1 person, 2-3 people, 4+ people)

Then generates **methodology-specific guidance**:

**Example: Research Project (Beginner, 2 people)**
```
Tasks include: finding sources, reading/analyzing, synthesizing findings,
writing report, presenting

Time estimates: Research 3-4h, Read/Analyze 2-3h, Write 2-3h, Present 1-2h

Specific guidance: "Mention types of sources (academic, news, interviews)
and citation approaches"
```

**Example: Hardware Project (Advanced, 4 people)**
```
Tasks include: gathering materials, planning/designing, building/assembling,
testing, troubleshooting

Time estimates: Materials 1-2h, Design 2-3h, Build 3-5h (scales with complexity)

Specific guidance: "Mention specific tools, materials, or safety considerations"
```

**Purpose**: Beginners get smaller, concrete steps. Advanced teams get larger integration challenges. Tasks scale to team size (1 person does everything; 4 people can work in parallel).

**Code**: `backend/prompts.py:get_methodology_guidance()` + `TASK_BREAKDOWN_PROMPT`

**Fallback**: If Claude fails, app uses type-specific templates from `FALLBACK_TASKS_BY_TYPE` (6 task sets, one per project type)

#### **Layer 3: Adaptive Reflection Prompts**

Claude generates **custom reflection prompts** based on:
- **Project type** (from Layer 1)
- **What the student said went well**
- **What the student said was hard**
- **What the student said they learned**

**Example: Research project on Constitution**
```
Custom prompts:
1. "What's your strategy for finding trustworthy sources about [topic]?"
2. "How did you decide which features to prioritize in your planning?"
3. "How will you organize your time to finish the research before the deadline?"
```

**Example: Hardware project (robot building)**
```
Custom prompts:
1. "How did you decide which materials you'll need for your project?"
2. "What made you break down the building into those specific tasks?"
3. "How will you test if each part works before putting it all together?"
```

**Purpose**: Metacognitive prompts are **specific to what the student is actually doing**, not generic questions.

**Code**: `backend/prompts.py:ADAPTIVE_REFLECTION_PROMPT`

---

### Backend: Flask + Claude API

- **Framework**: Flask (lightweight REST API)
- **AI Integration**: Anthropic Claude API via `anthropic` SDK
- **Safety**: Comprehensive validation layer (prompt injection, PII, jailbreak detection)
- **Testing**: pytest with 15+ safety and logic tests
- **Database**: In-memory (no persistence for MVP; data cleared on session end)

### Frontend: React 18 + Tailwind CSS

- **Framework**: React 18 with hooks
- **Styling**: Tailwind CSS (responsive, accessible)
- **API Client**: Axios for backend communication
- **State Management**: React useState (single source of truth in App.jsx)

### Claude Integration (Multi-Layer Safety)

```
User Input
    ↓
Layer 1: Validate (prompt injection check, length check)
    ↓
Layer 2: Call Claude API (with embedded safety constraints in prompt)
    ↓
Layer 3: Validate Response (PII check, jailbreak detection)
    ↓
Layer 4: Fallback to Template (if Claude fails or validation fails)
    ↓
Return to Frontend (always safe, always works)
```

**Key Design Principle**: Safety at *every* layer. If Claude response is unsafe, we use a type-specific fallback template instead. **The app always works, even if Claude is down.**

**Code**:
- Safety validation: `backend/safety.py` (all functions)
- Fallback tasks: `backend/prompts.py:get_fallback_tasks()`
- Integration: `backend/app.py` (all API endpoints)

## Safety & Privacy

### What We Collect
**Nothing.** Sprint Kit is COPPA-compliant:
- ❌ No personal data
- ❌ No email addresses
- ❌ No tracking
- ❌ No cookies
- ✅ Session data only (deleted on browser close)

### Safety Features
✅ **Prompt Injection Protection** - Blocks attempts to jailbreak Claude
✅ **Response Validation** - Checks for PII exposure
✅ **Out-of-Scope Refusal** - Won't help with homework/cheating
✅ **Safe Error Messages** - Never exposes system details to users
✅ **Fallback Behavior** - App works even if Claude fails
✅ **Logging & Monitoring** - Tracks safety events (no user data)

### For Parents & Educators

Sprint Kit is designed for grades 6-8 following child safety best practices:
- COPPA-compliant (no data collection)
- Refuses homework help requests
- Blocks personal/mental health questions
- Redirects to appropriate resources for crises

Questions? See `docs/CHILD_SAFETY_FRAMEWORK.md` for technical details.

## Judging Criteria Alignment

Sprint Kit is designed to excel across all 5 judging dimensions:

### 1. Educational Impact (0-25 pts)

**How Sprint Kit delivers:**
- ✅ **Research-backed pedagogy**: Gold Standard PBL (Buck Institute, 30+ years validation)
- ✅ **Optimal timing**: Ages 12-15 metacognitive development window (7+ months academic gains)
- ✅ **4 core skills taught**: Decomposition, estimation, collaboration, reflection
- ✅ **Authentic learning**: Students plan real projects, not hypothetical exercises
- ✅ **Measurable outcomes**: Badges awarded based on demonstrated learning (not participation)

**Evidence**: `docs/PEDAGOGY_WHITEPAPER.md` (full research citations)

### 2. Creativity & Innovation (0-25 pts)

**What makes Sprint Kit unique:**
- 🌟 **3-layer AI personalization** (not generic templates):
  - Layer 1: Project type detection (hardware vs research vs creative)
  - Layer 2: Context-aware task generation (scales to experience + team size)
  - Layer 3: Adaptive reflection prompts (specific to what student is doing)
- 🌟 **Authentic gamification**: Badges for real learning (not points for clicking)
- 🌟 **Methodology-specific guidance**: Research projects get source evaluation tasks; hardware projects get materials planning
- 🌟 **Safety-first AI design**: Multi-layer validation (before Claude, in prompts, after Claude, fallback)

**Code**: See "Technical Architecture" section above for implementation details

### 3. Technical Craft & Execution (0-25 pts)

**What demonstrates quality:**
- ✅ **Modular, testable code**: `backend/` has pytest suite with 15+ tests
- ✅ **Comprehensive safety layer**: Prompt injection detection, PII validation, jailbreak prevention
- ✅ **Graceful error handling**: App works even if Claude API fails (type-specific fallbacks)
- ✅ **Production-ready practices**: Logging, validation, separation of concerns
- ✅ **Type-safe integration**: Proper error boundaries, safe state management

**Run tests**: `pytest backend/tests/ -v` (all tests pass)

### 4. Design & UX (0-25 pts)

**User-centered design:**
- ✅ **Age-appropriate language**: All UI text at grade 6-8 reading level
- ✅ **Clear navigation**: 7-step workflow with progress tracking
- ✅ **Visual feedback**: Loading states, badges with emojis, progress bars
- ✅ **Accessible color scheme**: WCAG-compliant contrast ratios
- ✅ **Error messages**: User-friendly, never expose system internals
- ✅ **Responsive design**: Works on desktop and tablet (mobile-first for post-MVP)

**Example**: "Your deadline is in the past! Pick a future date." (not "Error: ISO date validation failed")

### 5. Community & Accessibility (0-25 pts)

**Inclusive by design:**
- ✅ **Child safety first**: COPPA-compliant (zero data collection), multi-layer validation
- ✅ **No harmful gamification**: No leaderboards (research shows competition harms collaboration at this age)
- ✅ **Privacy-first**: In-memory sessions, auto-delete on browser close
- ✅ **Inclusive project types**: Works for research, creative, hardware, events (not just STEM)
- ✅ **Collaborative features**: Team assignment, workload balance checking
- ✅ **Accessible baseline**: Keyboard navigation, clear forms, WCAG Level A compliance

**Future accessibility**: Text-to-speech, dyslexia-friendly fonts, high contrast mode (post-MVP)

---

**Summary**: Sprint Kit demonstrates **pedagogical responsibility** (research-backed), **technical innovation** (3-layer AI personalization), **production quality** (comprehensive tests + safety), **user-centered design** (age-appropriate UX), and **inclusive values** (child safety + collaboration over competition).

## Key Features

### MVP (Included)
✅ Complete 7-step flow
✅ Claude AI task breakdown
✅ Timeline validation
✅ Reflection with AI insights
✅ Authentic badges
✅ PDF export + text export
✅ Safety guardrails
✅ Comprehensive tests

### Post-MVP (Roadmap)
📋 Database persistence + user auth
📋 Teacher dashboard
📋 Text-to-speech for accessibility
📋 Multiple grade levels
📋 Email sharing
📋 Analytics (privacy-first)

---

## Known Limitations & Technical Debt

### What's Working (MVP Complete) ✅

- ✅ **Complete 7-step workflow** - End-to-end project planning flow
- ✅ **3-layer AI personalization** - Project type detection, context-aware tasks, adaptive reflection
- ✅ **Custom reflection prompts** - AI generates project-specific metacognitive questions
- ✅ **Badge awards based on learning** - 3 authentic badges tied to demonstrated skills
- ✅ **Multi-layer safety guardrails** - Prompt injection protection, PII validation, out-of-scope refusal
- ✅ **Fallback behavior** - App works even if Claude API fails (type-specific templates)
- ✅ **Grade 6-8 appropriate UX** - Age-appropriate language, clear navigation, accessible design
- ✅ **COPPA-compliant privacy** - Zero persistent data collection, in-memory sessions only

### What's Post-MVP (Not Built Yet) ⚠️

- ❌ **Database persistence** - Currently in-memory only (data deletes on browser close)
- ❌ **User accounts / authentication** - No login system (sessions are anonymous)
- ❌ **Teacher dashboard** - Teachers can't see student projects centrally
- ❌ **Mobile optimization** - Desktop-first design (works on mobile but not optimized)
- ❌ **Multi-language support** - English only for MVP
- ❌ **Advanced PDF export** - Basic PDF works, but no custom templates or logos
- ❌ **Real-time collaboration** - Students can't edit projects simultaneously

### Known Technical Debt 🔧

#### Badge System
- **Current**: Badge logic uses keyword matching in reflection answers
- **Limitation**: "I Can Break It Down" badge awarded if student mentions "task", "step", "break", etc.
- **Better approach (post-MVP)**: Use Claude to analyze reflection semantically, not just keywords
- **Impact**: Low - keyword matching works well for MVP, but could have false positives

#### PDF Export Wording
- **Current**: Some PDF text may show placeholder wording or formatting issues
- **Limitation**: reportlab PDF generation is basic (no custom styling)
- **Better approach (post-MVP)**: Professional PDF templates with school logos, custom formatting
- **Impact**: Low - cosmetic issue only, doesn't affect functionality

#### Timeline Estimation
- **Current**: Assumes 2 hours/day work capacity for all students
- **Limitation**: Doesn't account for team skill variation or project complexity variation
- **Better approach (post-MVP)**: Machine learning model based on historical project completion data
- **Impact**: Medium - timeline feedback works but could be more accurate

#### In-Memory State
- **Current**: All project data stored in React state (browser memory)
- **Limitation**: Refresh page = lose all progress, can't resume later
- **Better approach (post-MVP)**: Database persistence (PostgreSQL + user auth)
- **Impact**: High for real classroom use - this is the biggest MVP limitation

### Why These Trade-Offs? ⏱️

**48-hour hackathon constraint.** We prioritized:
1. **Pedagogical soundness** - Gold Standard PBL alignment, research-backed design
2. **Child safety** - Multi-layer validation, COPPA compliance
3. **Core workflow** - All 7 steps working end-to-end
4. **AI innovation** - 3-layer personalization (unique to Sprint Kit)

**What we deferred to post-MVP:**
- Persistence (requires database + auth infrastructure)
- Mobile optimization (requires responsive redesign)
- Teacher tools (requires separate dashboard architecture)
- Advanced features (ML-based estimation, semantic badge analysis)

### Honest Assessment 🎯

Sprint Kit is a **well-designed MVP grounded in pedagogy research**, not a production-ready tool for 1000+ classrooms. It demonstrates:
- ✅ Innovative AI use (3-layer personalization)
- ✅ Pedagogical alignment (Gold Standard PBL)
- ✅ Child safety best practices (multi-layer validation)
- ✅ Technical craft (modular code, comprehensive tests)

**Next steps (post-hackathon):** Pilot with 5-10 educators, gather feedback, add persistence, iterate based on real classroom use.

---

## Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Specifically:
pytest tests/test_core_logic.py -v  # Business logic
pytest tests/test_safety.py -v      # Safety guardrails
```

All tests should pass before deployment.

## Technologies

- **Backend**: Flask, Python, Anthropic SDK, reportlab (PDF)
- **Frontend**: React 18, Tailwind CSS, Axios
- **Testing**: pytest, black (formatting), isort (imports)
- **Deployment Ready**: Docker-compatible structure

## Development Notes

### Code Quality Standards

- **Formatting**: `black .` + `isort .`
- **Testing**: `pytest tests/ -v` (all tests pass)
- **Documentation**: Comprehensive comments, type hints where appropriate
- **Safety First**: Every external call wrapped in try/except

### Environment Variables

```
CLAUDE_API_KEY=your_anthropic_api_key
ENVIRONMENT=development
DEBUG=true
FLASK_ENV=development
```

### Common Issues

**Claude API fails**: Check API key, rate limiting. App falls back to template tasks.
**Frontend can't reach backend**: Ensure both running on localhost:3000 and localhost:5000.
**Tests fail**: Run `pip install -r requirements.txt` first; ensure Python 3.8+.

## Pedagogy Reference

**Primary Framework**: [Gold Standard PBL (Buck Institute for Education)](https://www.pblworks.org)

**Research Supporting This Approach**:
- Metacognitive ability growth peaks 12-15 (Price-Mitchell, 2015)
- Project-based learning 30+ years evidence-based (Larmer & Mergendoller, 2015)
- Gamification effect size 0.822 for learning outcomes (Huang et al., 2019)
- Authentic badges outperform generic points (Sailer & Homner, 2020)

## For Educators

### How to Use in Class

1. Use Sprint Kit for any project-based unit
2. Have students complete the 7-step flow
3. Use reflection exports for assessment
4. Discuss badges to deepen metacognition
5. Collect PDFs as evidence of planning

### Standards Alignment

✅ ISTE Standards for Students (critical thinking, communication, project management)
✅ State standards for project-based learning
✅ 21st century skills (collaboration, problem-solving, reflection)

## License

MIT License - Use freely in educational and non-commercial contexts.

## Support

**Questions?** Contact: safety@sprintkit.example.com
**Report a bug?** Create an issue in the GitHub repo.

---

**Sprint Kit** is built with the conviction that middle schoolers can learn real project management skills during the optimal window of metacognitive development. We teach decomposition, estimation, collaboration, and reflection—not just fun, but real learning.

**Built for the CS Girlies "Make Learning Cool Again" hackathon (Nov 14-16, 2025).**

See you at the finish line. ðŸš€
