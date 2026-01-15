/**
 * Lead Time Calculator - Automatic workflow lead time calculation
 *
 * Functions:
 * - Parse time strings (2h, 3d, 45m)
 * - Calculate node lead times
 * - Calculate total workflow lead time
 * - Identify critical path using longest path algorithm
 * - Calculate per-stage and per-department metrics
 */

import type { ActivityNode, WorkflowRelationship } from "@/types/workflow";

/**
 * Parse time string to minutes
 * Supports: "2h" (hours), "3d" (days), "45m" (minutes)
 * @throws Error if format is invalid
 */
export function parseTimeString(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }

  const trimmed = timeStr.trim().toLowerCase();

  // Match pattern: number followed by unit (h, d, m)
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([hdm])$/);

  if (!match) {
    console.warn(`Invalid time format: "${timeStr}". Expected format: "2h", "3d", or "45m".`);
    return 0;
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'h':
      return value * 60; // hours to minutes
    case 'd':
      return value * 24 * 60; // days to minutes
    case 'm':
      return value; // already in minutes
    default:
      return 0;
  }
}

/**
 * Calculate lead time for a single node
 * Extracts and parses avg_time from node attributes
 */
export function calculateNodeLeadTime(node: ActivityNode): number {
  if (!node.attributes?.avg_time) {
    return 0;
  }
  return parseTimeString(node.attributes.avg_time);
}

/**
 * Format minutes to human-readable string
 * Examples: "5d 3h 20m", "2h 30m", "45m"
 */
export function formatLeadTime(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "0m";
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}

/**
 * Result type for critical path analysis
 */
export interface CriticalPathNode {
  id: string;
  label: string;
  leadTime: number;
  position: number;
}

/**
 * Calculate critical path (longest path from start to end)
 * Uses DFS with memoization for efficiency
 * Returns the path with maximum total lead time
 */
export function calculateCriticalPath(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): {
  path: string[];
  nodes: CriticalPathNode[];
  totalMinutes: number;
} {
  if (nodes.length === 0) {
    return { path: [], nodes: [], totalMinutes: 0 };
  }

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const nodeMap = new Map<string, ActivityNode>();

  nodes.forEach(node => {
    nodeMap.set(node.id, node);
    adjacencyList.set(node.id, []);
  });

  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  // Find all start nodes (nodes with no incoming edges)
  const incomingEdges = new Set<string>();
  edges.forEach(edge => incomingEdges.add(edge.target));
  const startNodes = nodes.filter(n => !incomingEdges.has(n.id));

  // If no start nodes, use TRIGGER nodes
  const startingPoints = startNodes.length > 0
    ? startNodes
    : nodes.filter(n => n.type === "TRIGGER");

  // If still no starting points, use first node
  if (startingPoints.length === 0 && nodes.length > 0) {
    startingPoints.push(nodes[0]);
  }

  // DFS to find longest path from each starting point
  let longestPath: string[] = [];
  let longestDistance: number = 0;

  const memo = new Map<string, { distance: number; path: string[] }>();

  function dfs(nodeId: string): { distance: number; path: string[] } {
    if (memo.has(nodeId)) {
      return memo.get(nodeId)!;
    }

    const currentNode = nodeMap.get(nodeId);
    const currentDistance = currentNode ? calculateNodeLeadTime(currentNode) : 0;
    const neighbors = adjacencyList.get(nodeId) || [];

    if (neighbors.length === 0) {
      // Leaf node
      memo.set(nodeId, { distance: currentDistance, path: [nodeId] });
      return { distance: currentDistance, path: [nodeId] };
    }

    let maxDistance = currentDistance;
    let bestPath = [nodeId];

    for (const neighbor of neighbors) {
      const { distance: neighborDistance, path: neighborPath } = dfs(neighbor);
      const totalDistance = currentDistance + neighborDistance;

      if (totalDistance > maxDistance) {
        maxDistance = totalDistance;
        bestPath = [nodeId, ...neighborPath];
      }
    }

    memo.set(nodeId, { distance: maxDistance, path: bestPath });
    return { distance: maxDistance, path: bestPath };
  }

  // Find longest path starting from all possible start nodes
  for (const startNode of startingPoints) {
    const { distance, path } = dfs(startNode.id);
    if (distance > longestDistance) {
      longestDistance = distance;
      longestPath = path;
    }
  }

  // Convert path to CriticalPathNode objects
  const criticalPathNodes: CriticalPathNode[] = longestPath.map((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    return {
      id: nodeId,
      label: node?.label || "Unknown",
      leadTime: node ? calculateNodeLeadTime(node) : 0,
      position: index,
    };
  });

  return {
    path: longestPath,
    nodes: criticalPathNodes,
    totalMinutes: longestDistance,
  };
}

