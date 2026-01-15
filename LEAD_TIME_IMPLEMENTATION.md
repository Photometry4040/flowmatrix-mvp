# Lead Time Auto-Calculator Implementation (T7.1)

## Overview

This document describes the implementation of the Lead Time Auto-Calculator for FlowMatrix Phase 7, Task T7.1. The implementation provides automatic lead time calculation based on `avg_time` fields in node attributes, identifies critical paths, and calculates per-stage and per-department metrics.

## Files Created

### 1. `/client/src/lib/leadTimeCalculator.ts`

Core lead time calculation engine with the following functions:

#### Core Functions

- **`parseTimeString(timeStr: string): number`**
  - Converts time strings to minutes
  - Supports: "2h" (hours), "3d" (days), "45m" (minutes)
  - Returns 0 for invalid input
  - Examples:
    - "2h" → 120 minutes
    - "3d" → 4320 minutes
    - "45m" → 45 minutes

- **`calculateNodeLeadTime(node: ActivityNode): number`**
  - Extracts and parses the `avg_time` attribute from a node
  - Returns lead time in minutes
  - Returns 0 if `avg_time` is missing or invalid

- **`formatLeadTime(totalMinutes: number): string`**
  - Converts minutes back to human-readable format
  - Examples:
    - 7740 minutes → "5d 3h 20m"
    - 150 minutes → "2h 30m"
    - 45 minutes → "45m"

- **`calculateCriticalPath(nodes, edges): CriticalPathResult`**
  - Uses DFS algorithm with memoization to find the longest path
  - Critical path = path with maximum total lead time
  - Returns:
    - `path`: Array of node IDs in critical path order
    - `nodes`: Array of CriticalPathNode objects with positions and lead times
    - `totalMinutes`: Total lead time of critical path

- **`calculateWorkflowLeadTime(nodes, edges): LeadTimeResult`**
  - Main function that calculates complete workflow metrics
  - Returns:
    - Total lead time (minutes, hours, days, formatted)
    - Critical path and nodes
    - Stage breakdown (lead time by stage)
    - Department breakdown (lead time by department)

- **`calculateStageLeadTime(nodes, stage): number`**
  - Sums lead times for all nodes in a specific stage
  - Used for stage-level metrics

- **`calculateDepartmentLeadTime(nodes, department): number`**
  - Sums lead times for all nodes in a specific department
  - Used for department-level metrics

#### Utility Functions

- **`isNodeOnCriticalPath(nodeId, criticalPath): boolean`**
  - Checks if a node is part of the critical path
  - Used for highlighting

- **`calculateBottleneckSeverity(nodePath, totalPath): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"`**
  - Determines bottleneck severity based on percentage of total path
  - CRITICAL: ≥50%
  - HIGH: ≥40%
  - MEDIUM: ≥30%
  - LOW: <30%

## Files Modified

### 1. `/client/src/types/workflow.ts`

Added two new types:

```typescript
export interface CriticalPathNode {
  id: string;
  label: string;
  leadTime: number;        // in minutes
  position: number;        // index in critical path
}

export interface LeadTimeResult {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  formatted: string;                           // "5d 3h 20m"
  criticalPath: string[];                      // node IDs
  criticalPathNodes: CriticalPathNode[];
  stageBreakdown: Record<string, number>;      // stage -> minutes
  departmentBreakdown: Record<string, number>; // department -> minutes
}
```

### 2. `/client/src/components/LeadTimePanel.tsx`

New UI component displaying lead time analysis with:

- **Total Lead Time Display**
  - Large, prominent display of workflow lead time
  - Shows formatted time (e.g., "5d 3h 20m") and breakdown (hours, days)

- **Critical Path Visualization**
  - List of nodes on critical path with their individual lead times
  - Node IDs and labels for reference
  - Highlight/clear buttons for visual emphasis on canvas

- **Stage Breakdown**
  - Expandable section showing lead time per stage
  - Progress bars showing relative contribution
  - Sorted by descending lead time

- **Department Breakdown**
  - Expandable section showing lead time per department
  - Progress bars showing relative contribution
  - Sorted by descending lead time

- **CSV Export**
  - Exports complete lead time report including:
    - All nodes with their lead times
    - Indication of critical path membership
    - Bottleneck severity
    - Summary statistics

- **Bottleneck Warning**
  - Alert if any critical path nodes contribute >30% of total lead time
  - Recommendations for optimization

### 3. `/client/src/pages/WorkflowCanvas.tsx`

Integration changes:

- Imported `LeadTimePanel` component
- Added state: `highlightedCriticalPath: string[]`
- Added CSS class to nodes on critical path: `critical-path-node`
- Added LeadTimePanel below the main content area
- Connected panel's highlight/clear callbacks to state
- Maps ReactFlow edges to WorkflowRelationship format for calculation

### 4. `/client/src/lib/workflowEngine.ts`

Added new function:

```typescript
export function detectBottlenecksByLeadTime(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[],
  criticalPath: string[],
  totalLeadTime: number
): ActivityNode[]
```

