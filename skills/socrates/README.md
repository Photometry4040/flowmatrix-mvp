# Socrates: AI Project Planning Consultant

Transform vague project ideas into structured planning documents through 21 Socratic questions.

## What is Socrates?

Socrates is an AI-powered planning consultant that helps you convert rough ideas into professional project documentation. Instead of writing planning docs yourself, Socrates guides you through a series of questions to extract and refine your vision.

**Perfect for**: Beginners, non-technical founders, or anyone starting a new project without a clear plan.

## How It Works

### Step 1: Trigger the Skill

Say any of these phrases:
- "기획해줘" (Korean: Plan it for me)
- "프로젝트 기획"
- Or, auto-triggered by `project-bootstrap` when no tech stack is provided

### Step 2: 21 Questions (Non-Technical)

Socrates asks 21 questions about your project:

**Examples**:
- Q1: What problem are you solving?
- Q5: Who is your target audience?
- Q10: What does your MVP look like?
- Q15: What's your timeline?
- Q21: How will you measure success?

**Important**: These are NOT technical questions. You don't need to know backend frameworks or databases. Socrates will recommend tech stacks based on your answers.

### Step 3: 6 Documents Generated

After Q21, Socrates automatically creates 6 planning documents in `docs/planning/`:

| # | Document | Description |
|---|----------|-------------|
| 1 | **01-prd.md** | Product Requirements Document (features, user stories) |
| 2 | **02-trd.md** | Technical Requirements Document (architecture, tech stack) |
| 3 | **03-user-flow.md** | User flows with Mermaid diagrams |
| 4 | **04-database-design.md** | Database schema and ER diagrams |
| 5 | **05-design-system.md** | UI design tokens and components |
| 6 | **07-coding-convention.md** | Code style and commit message rules |

### Step 4: TASKS.md Auto-Generated

After generating the 6 documents, Socrates **automatically triggers** the `tasks-generator` skill, which creates:
- **06-tasks.md**: TDD-based task breakdown with phased milestones

## Example Conversation

```
You: "채팅 앱 기획해줘" (Plan a chat app for me)

Socrates:
안녕하세요! 채팅 앱 기획을 도와드리겠습니다.
총 21개의 질문을 통해 프로젝트를 구체화할게요.

Q1/21: 이 채팅 앱이 해결하려는 주요 문제는 무엇인가요?
- 기존 채팅 앱의 어떤 점이 불편하신가요?
- 특정 그룹이나 상황을 위한 앱인가요?

You: [Answer about your problem]

Socrates: [Summarizes and continues to Q2/21...]

... [After Q21] ...

Socrates:
✅ 21개 질문 완료!
📝 6개 문서를 생성하고 있습니다...

[Generated]:
- docs/planning/01-prd.md
- docs/planning/02-trd.md
- docs/planning/03-user-flow.md
- docs/planning/04-database-design.md
- docs/planning/05-design-system.md
- docs/planning/07-coding-convention.md

🔄 TASKS.md 생성을 위해 tasks-generator 스킬을 호출합니다...

[tasks-generator creates 06-tasks.md]

✅ 기획 완료! 이제 개발을 시작할 수 있습니다.
```

## When to Use Socrates

**Use Socrates when**:
- ✅ Starting a new project from scratch
- ✅ You have a rough idea but need structure
- ✅ You want AI to recommend tech stacks
- ✅ You need planning docs for team alignment

**Skip Socrates when**:
- ❌ You already have detailed planning docs
- ❌ You know exactly what tech stack you want (use `project-bootstrap` directly)
- ❌ You're just adding a small feature to existing project

## Integration with Other Skills

### Socrates + project-bootstrap
```
User: "에이전트 팀 만들어줘" (without specifying tech stack)

project-bootstrap: "기획이 필요하신가요?"
User: "네"

→ project-bootstrap triggers Socrates
→ Socrates completes 21 questions
→ Socrates generates 6 docs + TASKS.md
→ Returns to project-bootstrap with tech stack recommendation
→ project-bootstrap generates full project
```

### Socrates + tasks-generator
```
User: "기획해줘"

→ Socrates asks 21 questions
→ Socrates generates 6 docs
→ Socrates auto-triggers tasks-generator
→ tasks-generator creates TASKS.md
```

## File References

This skill uses the following template files:

```
skills/socrates/references/
├── questions.md                    # Q1-Q21 question catalog
├── conversation-rules.md           # Dialog rules & heuristics
├── prd-template.md                 # PRD template
├── trd-template.md                 # TRD template
├── user-flow-template.md           # User flow template
├── database-design-template.md     # DB schema template
├── design-system-template.md       # Design system template
├── coding-convention-template.md   # Code style template
├── tasks-generation-rules.md       # Rules for TASKS.md
└── tasks-template.md               # TASKS.md template
```

## Critical Rules

**Socrates will NEVER**:
- ❌ Skip the 21 questions
- ❌ Write planning docs without asking questions first
- ❌ Use technical jargon in questions
- ❌ Make assumptions about your tech preferences

**Socrates will ALWAYS**:
- ✅ Ask all 21 questions in order
- ✅ Use `AskUserQuestion` tool for interaction
- ✅ Summarize every 3-4 questions
- ✅ Generate all 6 documents after Q21
- ✅ Auto-trigger `tasks-generator` after document generation

## FAQ

### Q: Can I skip some questions?
**A**: No. All 21 questions are necessary to create comprehensive planning docs.

### Q: What if I don't know the answer?
**A**: That's okay! Socrates will help you think through it or provide options.

### Q: Will Socrates write code?
**A**: No. Socrates only creates planning documents. Use `project-bootstrap` to generate actual code.

### Q: Can I edit the generated documents?
**A**: Yes! The documents are markdown files in `docs/planning/`. Edit them as needed.

### Q: What if I want to re-plan after seeing the docs?
**A**: Trigger Socrates again. It will overwrite existing files or create new versions.

## Next Steps After Socrates

After Socrates completes:

1. **Review Documents**: Check `docs/planning/` to verify the plan
2. **Run project-bootstrap**: Generate full project structure
   ```
   Say: "FastAPI + React로 에이전트 팀 만들어줘"
   ```
3. **Start Development**: Use the generated agents and TASKS.md to begin coding

---

**For more details**, see [SKILL.md](./SKILL.md) (full 198-line specification)

**For complete skills overview**, see [../../SKILLS.md](../../SKILLS.md)
