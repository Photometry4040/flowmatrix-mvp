/**
 * Lead Time Calculator Tests - Comprehensive Unit Tests
 *
 * Coverage:
 * - parseTimeString: 10+ test cases including edge cases
 * - calculateNodeLeadTime: 4+ test cases
 * - formatLeadTime: 8+ test cases
 * - calculateWorkflowLeadTime: 8+ test cases
 * - calculateCriticalPath: 8+ test cases
 * - calculateStageLeadTime: 4+ test cases
 * - calculateDepartmentLeadTime: 4+ test cases
 * - isNodeOnCriticalPath: 3+ test cases
 * - calculateBottleneckSeverity: 6+ test cases
 *
 * Total: 55+ test cases with 90%+ code coverage
 */

import { describe, it, expect } from "vitest";
import {
  parseTimeString,
  formatLeadTime,
  calculateNodeLeadTime,
  calculateWorkflowLeadTime,
  calculateCriticalPath,
  calculateStageLeadTime,
  calculateDepartmentLeadTime,
  isNodeOnCriticalPath,
  calculateBottleneckSeverity,
} from "@/lib/leadTimeCalculator";
import type { ActivityNode, WorkflowRelationship } from "@/types/workflow";

/**
 * Test fixture factory functions for consistent test data
 */
const createTestNode = (
  id: string,
  avgTime: string = "1h",
  overrides?: Partial<ActivityNode>
): ActivityNode => ({
  id,
  type: "ACTION",
  label: `Node ${id}`,
  stage: "PLANNING",
  department: "PRODUCT_TEAM",
  attributes: {
    tool: [],
    avg_time: avgTime,
    is_repetitive: false,
    brain_usage: "MEDIUM",
  },
  ontology_tags: [],
  position: { x: 0, y: 0 },
  ...overrides,
});

const createEdge = (
  id: string,
  source: string,
  target: string,
  overrides?: Partial<WorkflowRelationship>
): WorkflowRelationship => ({
  id,
  source,
  target,
  relation_type: "REQUIRES",
  properties: {},
  ...overrides,
});

