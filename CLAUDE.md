# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FlowMatrix** is an intelligent workflow mapping platform for visualizing and optimizing enterprise business processes. It uses React Flow for an infinite canvas with nodes representing tasks, and includes AI-powered bottleneck analysis and automation recommendations.

This is a modern React TypeScript application with:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Flow
- **State Management**: React hooks with local state (no Zustand/Redux)
- **Persistence**: LocalStorage-based workflow storage
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Design**: Neo-Brutalism with OKLCH colors

## Development Automation (Skills)

FlowMatrix uses **4 AI skills** for development automation. These are **development tools**, not part of the FlowMatrix application itself.

| Skill | Trigger | Purpose |
|-------|---------|---------|
| **project-bootstrap** | "에이전트 팀 만들어줘" | Multi-agent team generation (agents, MCP, Docker) |
| **socrates** | "기획해줘" | Project planning via 21 Socratic questions → 6 docs |
| **tasks-generator** | Auto-called by socrates | TDD-based TASKS.md generation with phased milestones |
| **deep-research** | "리서치해줘" | Multi-API parallel research (Brave, Tavily, Perplexity, Naver, YouTube) |

**For detailed documentation**, see [SKILLS.md](./SKILLS.md).

**Important Notes**:
- Skills are development automation tools, not FlowMatrix app features
- Skills won't be deployed with FlowMatrix
- Use skills to help build FlowMatrix or plan new features
- Skills documentation is separate from app documentation

## Development Commands

### Running the Application
```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Preview production build
pnpm preview
```

### Testing
```bash
# Run unit tests (Vitest)
pnpm test
pnpm test --watch          # Watch mode
pnpm test:ui               # Interactive UI
pnpm test:coverage         # Coverage report

# Run E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui           # Debug mode
pnpm test:e2e:report       # View report
```

### Code Quality
```bash
# TypeScript type checking
pnpm check

# Format code
pnpm format

# Storybook (component documentation)
pnpm storybook
```

## Architecture Overview

### Core Data Flow

The application follows a unidirectional data flow:

1. **WorkflowCanvas.tsx** (main page) manages all state:
   - `nodes`: Array of workflow nodes (React Flow state)
   - `edges`: Array of connections between nodes
   - `selectedNode`: Currently selected node for detail panel
   - `viewMode`: "canvas" or "matrix" view toggle

2. **Workflow Engine** (`lib/workflowEngine.ts`):
   - Tracks predecessor/successor relationships
   - Auto-updates node status (PENDING → READY → IN_PROGRESS → COMPLETED)
   - Calculates workflow progress
   - Identifies executable nodes based on dependencies

3. **Storage System** (`lib/workflowStorage.ts`):
   - LocalStorage-based persistence
   - Project management (create, save, load, list)
   - Auto-save with debouncing
   - Version tracking

### Key Components

**WorkflowNode.tsx**:
- Renders individual nodes on the canvas
- Displays type-specific icons and colors (TRIGGER/ACTION/DECISION/ARTIFACT)
- Shows bottleneck animations (red pulsing border)
- Shows AI score badges (70+ = automatable)
- Handles node status visualization

**NodeDetailPanel.tsx**:
- Right-side panel for editing selected node
- Contains TagAutocomplete for ontology tags
- Displays bottleneck/AI warnings
- Provides node actions (analyze, delete)

**MatrixView.tsx**:
- Alternative view: Department (Y-axis) × Project Stage (X-axis) grid
- Groups nodes by department and stage
- Provides top-down organizational view

**DraggableNodeType.tsx**:
- Left sidebar cards for drag-and-drop node creation
- Sets dataTransfer for React Flow drop handling

### Node Types & States

**Node Types** (defined in `types/workflow.ts`):
- `TRIGGER`: Process starting points (lime green)
- `ACTION`: Execution tasks (cyber blue)
- `DECISION`: Review/approval gates (neon pink)
- `ARTIFACT`: Deliverables (purple)

**Node Status** (workflow engine):
- `PENDING`: Waiting for prerequisites
- `READY`: Can be started (all predecessors complete)
- `IN_PROGRESS`: Currently being worked on
- `COMPLETED`: Finished
- `BLOCKED`: Cannot proceed

### Drag & Drop Flow

The drag-and-drop system works as follows:

1. User drags `DraggableNodeType` from sidebar
2. `onDragStart` sets `dataTransfer` with node type
3. Canvas receives `onDrop` event with cursor position
4. `reactFlowInstance.screenToFlowPosition()` converts screen coords to canvas coords
5. New node created at drop position with generated ID (nanoid)
6. Node added to state via `setNodes`

### Tag Autocomplete System