/**
 * Lead time result interface
 */
export interface LeadTimeResult {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  formatted: string;
  criticalPath: string[];
  criticalPathNodes: CriticalPathNode[];
  stageBreakdown: Record<string, number>;
  departmentBreakdown: Record<string, number>;
}

/**
 * Calculate total workflow lead time
 * Includes critical path identification and stage/department breakdowns
 */
export function calculateWorkflowLeadTime(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): LeadTimeResult {
  if (nodes.length === 0) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      totalDays: 0,
      formatted: "0m",
      criticalPath: [],
      criticalPathNodes: [],
      stageBreakdown: {},
      departmentBreakdown: {},
    };
  }

  // Calculate critical path
  const { path, nodes: criticalPathNodes, totalMinutes } = calculateCriticalPath(nodes, edges);

  // Calculate stage breakdown
  const stageBreakdown: Record<string, number> = {};
  nodes.forEach(node => {
    const leadTime = calculateNodeLeadTime(node);
    stageBreakdown[node.stage] = (stageBreakdown[node.stage] || 0) + leadTime;
  });

  // Calculate department breakdown
  const departmentBreakdown: Record<string, number> = {};
  nodes.forEach(node => {
    const leadTime = calculateNodeLeadTime(node);
    departmentBreakdown[node.department] = (departmentBreakdown[node.department] || 0) + leadTime;
  });

  // Convert to hours and days
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  const totalDays = Math.round((totalMinutes / (24 * 60)) * 100) / 100;

  return {
    totalMinutes,
    totalHours,
    totalDays,
    formatted: formatLeadTime(totalMinutes),
    criticalPath: path,
    criticalPathNodes,
    stageBreakdown,
    departmentBreakdown,
  };
}

/**
 * Calculate total lead time for nodes in a specific stage
 */
export function calculateStageLeadTime(nodes: ActivityNode[], stage: string): number {
  return nodes
    .filter(n => n.stage === stage)
    .reduce((sum, node) => sum + calculateNodeLeadTime(node), 0);
}

/**
 * Calculate total lead time for nodes in a specific department
 */
export function calculateDepartmentLeadTime(nodes: ActivityNode[], department: string): number {
  return nodes
    .filter(n => n.department === department)
    .reduce((sum, node) => sum + calculateNodeLeadTime(node), 0);
}

/**
 * Check if a node is on the critical path
 */
export function isNodeOnCriticalPath(nodeId: string, criticalPath: string[]): boolean {
  return criticalPath.includes(nodeId);
}

/**
 * Get bottleneck severity based on lead time percentage
 * Nodes using >30% of total workflow lead time are bottlenecks
 */
export function calculateBottleneckSeverity(
  nodePath: number,
  totalPath: number
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (totalPath === 0) return "LOW";

  const percentage = (nodePath / totalPath) * 100;

  if (percentage >= 50) return "CRITICAL";
  if (percentage >= 40) return "HIGH";
  if (percentage >= 30) return "MEDIUM";
  return "LOW";
}