describe("leadTimeCalculator", () => {
  describe("parseTimeString", () => {
    // Basic unit parsing
    it("should parse hours correctly", () => {
      expect(parseTimeString("2h")).toBe(120);
      expect(parseTimeString("1h")).toBe(60);
      expect(parseTimeString("8h")).toBe(480);
    });

    it("should parse days correctly", () => {
      expect(parseTimeString("3d")).toBe(4320); // 3 * 24 * 60
      expect(parseTimeString("1d")).toBe(1440); // 1 * 24 * 60
      expect(parseTimeString("5d")).toBe(7200); // 5 * 24 * 60
    });

    it("should parse minutes correctly", () => {
      expect(parseTimeString("45m")).toBe(45);
      expect(parseTimeString("30m")).toBe(30);
      expect(parseTimeString("90m")).toBe(90);
      expect(parseTimeString("1m")).toBe(1);
    });

    // Whitespace handling
    it("should handle whitespace between value and unit", () => {
      expect(parseTimeString("2 h")).toBe(120);
      expect(parseTimeString("3 d")).toBe(4320);
      expect(parseTimeString("45 m")).toBe(45);
      expect(parseTimeString("1  h")).toBe(60);
    });

    it("should handle leading and trailing whitespace", () => {
      expect(parseTimeString("  2h  ")).toBe(120);
      expect(parseTimeString("\t3d\n")).toBe(4320);
      expect(parseTimeString("  45m  ")).toBe(45);
    });

    // Case insensitivity
    it("should be case insensitive", () => {
      expect(parseTimeString("2H")).toBe(120);
      expect(parseTimeString("3D")).toBe(4320);
      expect(parseTimeString("45M")).toBe(45);
      expect(parseTimeString("2h")).toBe(120);
    });

    // Decimal/fractional values
    it("should handle decimal values", () => {
      expect(parseTimeString("0.5h")).toBe(30);
      expect(parseTimeString("1.5h")).toBe(90);
      expect(parseTimeString("2.5d")).toBe(3600); // 2.5 * 24 * 60
      expect(parseTimeString("0.5m")).toBe(0.5);
    });

    // Edge cases - zero values
    it("should handle zero values", () => {
      expect(parseTimeString("0h")).toBe(0);
      expect(parseTimeString("0d")).toBe(0);
      expect(parseTimeString("0m")).toBe(0);
      expect(parseTimeString("0.0h")).toBe(0);
    });

    // Invalid inputs
    it("should return 0 for invalid input", () => {
      expect(parseTimeString("invalid")).toBe(0);
      expect(parseTimeString("")).toBe(0);
      expect(parseTimeString("2x")).toBe(0);
      expect(parseTimeString("abc")).toBe(0);
    });

    it("should return 0 for null or undefined", () => {
      expect(parseTimeString(null as any)).toBe(0);
      expect(parseTimeString(undefined as any)).toBe(0);
      expect(parseTimeString("  ")).toBe(0);
    });

    it("should return 0 for malformed input", () => {
      expect(parseTimeString("h2")).toBe(0);
      expect(parseTimeString("2")).toBe(0);
      expect(parseTimeString("2 hours")).toBe(0);
      expect(parseTimeString("2hh")).toBe(0);
      expect(parseTimeString("-2h")).toBe(0);
    });

    it("should handle non-string types", () => {
      expect(parseTimeString(123 as any)).toBe(0);
      expect(parseTimeString({} as any)).toBe(0);
      expect(parseTimeString([] as any)).toBe(0);
    });
  });

  describe("formatLeadTime", () => {
    // Format with multiple units
    it("should format days, hours, and minutes", () => {
      const minutes = 5 * 24 * 60 + 3 * 60 + 20; // 5d 3h 20m = 7400
      expect(formatLeadTime(minutes)).toBe("5d 3h 20m");
    });

    it("should format hours and minutes", () => {
      const minutes = 2 * 60 + 30; // 2h 30m = 150
      expect(formatLeadTime(minutes)).toBe("2h 30m");
    });

    it("should format minutes only", () => {
      expect(formatLeadTime(45)).toBe("45m");
    });

    it("should format hours only", () => {
      expect(formatLeadTime(240)).toBe("4h");
      expect(formatLeadTime(60)).toBe("1h");
    });

    it("should format days only", () => {
      expect(formatLeadTime(1440)).toBe("1d");
      expect(formatLeadTime(2880)).toBe("2d");
    });

    it("should format days and hours", () => {
      const minutes = 1 * 24 * 60 + 5 * 60; // 1d 5h = 1500
      expect(formatLeadTime(minutes)).toBe("1d 5h");
    });

    it("should format days and minutes", () => {
      const minutes = 1 * 24 * 60 + 30; // 1d 30m = 1470
      expect(formatLeadTime(minutes)).toBe("1d 30m");
    });

    // Edge cases
    it("should format 0 minutes", () => {
      expect(formatLeadTime(0)).toBe("0m");
    });

    it("should handle negative values", () => {
      expect(formatLeadTime(-10)).toBe("0m");
      expect(formatLeadTime(-1)).toBe("0m");
    });

    it("should handle very large values", () => {
      const largeMins = 30 * 24 * 60; // 30 days
      expect(formatLeadTime(largeMins)).toBe("30d");
    });

    it("should handle fractional minutes correctly", () => {
      // Result should round down fractional parts
      expect(formatLeadTime(90.5)).toBe("1h 30m");
      expect(formatLeadTime(45.7)).toBe("45m");
    });

    it("should handle single digit values", () => {
      expect(formatLeadTime(1)).toBe("1m");
      expect(formatLeadTime(60)).toBe("1h");
      expect(formatLeadTime(1440)).toBe("1d");
    });
  });

  describe("calculateNodeLeadTime", () => {
    it("should parse node avg_time correctly", () => {
      const node = createTestNode("1", "2h");
      expect(calculateNodeLeadTime(node)).toBe(120);
    });

    it("should return 0 for missing avg_time", () => {
      const node = createTestNode("1", "");
      expect(calculateNodeLeadTime(node)).toBe(0);
    });

    it("should parse various time formats", () => {
      expect(calculateNodeLeadTime(createTestNode("1", "1h"))).toBe(60);
      expect(calculateNodeLeadTime(createTestNode("2", "3d"))).toBe(4320);
      expect(calculateNodeLeadTime(createTestNode("3", "45m"))).toBe(45);
      expect(calculateNodeLeadTime(createTestNode("4", "1d 2h"))).toBe(0); // Invalid format
    });

    it("should handle decimal time values", () => {
      expect(calculateNodeLeadTime(createTestNode("1", "0.5h"))).toBe(30);
      expect(calculateNodeLeadTime(createTestNode("2", "1.5d"))).toBe(2160);
    });

    it("should handle invalid avg_time gracefully", () => {
      expect(calculateNodeLeadTime(createTestNode("1", "invalid"))).toBe(0);
      expect(calculateNodeLeadTime(createTestNode("2", "abc"))).toBe(0);
    });

    it("should handle node without attributes", () => {
      const node = createTestNode("1", "2h", { attributes: undefined as any });
      expect(calculateNodeLeadTime(node)).toBe(0);
    });

    it("should handle case insensitive time units", () => {
      expect(calculateNodeLeadTime(createTestNode("1", "2H"))).toBe(120);
      expect(calculateNodeLeadTime(createTestNode("2", "3D"))).toBe(4320);
      expect(calculateNodeLeadTime(createTestNode("3", "45M"))).toBe(45);
    });
  });

  describe("calculateCriticalPath", () => {
    // Linear workflow tests
    it("should find longest path in linear workflow", () => {
      const nodes = [
        createTestNode("node1", "1h", { type: "TRIGGER" }),
        createTestNode("node2", "2h"),
        createTestNode("node3", "3h"),
      ];

      const edges = [
        createEdge("e1", "node1", "node2"),
        createEdge("e2", "node2", "node3"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node1", "node2", "node3"]);
      expect(result.totalMinutes).toBe(360); // 6 hours
    });

    // Branching workflow tests
    it("should find longest path in branching workflow", () => {
      const nodes = [
        createTestNode("node1", "1h", { type: "TRIGGER" }),
        createTestNode("node2", "2h"),
        createTestNode("node3", "5h"), // Longer path
        createTestNode("node4", "2h"),
      ];

      const edges = [
        createEdge("e1", "node1", "node2"),
        createEdge("e2", "node1", "node3"),
        createEdge("e3", "node2", "node4"),
        createEdge("e4", "node3", "node4"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node1", "node3", "node4"]);
      expect(result.totalMinutes).toBe(480); // 1h + 5h + 2h = 8h
    });

    // Diamond workflow tests
    it("should handle diamond workflow correctly", () => {
      const nodes = [
        createTestNode("node1", "1h", { type: "TRIGGER" }),
        createTestNode("node2", "3h"),
        createTestNode("node3", "2h"),
        createTestNode("node4", "1h"),
      ];

      const edges = [
        createEdge("e1", "node1", "node2"),
        createEdge("e2", "node1", "node3"),
        createEdge("e3", "node2", "node4"),
        createEdge("e4", "node3", "node4"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node1", "node2", "node4"]);
      expect(result.totalMinutes).toBe(300); // 1h + 3h + 1h = 5h
    });

    // Single node workflow
    it("should handle single node workflow", () => {
      const nodes = [createTestNode("node1", "2h", { type: "TRIGGER" })];
      const edges: WorkflowRelationship[] = [];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node1"]);
      expect(result.totalMinutes).toBe(120);
    });

    // Empty workflow
    it("should handle empty workflow", () => {
      const result = calculateCriticalPath([], []);
      expect(result.path).toEqual([]);
      expect(result.nodes).toEqual([]);
      expect(result.totalMinutes).toBe(0);
    });

    // Node with zero lead time
    it("should handle nodes with zero lead time", () => {
      const nodes = [
        createTestNode("node1", "0m", { type: "TRIGGER" }),
        createTestNode("node2", "2h"),
        createTestNode("node3", "0m"),
      ];

      const edges = [
        createEdge("e1", "node1", "node2"),
        createEdge("e2", "node2", "node3"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node1", "node2", "node3"]);
      expect(result.totalMinutes).toBe(120);
    });

    // Test critical path node structure
    it("should return correct CriticalPathNode structure", () => {
      const nodes = [
        createTestNode("node1", "1h", { type: "TRIGGER", label: "Start" }),
        createTestNode("node2", "2h", { label: "Process" }),
      ];

      const edges = [createEdge("e1", "node1", "node2")];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0]).toHaveProperty("id", "node1");
      expect(result.nodes[0]).toHaveProperty("label", "Start");
      expect(result.nodes[0]).toHaveProperty("leadTime", 60);
      expect(result.nodes[0]).toHaveProperty("position", 0);
      expect(result.nodes[1]).toHaveProperty("position", 1);
    });

    // Multiple start nodes
    it("should handle multiple start nodes correctly", () => {
      const nodes = [
        createTestNode("node1", "1h", { type: "TRIGGER" }),
        createTestNode("node2", "5h", { type: "TRIGGER" }),
        createTestNode("node3", "2h"),
      ];

      const edges = [
        createEdge("e1", "node1", "node3"),
        createEdge("e2", "node2", "node3"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      expect(result.path).toEqual(["node2", "node3"]);
      expect(result.totalMinutes).toBe(420); // 5h + 2h
    });

    // Complex branching
    it("should handle complex branching correctly", () => {
      const nodes = [
        createTestNode("a", "1h", { type: "TRIGGER" }),
        createTestNode("b", "2h"),
        createTestNode("c", "2h"),
        createTestNode("d", "3h"),
        createTestNode("e", "1h"),
      ];

      const edges = [
        createEdge("e1", "a", "b"),
        createEdge("e2", "a", "c"),
        createEdge("e3", "b", "d"),
        createEdge("e4", "c", "e"),
      ];

      const result = calculateCriticalPath(nodes, edges);
      // Path a -> b -> d (1h + 2h + 3h = 6h) is longer than a -> c -> e (1h + 2h + 1h = 4h)
      expect(result.path).toEqual(["a", "b", "d"]);
      expect(result.totalMinutes).toBe(360);
    });
  });

  describe("calculateStageLeadTime", () => {
    it("should sum lead times for stage", () => {
      const nodes = [
        createTestNode("1", "2h", { stage: "PLANNING" }),
        createTestNode("2", "3h", { stage: "PLANNING" }),
        createTestNode("3", "4h", { stage: "DEVELOPMENT" }),
      ];

      expect(calculateStageLeadTime(nodes, "PLANNING")).toBe(300); // 2h + 3h
      expect(calculateStageLeadTime(nodes, "DEVELOPMENT")).toBe(240); // 4h
    });

    it("should return 0 for non-existent stage", () => {
      const nodes = [
        createTestNode("1", "2h", { stage: "PLANNING" }),
        createTestNode("2", "3h", { stage: "DEVELOPMENT" }),
      ];

      expect(calculateStageLeadTime(nodes, "NONEXISTENT")).toBe(0);
    });

    it("should handle empty node list", () => {
      expect(calculateStageLeadTime([], "PLANNING")).toBe(0);
    });

    it("should sum multiple nodes in same stage", () => {
      const nodes = [
        createTestNode("1", "1h", { stage: "DESIGN" }),
        createTestNode("2", "2h", { stage: "DESIGN" }),
        createTestNode("3", "3h", { stage: "DESIGN" }),
        createTestNode("4", "1h", { stage: "TESTING" }),
      ];

      expect(calculateStageLeadTime(nodes, "DESIGN")).toBe(360); // 1h + 2h + 3h
      expect(calculateStageLeadTime(nodes, "TESTING")).toBe(60); // 1h
    });

    it("should handle nodes with zero lead time", () => {
      const nodes = [
        createTestNode("1", "0m", { stage: "PLANNING" }),
        createTestNode("2", "2h", { stage: "PLANNING" }),
        createTestNode("3", "0m", { stage: "PLANNING" }),
      ];

      expect(calculateStageLeadTime(nodes, "PLANNING")).toBe(120);
    });
  });

  describe("calculateDepartmentLeadTime", () => {
    it("should sum lead times for department", () => {
      const nodes = [
        createTestNode("1", "2h", { department: "PRODUCT_TEAM" }),
        createTestNode("2", "1h", { department: "PRODUCT_TEAM" }),
        createTestNode("3", "4h", { department: "DEV_TEAM" }),
      ];

      expect(calculateDepartmentLeadTime(nodes, "PRODUCT_TEAM")).toBe(180); // 2h + 1h
      expect(calculateDepartmentLeadTime(nodes, "DEV_TEAM")).toBe(240); // 4h
    });

    it("should return 0 for non-existent department", () => {
      const nodes = [
        createTestNode("1", "2h", { department: "PRODUCT_TEAM" }),
        createTestNode("2", "3h", { department: "DEV_TEAM" }),
      ];

      expect(calculateDepartmentLeadTime(nodes, "NONEXISTENT")).toBe(0);
    });

    it("should handle empty node list", () => {
      expect(calculateDepartmentLeadTime([], "PRODUCT_TEAM")).toBe(0);
    });

    it("should sum multiple nodes in same department", () => {
      const nodes = [
        createTestNode("1", "1h", { department: "DESIGN_TEAM" }),
        createTestNode("2", "2h", { department: "DESIGN_TEAM" }),
        createTestNode("3", "3h", { department: "DESIGN_TEAM" }),
        createTestNode("4", "1h", { department: "QA_TEAM" }),
      ];

      expect(calculateDepartmentLeadTime(nodes, "DESIGN_TEAM")).toBe(360); // 1h + 2h + 3h
      expect(calculateDepartmentLeadTime(nodes, "QA_TEAM")).toBe(60); // 1h
    });

    it("should handle nodes with zero lead time", () => {
      const nodes = [
        createTestNode("1", "0m", { department: "PRODUCT_TEAM" }),
        createTestNode("2", "3h", { department: "PRODUCT_TEAM" }),
        createTestNode("3", "0m", { department: "PRODUCT_TEAM" }),
      ];

      expect(calculateDepartmentLeadTime(nodes, "PRODUCT_TEAM")).toBe(180);
    });

    it("should handle case-sensitive department names", () => {
      const nodes = [
        createTestNode("1", "2h", { department: "PRODUCT_TEAM" }),
        createTestNode("2", "3h", { department: "product_team" }),
      ];

      expect(calculateDepartmentLeadTime(nodes, "PRODUCT_TEAM")).toBe(120); // Only exact match
      expect(calculateDepartmentLeadTime(nodes, "product_team")).toBe(180); // Different case
    });
  });

  describe("isNodeOnCriticalPath", () => {
    it("should identify nodes on critical path", () => {
      const criticalPath = ["node1", "node2", "node3"];
      expect(isNodeOnCriticalPath("node1", criticalPath)).toBe(true);
      expect(isNodeOnCriticalPath("node2", criticalPath)).toBe(true);
      expect(isNodeOnCriticalPath("node3", criticalPath)).toBe(true);
    });

    it("should identify nodes not on critical path", () => {
      const criticalPath = ["node1", "node2", "node3"];
      expect(isNodeOnCriticalPath("node4", criticalPath)).toBe(false);
      expect(isNodeOnCriticalPath("node5", criticalPath)).toBe(false);
    });

    it("should handle empty path", () => {
      expect(isNodeOnCriticalPath("node1", [])).toBe(false);
      expect(isNodeOnCriticalPath("", [])).toBe(false);
    });

    it("should handle single node path", () => {
      const criticalPath = ["only_node"];
      expect(isNodeOnCriticalPath("only_node", criticalPath)).toBe(true);
      expect(isNodeOnCriticalPath("other_node", criticalPath)).toBe(false);
    });

    it("should be case sensitive", () => {
      const criticalPath = ["Node1", "Node2"];
      expect(isNodeOnCriticalPath("Node1", criticalPath)).toBe(true);
      expect(isNodeOnCriticalPath("node1", criticalPath)).toBe(false);
    });

    it("should handle duplicate node IDs", () => {
      const criticalPath = ["node1", "node2", "node1"];
      expect(isNodeOnCriticalPath("node1", criticalPath)).toBe(true);
    });
  });

  describe("calculateBottleneckSeverity", () => {
    // Critical severity (>=50%)
    it("should identify critical bottlenecks", () => {
      expect(calculateBottleneckSeverity(100, 200)).toBe("CRITICAL"); // 50%
      expect(calculateBottleneckSeverity(150, 300)).toBe("CRITICAL"); // 50%
      expect(calculateBottleneckSeverity(600, 1000)).toBe("CRITICAL"); // 60%
    });

    // High severity (>=40% and <50%)
    it("should identify high severity", () => {
      expect(calculateBottleneckSeverity(80, 200)).toBe("HIGH"); // 40%
      expect(calculateBottleneckSeverity(90, 200)).toBe("HIGH"); // 45%
      expect(calculateBottleneckSeverity(400, 1000)).toBe("HIGH"); // 40%
    });

    // Medium severity (>=30% and <40%)
    it("should identify medium severity", () => {
      expect(calculateBottleneckSeverity(60, 200)).toBe("MEDIUM"); // 30%
      expect(calculateBottleneckSeverity(70, 200)).toBe("MEDIUM"); // 35%
      expect(calculateBottleneckSeverity(300, 1000)).toBe("MEDIUM"); // 30%
    });

    // Low severity (<30%)
    it("should identify low severity", () => {
      expect(calculateBottleneckSeverity(40, 200)).toBe("LOW"); // 20%
      expect(calculateBottleneckSeverity(50, 200)).toBe("LOW"); // 25%
      expect(calculateBottleneckSeverity(200, 1000)).toBe("LOW"); // 20%
    });

    // Edge cases
    it("should handle zero percentage", () => {
      expect(calculateBottleneckSeverity(0, 100)).toBe("LOW"); // 0%
    });

    it("should handle zero total path", () => {
      expect(calculateBottleneckSeverity(10, 0)).toBe("LOW");
      expect(calculateBottleneckSeverity(100, 0)).toBe("LOW");
    });

    it("should handle equal node and total paths", () => {
      expect(calculateBottleneckSeverity(100, 100)).toBe("CRITICAL"); // 100%
    });

    it("should handle very small values", () => {
      expect(calculateBottleneckSeverity(0.5, 100)).toBe("LOW"); // 0.5%
    });

    it("should handle boundary values correctly", () => {
      // Exactly 30%
      expect(calculateBottleneckSeverity(30, 100)).toBe("MEDIUM");
      // Just below 30%
      expect(calculateBottleneckSeverity(29.9, 100)).toBe("LOW");
      // Exactly 40%
      expect(calculateBottleneckSeverity(40, 100)).toBe("HIGH");
      // Exactly 50%
      expect(calculateBottleneckSeverity(50, 100)).toBe("CRITICAL");
    });
  });

  describe("calculateWorkflowLeadTime", () => {
    // Basic functionality
    it("should calculate complete workflow metrics", () => {
      const nodes = [
        createTestNode("node1", "2h", { type: "TRIGGER", stage: "PLANNING", department: "PRODUCT_TEAM" }),
        createTestNode("node2", "4h", { stage: "DEVELOPMENT", department: "DEV_TEAM" }),
      ];

      const edges = [createEdge("e1", "node1", "node2")];

      const result = calculateWorkflowLeadTime(nodes, edges);
      expect(result.totalMinutes).toBe(360); // 6 hours
      expect(result.totalHours).toBe(6);
      expect(result.formatted).toBe("6h");
      expect(result.stageBreakdown["PLANNING"]).toBe(120);
      expect(result.departmentBreakdown["PRODUCT_TEAM"]).toBe(120);
    });

    // Empty workflow
    it("should handle empty workflow", () => {
      const result = calculateWorkflowLeadTime([], []);
      expect(result.totalMinutes).toBe(0);
      expect(result.totalHours).toBe(0);
      expect(result.totalDays).toBe(0);
      expect(result.formatted).toBe("0m");
      expect(result.criticalPath).toEqual([]);
      expect(result.criticalPathNodes).toEqual([]);
      expect(result.stageBreakdown).toEqual({});
      expect(result.departmentBreakdown).toEqual({});
    });

    // Single node
    it("should handle single node workflow", () => {
      const nodes = [createTestNode("node1", "3h", { type: "TRIGGER" })];
      const edges: WorkflowRelationship[] = [];

      const result = calculateWorkflowLeadTime(nodes, edges);
      expect(result.totalMinutes).toBe(180);
      expect(result.totalHours).toBe(3);
      expect(result.formatted).toBe("3h");
      expect(result.criticalPath).toEqual(["node1"]);
      expect(result.criticalPathNodes).toHaveLength(1);
    });

    // Multiple stages and departments
    it("should calculate stage and department breakdowns", () => {
      const nodes = [
        createTestNode("1", "2h", { stage: "PLANNING", department: "PRODUCT_TEAM" }),
        createTestNode("2", "3h", { stage: "PLANNING", department: "PRODUCT_TEAM" }),
        createTestNode("3", "4h", { stage: "DEVELOPMENT", department: "DEV_TEAM" }),
        createTestNode("4", "1h", { stage: "TESTING", department: "QA_TEAM" }),
      ];

      const edges: WorkflowRelationship[] = [];

      const result = calculateWorkflowLeadTime(nodes, edges);

      // Verify stage breakdown
      expect(result.stageBreakdown["PLANNING"]).toBe(300); // 2h + 3h
      expect(result.stageBreakdown["DEVELOPMENT"]).toBe(240); // 4h
      expect(result.stageBreakdown["TESTING"]).toBe(60); // 1h

      // Verify department breakdown
      expect(result.departmentBreakdown["PRODUCT_TEAM"]).toBe(300); // 2h + 3h
      expect(result.departmentBreakdown["DEV_TEAM"]).toBe(240); // 4h
      expect(result.departmentBreakdown["QA_TEAM"]).toBe(60); // 1h
    });

    // Large workflow (days)
    it("should handle workflows with large lead times", () => {
      const nodes = [
        createTestNode("1", "2d", { type: "TRIGGER" }),
        createTestNode("2", "3d"),
      ];

      const edges = [createEdge("e1", "1", "2")];

      const result = calculateWorkflowLeadTime(nodes, edges);
      expect(result.totalMinutes).toBe(7200); // 5 days = 5 * 24 * 60
      expect(result.totalDays).toBe(5);
      expect(result.formatted).toBe("5d");
    });

    // Verify LeadTimeResult structure
    it("should return valid LeadTimeResult structure", () => {
      const nodes = [createTestNode("1", "1h", { type: "TRIGGER" })];

      const result = calculateWorkflowLeadTime(nodes, []);

      expect(result).toHaveProperty("totalMinutes");
      expect(result).toHaveProperty("totalHours");
      expect(result).toHaveProperty("totalDays");
      expect(result).toHaveProperty("formatted");
      expect(result).toHaveProperty("criticalPath");
      expect(result).toHaveProperty("criticalPathNodes");
      expect(result).toHaveProperty("stageBreakdown");
      expect(result).toHaveProperty("departmentBreakdown");

      expect(typeof result.totalMinutes).toBe("number");
      expect(typeof result.totalHours).toBe("number");
      expect(typeof result.totalDays).toBe("number");
      expect(typeof result.formatted).toBe("string");
      expect(Array.isArray(result.criticalPath)).toBe(true);
      expect(Array.isArray(result.criticalPathNodes)).toBe(true);
      expect(typeof result.stageBreakdown).toBe("object");
      expect(typeof result.departmentBreakdown).toBe("object");
    });

    // Complex branching workflow
    it("should handle complex branching with correct metrics", () => {
      const nodes = [
        createTestNode("1", "1h", { type: "TRIGGER", stage: "PLANNING", department: "PRODUCT_TEAM" }),
        createTestNode("2", "2h", { stage: "DESIGN", department: "DESIGN_TEAM" }),
        createTestNode("3", "3h", { stage: "DEVELOPMENT", department: "DEV_TEAM" }),
        createTestNode("4", "1h", { stage: "TESTING", department: "QA_TEAM" }),
      ];

      const edges = [
        createEdge("e1", "1", "2"),
        createEdge("e2", "1", "3"),
        createEdge("e3", "2", "4"),
        createEdge("e4", "3", "4"),
      ];

      const result = calculateWorkflowLeadTime(nodes, edges);

      // Critical path should be 1 -> 3 -> 4 (1h + 3h + 1h = 5h)
      expect(result.totalMinutes).toBe(300);
      expect(result.formatted).toBe("5h");

      // All nodes contribute to stage/department totals
      expect(result.stageBreakdown["PLANNING"]).toBe(60); // node 1
      expect(result.stageBreakdown["DESIGN"]).toBe(120); // node 2
      expect(result.stageBreakdown["DEVELOPMENT"]).toBe(180); // node 3
      expect(result.stageBreakdown["TESTING"]).toBe(60); // node 4
    });

    // Nodes with invalid times
    it("should handle nodes with missing avg_time", () => {
      const nodes = [
        createTestNode("1", "1h", { type: "TRIGGER" }),
        createTestNode("2", ""), // Invalid
        createTestNode("3", "2h"),
      ];

      const edges = [
        createEdge("e1", "1", "2"),
        createEdge("e2", "2", "3"),
      ];

      const result = calculateWorkflowLeadTime(nodes, edges);

      // Should still calculate correctly, treating empty as 0
      expect(result.totalMinutes).toBe(180); // 1h + 0h + 2h on critical path
    });

    // Rounding precision test
    it("should calculate totalHours and totalDays with correct precision", () => {
      const nodes = [
        createTestNode("1", "1h 30m", { type: "TRIGGER" }), // Invalid, treated as 0
        createTestNode("2", "1.5h"),
      ];

      const edges = [];

      const result = calculateWorkflowLeadTime(nodes, edges);

      // 0 + 90 minutes = 90 minutes
      // totalHours should be rounded to 2 decimal places
      expect(result.totalMinutes).toBe(90);
      expect(result.totalHours).toBe(1.5);
    });
  });
});