**TagAutocomplete.tsx**:
- Uses `cmdk` library for command palette UX
- Extracts all unique tags from existing nodes: `useMemo(() => { const tagSet = new Set(); nodes.forEach(...); }, [nodes])`
- Filters suggestions based on input
- Auto-adds `#` prefix if missing
- Prevents duplicates

### Context Menu System

Right-clicking a node opens a context menu with actions:
- Start Task / Complete Task (status transitions)
- Clone Node (duplicates with new ID)
- Delete Node (removes node and connected edges)
- Change Status (PENDING/READY/IN_PROGRESS/COMPLETED/BLOCKED)

All actions use workflow engine functions and trigger auto-save.

## Styling System

### Design Language
**Neo-Brutalism meets Data Visualization Dashboard**

- Strong borders (2px solid)
- Box shadows: `4px 4px 0px 0px rgba(0,212,255,0.3)`
- OKLCH color space for perceptual uniformity
- Custom CSS classes in `index.css`:
  - `.brutal-card`: Card with border + shadow
  - `.neon-glow`: Multi-layer glow effect
  - `.pulse-bottleneck`: 1.5s scale animation for bottlenecks
  - `.grid-background`: 40px grid pattern

### Color Variables (OKLCH)
```css
--primary: oklch(0.65 0.25 230);      /* Cyber Blue */
--accent: oklch(0.60 0.30 350);       /* Neon Pink */
--success: oklch(0.75 0.25 130);      /* Lime Green */
--background: oklch(0.08 0.01 260);   /* Dark Background */
```

### Tailwind Usage
- Use custom classes for repeated patterns (e.g., `brutal-card`)
- Group classes logically: layout → spacing → appearance → effects → interactions
- Prefer utility classes over custom CSS unless pattern is reused 3+ times

## Critical Implementation Details

### React Flow Integration

**Node Types Registration**:
```typescript
const nodeTypes = {
  workflow: WorkflowNode,
};
```
Must be defined outside component to prevent re-registration on every render.

**Connection Validation**:
Connections are validated in `isValidConnection()` to prevent cycles (optional - not currently implemented but can be added).

**Auto-Layout**:
Currently uses manual positioning. `fitView()` is called on init to center viewport.

### State Management Patterns

**No Global State**: All state lives in `WorkflowCanvas.tsx` and is passed down via props. This is intentional to keep the MVP simple.

**Update Patterns**:
```typescript
// Add node
setNodes(nds => [...nds, newNode]);

// Update node
setNodes(nds => nds.map(n => n.id === targetId ? updatedNode : n));

// Delete node
setNodes(nds => nds.filter(n => n.id !== targetId));
```

**Auto-save Trigger**:
`useEffect(() => { autoSaveProject(currentProject); }, [nodes, edges])` with 2-second debounce.

### Bottleneck Detection

Currently mock data in initial nodes (`isBottleneck?: boolean` in node data). Production would:
1. Calculate based on `avg_time` (if > 30% of total workflow time)
2. Detect `lag_time` in edges (if > 3 days)
3. Identify loops (FEEDBACK_TO edges with high frequency)

### AI Score Calculation

Mock scores in initial data (`aiScore?: number` 0-100). Production algorithm:
```
score = (repetitiveness * 0.3) +
        (low_brain_usage * 0.3) +
        (rule_based * 0.2) +
        (tool_api_available * 0.2)
```
Scores 70+ show "AI 대체 가능" badge with sparkles icon.

## File Structure Context

```
client/src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, input, etc.)
│   ├── WorkflowNode.tsx         # Core node renderer
│   ├── NodeDetailPanel.tsx      # Right detail panel
│   ├── MatrixView.tsx           # Alternative grid layout
│   ├── DraggableNodeType.tsx    # Sidebar drag cards
│   ├── TagAutocomplete.tsx      # Smart tag input
│   └── ProjectManager.tsx       # Project CRUD dialog
├── lib/
│   ├── workflowEngine.ts        # Status calculation & dependency tracking
│   ├── workflowStorage.ts       # LocalStorage persistence
│   └── utils.ts                 # cn() for className merging
├── pages/
│   ├── WorkflowCanvas.tsx       # Main canvas page (primary workspace)
│   ├── Home.tsx                 # PRD review report page
│   └── NotFound.tsx             # 404 page
├── types/
│   └── workflow.ts              # All TypeScript type definitions
└── contexts/
    └── ThemeContext.tsx         # Dark/light theme (currently dark only)
```

## Testing Strategy

### Unit Tests (Vitest)
Location: `client/src/components/__tests__/`

**Test Coverage**:
- WorkflowNode: Icon rendering, AI score display, bottleneck animation
- TagAutocomplete: Input handling, filtering, suggestions (note: cmdk has jsdom issues, test logic separately)
- DraggableNodeType: Drag events, dataTransfer

