# Sprint Kit 🚀

**AI-powered project planner built for middle school students (grades 6-8) teaching real project management skills through the lens of Gold Standard PBL.**

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

### Why Ages 12-15?

Research shows most metacognitive ability growth happens between ages 12-15. Sprint Kit captures this critical window when students develop the ability to think about their own thinking—a skill that improves academic performance by 7+ months.

### Authentic Gamification

Unlike point-based gamification, Sprint Kit awards **three research-backed badges tied to real skill demonstration**:

- 🧩 **"I Can Break It Down"** - Awarded when decomposition is mentioned in reflection
- ⏰ **"Planner Power"** - Awarded when timeline estimates are accurate (±20%)
- 👥 **"Team Player"** - Awarded when collaboration is evident

Middle schoolers detect manipulation. Real learning celebrations work.

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

### Claude Integration

```
User Input
    ↓
Validate (prompt injection check)
    ↓
Call Claude API (with safety constraints in prompt)
    ↓
Validate Response (PII check, jailbreak detection)
    ↓
Fallback to Template (if Claude fails)
    ↓
Return to Frontend
```

**Key**: Safety happens at *every* layer. If Claude response is unsafe, we use a template instead.

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

| Criterion | Sprint Kit Implementation |
|-----------|---|
| **Educational Impact** | Gold Standard PBL framework, metacognition research, 4 core skills taught |
| **Creativity & Innovation** | AI scaffolding for decomposition, authentic badges vs. pointification |
| **Technical Craft** | Modular code, comprehensive tests, safety layer, error handling |
| **Design & UX** | Grade 6-8 reading level, clear forms, progress visualization |
| **Community & Accessibility** | In-memory privacy, no leaderboards (collaboration over competition) |

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
