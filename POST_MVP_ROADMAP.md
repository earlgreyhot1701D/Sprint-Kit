# Sprint Kit - Post-MVP Roadmap

This document outlines features for post-hackathon development, prioritized by impact and feasibility.

---

## What's Already Built (MVP Complete) ✅

**Fully Functional Features (Hackathon Submission):**

### Core 7-Step Workflow
- ✅ **Step 1: Create Project** - Define project, team, timeline
- ✅ **Step 2: Brainstorm** - Generate ideas freely
- ✅ **Step 3: Set Goals** - Define success criteria
- ✅ **Step 4: Break It Down** - AI-powered task generation (3-layer personalization)
- ✅ **Step 5: Assign Roles & Timeline** - Distribute work, validate timeline
- ✅ **Step 6: Reflection** - Custom prompts + AI insights + badge awards
- ✅ **Step 7: Export** - PDF and text export

### AI Features (3-Layer Personalization)
- ✅ **Project type detection** - Hardware, software, creative, event, research, other
- ✅ **Context-aware task generation** - Scales to experience level + team size
- ✅ **Adaptive reflection prompts** - Custom questions based on project
- ✅ **Reflection insights** - AI analyzes student answers
- ✅ **Fallback tasks** - Type-specific templates if Claude fails

### Badge System
- ✅ **"I Can Break It Down"** - Decomposition badge
- ✅ **"Planner Power"** - Time estimation badge
- ✅ **"Team Player"** - Collaboration badge
- ✅ **Badge logic** - Keyword analysis + timeline accuracy + task editing detection

### Safety & Privacy
- ✅ **Multi-layer validation** - Before Claude, in prompts, after Claude, fallback
- ✅ **Prompt injection protection** - Server-side blocking
- ✅ **PII validation** - No email/phone exposure
- ✅ **Out-of-scope refusal** - Won't help with homework/cheating
- ✅ **COPPA compliance** - Zero persistent data collection
- ✅ **In-memory sessions** - Auto-delete on browser close

### Testing & Quality
- ✅ **15+ backend tests** - Safety, logic, badge generation
- ✅ **Comprehensive test suite** - pytest with full coverage
- ✅ **Code quality** - Modular, documented, type-safe

### Documentation
- ✅ **README** - Complete setup + architecture
- ✅ **Pedagogy whitepaper** - Research citations
- ✅ **Child safety framework** - Full implementation details
- ✅ **Privacy policy** - COPPA-compliant, kid-friendly
- ✅ **Demo video script** - 2:30 walkthrough

---

## What's NOT Built Yet (Post-MVP Features)

The sections below outline what we **did not build** in the 48-hour hackathon.

---

## Phase 2: Foundation (Months 1-2)

### Database & Persistence
- [ ] Add PostgreSQL database layer
- [ ] Implement user authentication (OAuth2)
- [ ] Store project history (students can resume)
- [ ] COPPA-compliant data encryption

**Why**: Currently all data is in-memory (deleted on browser close). Real use requires persistence.

### Teacher Dashboard (MVP)
- [ ] Teachers can see student projects (with permission)
- [ ] View reflection insights
- [ ] Export class reports
- [ ] Standards alignment tracker

**Why**: Educators are key users. Dashboard makes Sprint Kit classroom-ready.

## Phase 3: Scale (Months 2-3)

### Accessibility Enhancements
- [ ] Text-to-speech for all UI text
- [ ] Dyslexia-friendly font option
- [ ] High contrast mode
- [ ] Keyboard navigation audit
- [ ] WCAG 2.1 AA compliance

**Why**: 15-20% of students have learning differences. Accessibility benefits all.

### Reflection Insights from Claude (Stretch)
- [ ] AI generates personalized learning recommendations
- [ ] Predictive badges (if student shows signs of learning)
- [ ] Growth mindset language in insights

**Why**: Already partially implemented (generic fallback). Claude version would be wow-factor.

### PDF Export Polish
- [ ] Professional templates (school logo, customizable)
- [ ] Email delivery option
- [ ] QR code linking to project
- [ ] Print-friendly formatting