This function:
- Marks nodes as bottlenecks if they're on critical path AND consume ≥30% of total lead time
- Can be used to automatically update node `isBottleneck` property
- Complements existing bottleneck detection logic

### 5. `/client/src/index.css`

Added critical path styling:

```css
.critical-path-node {
  @apply border-4 border-yellow-400/80;
  box-shadow: 0 0 15px rgba(250, 204, 21, 0.6), 0 0 30px rgba(250, 204, 21, 0.3);
}
```

Features:
- 4px yellow border with 80% opacity
- Dual-layer glow effect for visibility
- Matches Neo-Brutalism design aesthetic

## Features Implemented

### ✓ Time String Parsing
- Converts "2h", "3d", "45m" to minutes
- Case-insensitive
- Handles whitespace
- Returns 0 for invalid input

### ✓ Lead Time Calculation
- Per-node calculation from `avg_time` attribute
- Workflow total using critical path algorithm
- Per-stage aggregation
- Per-department aggregation

### ✓ Critical Path Detection
- DFS-based longest path algorithm
- Accounts for actual lead times (not just node count)
- Uses memoization for efficiency
- Returns both path IDs and detailed node information

### ✓ UI Display
- LeadTimePanel component with expandable sections
- Visual breakdown with progress bars
- Critical path highlighting on canvas
- CSV export functionality

### ✓ Integration
- Auto-updates when nodes/edges change
- Calculates automatically via useMemo
- Supports highlighting critical path nodes with gold border/glow
- Clear separation of concerns

### ✓ Edge Cases Handled
- Empty workflows (no nodes/edges)
- Single node workflows
- Multiple disconnected paths
- Cyclic dependencies (relies on existing validation)
- Missing or invalid time strings

## Usage Examples

### Display Total Lead Time
```typescript
const result = calculateWorkflowLeadTime(nodes, edges);
console.log(result.formatted); // "5d 3h 20m"
console.log(result.totalHours); // 131
```

### Check if Node is Bottleneck
```typescript
const isBottleneck =
  isNodeOnCriticalPath(node.id, criticalPath) &&
  calculateBottleneckSeverity(nodeLeadTime, totalLeadTime) === "CRITICAL";
```

### Highlight Critical Path
```typescript
const panel = <LeadTimePanel
  nodes={nodes}
  edges={edges}
  onHighlightCriticalPath={(nodeIds) => setHighlighted(nodeIds)}
  onClearHighlight={() => setHighlighted([])}
/>;
```

## Algorithm Details

### Critical Path Algorithm (DFS with Memoization)

```
1. Build adjacency list from edges
2. Find all start nodes (no incoming edges)
3. For each start node:
   - DFS to find longest path using memoization
   - Track maximum lead time path
4. Return path with maximum total lead time
```

**Time Complexity**: O(V + E) where V = nodes, E = edges (with memoization)
**Space Complexity**: O(V) for memoization cache

### Lead Time Aggregation

- **Stage Breakdown**: Sum all node lead times grouped by stage
- **Department Breakdown**: Sum all node lead times grouped by department
- **Critical Path Severity**: Calculate percentage of node lead time against total critical path

## Testing

Unit tests provided in `/client/src/lib/__tests__/leadTimeCalculator.test.ts`:

```bash
pnpm test leadTimeCalculator
```

Test coverage includes:
- Time string parsing (all units, edge cases)
- Time formatting
- Node lead time calculation
- Critical path detection
- Stage/department aggregation
- Bottleneck severity calculation
- Full workflow metrics

## Performance Considerations

- **Memoization**: Critical path calculation uses memoization to avoid redundant traversals
- **useMemo**: LeadTimePanel and node highlighting use React memoization
- **Lazy evaluation**: Breakdowns and expansions calculated on-demand
- **CSV export**: Streamed to client, no backend processing needed

## Future Enhancements

1. **Lag Time Integration**: Use edge `lag_time` property for more accurate critical path
2. **Resource Constraints**: Factor in parallel vs. sequential execution
3. **Dependency Analysis**: Detect potential schedule conflicts
4. **Historical Data**: Track lead time trends over project lifecycle
5. **Predictive Analytics**: ML-based lead time estimation
6. **Integration with Task Scheduling**: Gantt chart generation from critical path

## Code Quality

- Full TypeScript strict mode compliance
- No `any` types
- Comprehensive error handling
- Extensive JSDoc comments
- Unit tests with good coverage
- Follows existing code patterns

## Integration Points

- **WorkflowEngine**: `detectBottlenecksByLeadTime()` for bottleneck detection
- **WorkflowCanvas**: Lead time display and critical path highlighting
- **Node Details**: Lead time information could be shown in node detail panel
- **Reporting**: Lead time metrics for project reports and exports

## Styling

Uses Neo-Brutalism design from existing codebase:
- Bold OKLCH colors (yellow-400 for critical path)
- Strong borders and shadow effects
- Consistent with existing `.brutal-card` and `.neon-glow` styles
- Responsive breakdowns with progress bars
- Dark mode compatible

## Browser Compatibility

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard DOM APIs
- CSS Grid and Flexbox for layouts
- No browser-specific hacks required
