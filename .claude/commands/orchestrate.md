# Orchestrate Command

Coordinates FlowMatrix development tasks between frontend-specialist and test-specialist agents using the Task tool.

## Usage

```bash
/orchestrate "<task description>"
```

## Examples

### Phase 5 Tasks

```bash
# T5.1: Storage Quota Validation
/orchestrate "T5.1 구현: workflowStorage.ts에 quota validation 추가"
# → Spawns frontend-specialist agent

# T5.2: Corrupted Project Recovery
/orchestrate "T5.2 구현: loadProject()에 validation 추가"
# → Spawns frontend-specialist agent

# T5.3: Engine Dependency Validation
/orchestrate "T5.3 구현: WorkflowCanvas.tsx에 dependency validation 추가"
# → Spawns frontend-specialist agent

# T5.4: Circular Dependency Warnings
/orchestrate "T5.4 구현: onConnect()에 cycle detection 추가"
# → Spawns frontend-specialist agent

# T5.5: E2E Test Selector Fixes
/orchestrate "T5.5 수정: workflow.spec.ts selectors를 data-testid로 변경"
# → Spawns test-specialist agent
```

### Phase 6 Tasks

```bash
# T6.1: NodeDetailPanel Handlers (CRITICAL)
/orchestrate "T6.1 긴급: NodeDetailPanel.tsx 버튼에 onClick 핸들러 추가"
# → Spawns frontend-specialist agent

# T6.2: Handler Unit Tests
/orchestrate "T6.2 작성: NodeDetailPanel.test.tsx 테스트 추가"
# → Spawns test-specialist agent

# T6.3: Handler E2E Tests
/orchestrate "T6.3 작성: 노드 삭제 워크플로우 E2E 테스트 추가"
# → Spawns test-specialist agent
```

### Parallel Execution

```bash
# Run multiple independent tasks
/orchestrate "T5.1과 T5.3 병렬 실행"
# → Spawns 2 frontend-specialist agents in parallel

# TDD workflow
/orchestrate "T6.2 테스트 먼저 작성 (RED), 그 다음 T6.1 구현 (GREEN)"
# → Spawns test-specialist first, then frontend-specialist
```

## Task ID Mapping

| Task ID | Description | Agent | Duration |
|---------|-------------|-------|----------|
| **T5.1** | Storage Quota Validation | Frontend | 4h |
| **T5.2** | Corrupted Project Recovery | Frontend | 6h |
| **T5.3** | Engine Dependency Validation | Frontend | 6h |
| **T5.4** | Circular Dependency Warnings | Frontend | 4h |
| **T5.5** | E2E Test Selector Fixes | Test | 2h |
| **T6.1** | NodeDetailPanel Handlers | Frontend | 4h |
| **T6.2** | Unit Tests for Handlers | Test | 3h |
| **T6.3** | E2E Tests for Handlers | Test | 3h |

## Implementation

The orchestrate command uses the Task tool to spawn specialized agents:

```typescript
// Example: Spawn frontend-specialist for T5.1
Task({
  subagent_type: "general-purpose",
  description: "Implement storage quota validation",
  prompt: `You are the frontend-specialist for FlowMatrix.

Task: T5.1 - Add storage quota validation to workflowStorage.ts

Requirements:
1. Modify getStorageUsage() to check if percentage > 90%
2. Show toast warning with remaining space
3. No type casting (strict TypeScript)
4. Follow existing code patterns

Context: User wants warnings before localStorage quota is exceeded.

Instructions available at: .claude/agents/frontend-specialist.md`
});
```

## Notes

- Each agent has full context from their .md instruction file
- Agents report back to orchestrator upon completion
- Failed tasks are retried with clarified instructions
- All agents follow TDD when appropriate (test-specialist writes tests first)
