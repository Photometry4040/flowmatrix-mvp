# Lead Time Auto-Calculator - Quick Reference

## What Was Implemented

A complete lead time calculation system for FlowMatrix that:
1. Parses time strings from node attributes ("2h", "3d", "45m")
2. Calculates critical paths using DFS algorithm
3. Identifies bottlenecks (nodes using >30% of critical path)
4. Displays lead time metrics in an interactive panel
5. Highlights critical path nodes on the canvas
6. Exports reports as CSV

## File Locations

### New Files
- **Core Logic**: `/client/src/lib/leadTimeCalculator.ts`
- **UI Component**: `/client/src/components/LeadTimePanel.tsx`
- **Tests**: `/client/src/lib/__tests__/leadTimeCalculator.test.ts`

### Modified Files
- `/client/src/types/workflow.ts` - Added LeadTimeResult, CriticalPathNode types
- `/client/src/pages/WorkflowCanvas.tsx` - Integrated LeadTimePanel, added highlighting
- `/client/src/lib/workflowEngine.ts` - Added detectBottlenecksByLeadTime()
- `/client/src/index.css` - Added .critical-path-node styling

## Key Components

### LeadTimeCalculator Functions

```typescript
// Parse time strings
parseTimeString("2h") // → 120 (minutes)
parseTimeString("3d") // → 4320 (minutes)
parseTimeString("45m") // → 45 (minutes)

// Format minutes back to human-readable
formatLeadTime(7740) // → "5d 3h 20m"

// Calculate for single node
calculateNodeLeadTime(node) // → number (minutes)

// Calculate critical path
calculateCriticalPath(nodes, edges) // → { path, nodes, totalMinutes }

// Calculate workflow totals
calculateWorkflowLeadTime(nodes, edges) // → LeadTimeResult

// Check if bottleneck
calculateBottleneckSeverity(nodePath, totalPath) // → "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
```

### LeadTimePanel Props

```typescript
interface LeadTimePanelProps {
  nodes: ActivityNode[];                    // All workflow nodes
  edges: WorkflowRelationship[];            // All edges
  onHighlightCriticalPath?: (nodeIds: string[]) => void;  // Highlight callback
  onClearHighlight?: () => void;            // Clear highlight callback
}
```

### LeadTimeResult Structure

```typescript
interface LeadTimeResult {
  totalMinutes: number;                     // 7740
  totalHours: number;                       // 129
  totalDays: number;                        // 5.375
  formatted: string;                        // "5d 3h 20m"
  criticalPath: string[];                   // ["node1", "node2", "node3"]
  criticalPathNodes: CriticalPathNode[];    // Detailed critical path
  stageBreakdown: Record<string, number>;   // { "PLANNING": 120, ... }
  departmentBreakdown: Record<string, number>; // { "PRODUCT_TEAM": 240, ... }
}
```

## How It's Integrated

### In WorkflowCanvas

1. **State Added**: `highlightedCriticalPath: string[]`
2. **Panel Displayed**: Below the main content area
3. **Node Styling**: Applied via `className` prop to React Flow nodes
4. **CSS Class**: `.critical-path-node` applied when node is highlighted

```typescript
// In nodesWithHandlers calculation:
className: highlightedCriticalPath.includes(node.id) ? "critical-path-node" : ""
```

### LeadTimePanel Features

- **Display Sections**:
  - Total lead time with formatted breakdown
  - Critical path visualization with node list
  - Stage breakdown with progress bars
  - Department breakdown with progress bars
  - Bottleneck warning if severe nodes detected

- **User Actions**:
  - Expand/collapse sections
  - Highlight critical path (gold border + glow)
  - Clear highlighting
  - Export report as CSV

## Usage Example

To use the lead time calculator in your code:

```typescript
import {
  calculateWorkflowLeadTime,
  formatLeadTime,
  isNodeOnCriticalPath,
  calculateBottleneckSeverity,
} from "@/lib/leadTimeCalculator";

// Calculate metrics
const result = calculateWorkflowLeadTime(nodes, edges);

// Display total time
console.log(`Total lead time: ${result.formatted}`);

// Check if specific node is bottleneck
const isBottleneck =
  isNodeOnCriticalPath(nodeId, result.criticalPath) &&
  calculateBottleneckSeverity(
    calculateNodeLeadTime(node),
    result.totalMinutes
  ) === "CRITICAL";

// Show stage metrics
result.stageBreakdown; // { "PLANNING": 120, "DEVELOPMENT": 4320, ... }
```

## Time Format Support

### Supported Formats
| Format | Minutes | Example |
|--------|---------|---------|
| Minutes | 1 | "45m" |
| Hours | 60 | "2h" |
| Days | 1440 | "3d" |

### Case Insensitive
All formats are case-insensitive: "2H", "3D", "45M" all work

### With Whitespace
Whitespace is supported: "2 h", "3 d", "45 m" all work

## Critical Path Algorithm

Uses DFS (Depth-First Search) with memoization:

1. Build graph from nodes and edges
2. Find all start nodes (no incoming edges)
3. For each start node, traverse to find longest path
4. Memoize results to avoid recalculation
5. Return path with maximum total lead time

**Key Point**: "Longest" means by total lead time, not by node count. A path with 3 nodes of 2h each (6h total) is longer than a path with 5 nodes of 1h each (5h total).

## Bottleneck Detection

Nodes are considered bottlenecks if:
1. They are on the critical path AND
2. Their lead time is ≥30% of total critical path lead time

Severity Levels:
- **CRITICAL**: ≥50%
- **HIGH**: ≥40%
- **MEDIUM**: ≥30%
- **LOW**: <30%

## CSV Export Format

The exported CSV includes:
- Header with column names
- Row for each node with:
  - Node ID, Label, Department, Stage
  - Lead time (minutes and formatted)
  - Critical path membership (Yes/No)
  - Bottleneck severity
- Summary section with:
  - Total metrics
  - Stage breakdown
  - Department breakdown

## Testing

Run tests with:
```bash
pnpm test leadTimeCalculator
```

Tests cover:
- Time string parsing
- Time formatting
- Node calculations
- Critical path detection
- Stage/department aggregation
- Bottleneck severity
- Full workflow metrics

## Common Issues & Solutions

### Issue: Times not parsing
**Solution**: Ensure format is "NumberUnit" (e.g., "2h", not "h2" or "2 hours")

### Issue: Critical path empty
**Solution**: Check that nodes have valid `avg_time` in attributes

### Issue: Lead times don't match expected
**Solution**: Remember that 1 day = 1440 minutes = 24 hours

### Issue: Highlight not showing
**Solution**: Ensure `.critical-path-node` CSS class is loaded and node has proper className

## Performance Notes

- Memoization prevents recalculation on re-renders
- DFS algorithm is O(V+E) complexity
- Large workflows (>1000 nodes) may need optimization
- CSV export is done client-side (no backend call)

## Future Enhancements

- [ ] Lag time from edges in critical path calculation
- [ ] Resource-aware scheduling
- [ ] Historical lead time tracking
- [ ] Gantt chart generation
- [ ] Predictive analytics
- [ ] Integration with task scheduling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Keyboard navigation for expandable sections
- ARIA labels on interactive elements
- Color not the only visual indicator (uses borders/icons too)
- Sufficient color contrast ratios
- Screen reader friendly component structure