**Why**: Students want to share. Parents want to see. Teachers want portfolios.

## Phase 4: Ecosystem (Months 3-4)

### Project Templates
- [ ] Pre-built projects by subject (science, humanities, arts, tech)
- [ ] Grade-level variants (grades 6-8, 9-12)
- [ ] Difficulty levels (scaffolded support)

**Why**: Lowers barrier for teachers and solo students. Faster onboarding.

### Collaboration Features
- [ ] Real-time collaborative editing
- [ ] Team chat/comments
- [ ] Conflict resolution on edits
- [ ] Peer feedback mechanism

**Why**: Some teams are remote. Async collaboration is critical.

### Analytics (Privacy-First)
- [ ] Aggregate learning patterns (no personal data)
- [ ] Which skills students struggle with most?
- [ ] Timeline estimation accuracy trends
- [ ] Decomposition quality metrics

**Why**: Educators want evidence that it works.

## Phase 5: Integration (Month 4+)

### LMS Integration
- [ ] Google Classroom plugin
- [ ] Canvas LMS integration
- [ ] Schoology bridge
- [ ] Apple School Manager support

**Why**: Teachers live in their LMS. We need to meet them there.

### Parent Portal
- [ ] Parents see student projects (with student permission)
- [ ] Celebrate badges with parents
- [ ] Progress reports
- [ ] Conversation starters ("How was your project planning?")

**Why**: Parent engagement boosts student motivation and achievement.

### Mobile App
- [ ] React Native for iOS/Android
- [ ] Offline sync (plan offline, sync online)
- [ ] Push notifications (deadline reminders)
- [ ] Native camera for documentation

**Why**: Students use mobile. We should too.

---

## What We're NOT Building

### ❌ Leaderboards
Why: Research shows competitive elements harm collaboration and motivation at this age.

### ❌ "Pointification"
Why: We use authentic badges tied to real learning. Generic rewards backfire.

### ❌ Social Features (Comments on projects)
Why: Stays private. No pressure to compare or judge.

### ❌ Video Recording Integration
Why: Privacy risk for middle schoolers. Out of scope.

---

## Success Metrics (Post-MVP)

- **Adoption**: 1,000+ educators using by Year 1
- **Learning Impact**: Students completing projects on time +40%
- **Engagement**: Students return for second project 70%+ of the time
- **Accessibility**: WCAG 2.1 AA compliance
- **Privacy**: Zero data breaches, 100% COPPA compliance

---

## Technical Debt to Address

- [ ] Add integration tests (Cypress/Playwright)
- [ ] Refactor API response format for consistency
- [ ] Implement rate limiting per user
- [ ] Add error tracking (Sentry)
- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Performance optimization (bundle size, CDN)

---

## Resources Needed

- **Engineering**: 1 FTE for 4 months
- **Design**: Part-time UX/accessibility specialist
- **Product**: Teacher advisory board (5-10 educators)
- **Infrastructure**: Database hosting, CDN, monitoring

---

## Competitive Differentiation

**What we have now**:
- Gold Standard PBL alignment (most competitors don't)
- Authentic badges (not point-based)
- Child-first safety (not bolted on)
- AI scaffolding for decomposition (our secret sauce)

**Phase 2 advantages**:
- Teacher dashboard (Asana/Monday don't have education focus)
- Reflection insights from Claude (unique)

**Phase 3+ advantages**:
- Accessibility focus
- Privacy-first analytics
- Classroom-integrated (Google Classroom, Canvas)

---

## Business Model (Future Consideration)

**For hackathon**: Free forever (open source)

**Post-MVP options**:
- **Freemium**: Basic free, premium for teachers (dashboard, templates)
- **School License**: Annual subscription for districts
- **Consulting**: Custom implementations for schools/districts
- **Always Free**: Remain open source, funded by grants/donations

*Decision deferred until Phase 2.*

---

**Last Updated**: Hackathon submission (Nov 2025)  
**Next Review**: Post-hackathon debrief (Dec 2025)