**Writing Tests**:
- Use `@testing-library/react` for rendering
- Use `vi.fn()` for mocks
- Structure: `describe` → `it` blocks
- Mock React Flow: `vi.mock('@xyflow/react')`

### E2E Tests (Playwright)
Location: `e2e/workflow.spec.ts`

**Test Scenarios**:
- Node creation (button + drag-and-drop)
- View switching (canvas ↔ matrix)
- Detail panel interaction
- Statistics display

**Running E2E**:
Playwright auto-starts dev server via `webServer` config. Retries on failure in CI.

## Common Development Tasks

### Adding a New Node Type

1. Add to `NodeType` union in `types/workflow.ts`:
   ```typescript
   export type NodeType = "TRIGGER" | "ACTION" | "DECISION" | "ARTIFACT" | "NEW_TYPE";
   ```

2. Add icon and color in `WorkflowNode.tsx`:
   ```typescript
   const nodeTypeIcons = { ..., NEW_TYPE: YourIcon };
   const nodeTypeColors = { ..., NEW_TYPE: "text-color border-color" };
   ```

3. Add draggable card in `WorkflowCanvas.tsx` sidebar:
   ```tsx
   <DraggableNodeType type="NEW_TYPE" label="New Type" icon={YourIcon} colorClass="..." />
   ```

### Adding a New Department/Stage

1. Add to union in `types/workflow.ts`:
   ```typescript
   export type Department = ... | "NEW_DEPT";
   export type ProjectStage = ... | "NEW_STAGE";
   ```

2. Update `MatrixView.tsx` to include new row/column in grid

3. Update dropdown options in `WorkflowCanvas.tsx` sidebar

### Implementing Workflow Engine Logic

When adding new status transitions:

1. Update `workflowEngine.ts` functions:
   - `areAllPredecessorsCompleted()`: Check if node can start
   - `calculateNextStatus()`: Determine new status
   - `updateWorkflowStatus()`: Apply updates to all affected nodes

2. Call `updateWorkflowStatus(nodes, edges)` after any node status change

3. Trigger auto-save to persist state

### Adding New shadcn/ui Components

```bash
# Install from shadcn/ui registry
npx shadcn@latest add <component-name>
```

Components are added to `client/src/components/ui/` and auto-configured for Tailwind + dark mode.

## Commit Conventions

Follow Conventional Commits:
- `feat(canvas): add matrix export button`
- `fix(node): resolve drag offset calculation`
- `docs(readme): update installation steps`
- `test(workflow): add unit tests for engine`
- `refactor(storage): simplify save logic`
- `perf(canvas): optimize node rendering`

Scopes: `canvas`, `node`, `matrix`, `panel`, `tag`, `ui`, `types`, `deps`, `engine`, `storage`

## Important Notes

### Do NOT...
- Add state management libraries (Zustand/Redux) - use React state
- Create separate route files - routing is in `App.tsx` with Wouter
- Add backend API calls without discussing architecture (currently client-only)
- Use `any` types - prefer `unknown` and narrow with type guards
- Commit large binary files - use public/ for images
- Create TODO/FIXME comments without GitHub issues

### DO...
- Use `nanoid` for generating unique IDs (not uuid)
- Call `autoSaveProject()` after state changes
- Update tests when changing component behavior
- Use TypeScript strict mode features
- Follow Neo-Brutalism design patterns
- Add Storybook stories for new reusable components
- Check CONTRIBUTING.md for PR workflow

## Troubleshooting

**ResizeObserver errors**: Mock added in `client/src/test/setup.ts` - ignore in tests

**cmdk scrollIntoView errors**: Known jsdom incompatibility - test logic separately or use E2E

**React Flow nodes not updating**: Check if `nodeTypes` is defined outside component

**LocalStorage full**: Projects can accumulate - add cleanup or export feature

**Playwright timeout**: Increase `webServer.timeout` in `playwright.config.ts` (currently 120s)

## Performance Considerations

- WorkflowNode is memoized to prevent unnecessary re-renders
- Tag extraction uses `useMemo` with `[nodes]` dependency
- Auto-save is debounced (2 seconds) to avoid excessive writes
- React Flow handles viewport virtualization automatically
- Large workflows (>100 nodes) may need pagination or clustering

## Future Architecture Notes

Current MVP is client-only. For production backend integration:

1. Replace `workflowStorage.ts` with API client
2. Add authentication (JWT tokens)
3. Implement real-time collaboration (WebSockets or Yjs CRDT)
4. Move AI scoring to backend (compute-intensive)
5. Add database (PostgreSQL with node/edge tables)
6. Implement server-side bottleneck analysis

The existing architecture supports this - just swap storage layer.

---

For detailed architecture diagrams and component relationships, see ARCHITECTURE.md.
For testing guidelines, see TESTING.md.
For contribution workflow, see CONTRIBUTING.md.
