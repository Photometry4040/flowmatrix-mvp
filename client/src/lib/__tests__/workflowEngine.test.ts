import { describe, it, expect } from 'vitest';
import {
  checkPrerequisites,
  wouldCreateCycle,
  completeNode,
  type ActivityNode,
  type WorkflowRelationship,
} from '../workflowEngine';

describe('workflowEngine - Phase 5-6 Features', () => {
  describe('checkPrerequisites', () => {
    it('should allow completing node with no prerequisites', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: {
            tool: [],
            avg_time: '1h',
            is_repetitive: false,
            brain_usage: 'MEDIUM',
          },
          ontology_tags: [],
          position: { x: 0, y: 0 },
        },
      ];
      const edges: WorkflowRelationship[] = [];

      const result = checkPrerequisites('1', nodes, edges);

      expect(result.canComplete).toBe(true);
      expect(result.incompletePrerequisites).toEqual([]);
    });

    it('should allow completing node when all prerequisites are completed', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 0 },
          status: 'COMPLETED',
        },
        {
          id: '2',
          type: 'ACTION',
          label: 'Task 2',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 100, y: 0 },
          status: 'READY',
        },
      ];
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: '1', target: '2', type: 'DEPENDS_ON' },
      ];

      const result = checkPrerequisites('2', nodes, edges);

      expect(result.canComplete).toBe(true);
      expect(result.incompletePrerequisites).toEqual([]);
    });

    it('should prevent completing node when prerequisites are not completed', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 0 },
          status: 'READY', // Not completed
        },
        {
          id: '2',
          type: 'ACTION',
          label: 'Task 2',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 100, y: 0 },
          status: 'READY',
        },
      ];
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: '1', target: '2', type: 'DEPENDS_ON' },
      ];

      const result = checkPrerequisites('2', nodes, edges);

      expect(result.canComplete).toBe(false);
      expect(result.incompletePrerequisites).toEqual(['Task 1']);
    });

    it('should handle multiple incomplete prerequisites', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 0 },
          status: 'READY',
        },
        {
          id: '2',
          type: 'ACTION',
          label: 'Task 2',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 100 },
          status: 'PENDING',
        },
        {
          id: '3',
          type: 'ACTION',
          label: 'Task 3',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 100, y: 50 },
          status: 'READY',
        },
      ];
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: '1', target: '3', type: 'DEPENDS_ON' },
        { id: 'e2', source: '2', target: '3', type: 'DEPENDS_ON' },
      ];

      const result = checkPrerequisites('3', nodes, edges);

      expect(result.canComplete).toBe(false);
      expect(result.incompletePrerequisites).toContain('Task 1');
      expect(result.incompletePrerequisites).toContain('Task 2');
    });
  });

  describe('wouldCreateCycle', () => {
    it('should detect simple cycle (A -> B -> A)', () => {
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: 'A', target: 'B', type: 'DEPENDS_ON' },
      ];
      const newEdge = { source: 'B', target: 'A' };

      const result = wouldCreateCycle(newEdge, edges);

      expect(result).toBe(true);
    });

    it('should detect longer cycle (A -> B -> C -> A)', () => {
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: 'A', target: 'B', type: 'DEPENDS_ON' },
        { id: 'e2', source: 'B', target: 'C', type: 'DEPENDS_ON' },
      ];
      const newEdge = { source: 'C', target: 'A' };

      const result = wouldCreateCycle(newEdge, edges);

      expect(result).toBe(true);
    });

    it('should allow non-cyclic edge', () => {
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: 'A', target: 'B', type: 'DEPENDS_ON' },
        { id: 'e2', source: 'B', target: 'C', type: 'DEPENDS_ON' },
      ];
      const newEdge = { source: 'A', target: 'C' }; // Parallel path, no cycle

      const result = wouldCreateCycle(newEdge, edges);

      expect(result).toBe(false);
    });

    it('should handle complex DAG without cycle', () => {
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: 'A', target: 'B', type: 'DEPENDS_ON' },
        { id: 'e2', source: 'A', target: 'C', type: 'DEPENDS_ON' },
        { id: 'e3', source: 'B', target: 'D', type: 'DEPENDS_ON' },
        { id: 'e4', source: 'C', target: 'D', type: 'DEPENDS_ON' },
      ];
      const newEdge = { source: 'D', target: 'E' };

      const result = wouldCreateCycle(newEdge, edges);

      expect(result).toBe(false);
    });

    it('should detect self-loop', () => {
      const edges: WorkflowRelationship[] = [];
      const newEdge = { source: 'A', target: 'A' };

      const result = wouldCreateCycle(newEdge, edges);

      expect(result).toBe(true);
    });
  });

  describe('completeNode', () => {
    it('should throw error when prerequisites are incomplete', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 0 },
          status: 'READY',
        },
        {
          id: '2',
          type: 'ACTION',
          label: 'Task 2',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 100, y: 0 },
          status: 'READY',
        },
      ];
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: '1', target: '2', type: 'DEPENDS_ON' },
      ];

      expect(() => {
        completeNode('2', nodes, edges);
      }).toThrow(/선행 작업을 먼저 완료하세요/);
    });

    it('should successfully complete node when prerequisites are met', () => {
      const nodes: ActivityNode[] = [
        {
          id: '1',
          type: 'ACTION',
          label: 'Task 1',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 0, y: 0 },
          status: 'COMPLETED',
        },
        {
          id: '2',
          type: 'ACTION',
          label: 'Task 2',
          stage: 'DEVELOPMENT',
          department: 'SW_TEAM',
          attributes: { tool: [], avg_time: '1h', is_repetitive: false, brain_usage: 'MEDIUM' },
          ontology_tags: [],
          position: { x: 100, y: 0 },
          status: 'READY',
        },
      ];
      const edges: WorkflowRelationship[] = [
        { id: 'e1', source: '1', target: '2', type: 'DEPENDS_ON' },
      ];

      const updatedNodes = completeNode('2', nodes, edges);

      const completedNode = updatedNodes.find(n => n.id === '2');
      expect(completedNode?.status).toBe('COMPLETED');
      expect(completedNode?.progress).toBe(100);
      expect(completedNode?.completedAt).toBeDefined();
    });
  });
});
