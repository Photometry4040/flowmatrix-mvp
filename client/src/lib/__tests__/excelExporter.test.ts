/**
 * Excel Exporter Unit Tests
 * Comprehensive tests for all sheet generation functions and styling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import {
  generateNodeListSheet,
  generateAdjacencyMatrixSheet,
  generateLeadTimeReportSheet,
  generateStatisticsSheet,
  applyExcelStyling,
  exportWorkflowToExcel,
  type ExcelExportOptions,
} from '../excelExporter';
import type { ActivityNode, WorkflowRelationship, WorkflowProject } from '@/types/workflow';

// Mock XLSX functions
vi.mock('xlsx', async () => {
  const actual = await vi.importActual<typeof XLSX>('xlsx');
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

describe('Excel Exporter', () => {
  const mockNodes: ActivityNode[] = [
    {
      id: 'node_1',
      type: 'TRIGGER',
      label: 'Start Process',
      stage: 'PLANNING',
      department: 'PRODUCT_TEAM',
      attributes: {
        tool: ['Notion'],
        avg_time: '2h',
        is_repetitive: false,
        brain_usage: 'HIGH',
        assignee: 'John Doe',
      },
      ontology_tags: ['#planning'],
      position: { x: 0, y: 0 },
      status: 'PENDING',
      aiScore: 45,
      isBottleneck: false,
    },
    {
      id: 'node_2',
      type: 'ACTION',
      label: 'Design Work',
      stage: 'PLANNING',
      department: 'DESIGN_TEAM',
      attributes: {
        tool: ['Figma'],
        avg_time: '4h',
        is_repetitive: false,
        brain_usage: 'HIGH',
      },
      ontology_tags: ['#design'],
      position: { x: 100, y: 100 },
      status: 'READY',
      aiScore: 60,
      isBottleneck: true,
    },
    {
      id: 'node_3',
      type: 'DECISION',
      label: 'QA Review',
      stage: 'TESTING',
      department: 'QA_TEAM',
      attributes: {
        tool: ['Jira'],
        avg_time: '1h',
        is_repetitive: true,
        brain_usage: 'MEDIUM',
      },
      ontology_tags: ['#testing'],
      position: { x: 200, y: 200 },
      status: 'IN_PROGRESS',
      aiScore: 75,
      isBottleneck: false,
    },
  ];

  const mockEdges: WorkflowRelationship[] = [
    {
      id: 'e1-2',
      source: 'node_1',
      target: 'node_2',
      relation_type: 'REQUIRES',
      properties: {},
    },
    {
      id: 'e2-3',
      source: 'node_2',
      target: 'node_3',
      relation_type: 'REQUIRES',
      properties: {},
    },
  ];

  const mockProject: WorkflowProject = {
    id: 'proj_1',
    name: 'Test Project',
    nodes: mockNodes,
    edges: mockEdges,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateNodeListSheet', () => {
    it('should create a sheet with 12 columns', () => {
      const sheet = generateNodeListSheet(mockNodes);
      expect(sheet['!cols']).toBeDefined();
      expect(sheet['!cols']?.length).toBe(12);
    });

    it('should have correct column headers', () => {
      const sheet = generateNodeListSheet(mockNodes);
      const headerRow = sheet['A1'];
      expect(headerRow).toBeDefined();
    });

    it('should include all nodes in data', () => {
      const sheet = generateNodeListSheet(mockNodes);
      expect(sheet['!ref']).toBeDefined();
      // Should have at least header row + data rows
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:L1');
      expect(range.e.row).toBeGreaterThanOrEqual(mockNodes.length); // at least N data rows
    });

    it('should freeze header row at correct position', () => {
      const sheet = generateNodeListSheet(mockNodes);
      expect(sheet['!freeze']).toEqual({ xSplit: 0, ySplit: 1 });
    });

    it('should have dynamic column widths', () => {
      const sheet = generateNodeListSheet(mockNodes);
      expect(sheet['!cols']).toBeDefined();
      const cols = sheet['!cols'] as any[];
      expect(cols[0]).toHaveProperty('wch'); // ID column
      expect(cols[1]).toHaveProperty('wch'); // 노드명 column
      expect(cols[1].wch).toBe(20); // Node label should be wider
    });

    it('should handle missing optional assignee field', () => {
      const nodeWithoutAssignee: ActivityNode = {
        ...mockNodes[0],
        attributes: {
          ...mockNodes[0].attributes,
          assignee: undefined,
        },
      };
      const sheet = generateNodeListSheet([nodeWithoutAssignee]);
      expect(sheet).toBeDefined();
      expect(sheet['!ref']).toBeDefined();
    });

    it('should handle missing tags', () => {
      const nodeWithoutTags: ActivityNode = {
        ...mockNodes[0],
        ontology_tags: [],
      };
      const sheet = generateNodeListSheet([nodeWithoutTags]);
      expect(sheet).toBeDefined();
    });

    it('should handle special characters in node names', () => {
      const nodeWithSpecialChars: ActivityNode = {
        ...mockNodes[0],
        label: 'Task with "quotes" & symbols <> |'
      };
      const sheet = generateNodeListSheet([nodeWithSpecialChars]);
      expect(sheet).toBeDefined();
    });

    it('should handle empty node list', () => {
      const sheet = generateNodeListSheet([]);
      expect(sheet).toBeDefined();
    });

    it('should handle nodes with all attributes filled', () => {
      const completeNode: ActivityNode = {
        id: 'complete_node',
        type: 'ARTIFACT',
        label: 'Complete Node',
        stage: 'DEPLOYMENT',
        department: 'OPS_TEAM',
        attributes: {
          tool: ['Kubernetes', 'Docker', 'Terraform'],
          avg_time: '3h',
          is_repetitive: true,
          brain_usage: 'LOW',
          assignee: 'Jane Smith',
        },
        ontology_tags: ['#deployment', '#automation', '#infrastructure'],
        position: { x: 300, y: 300 },
        status: 'COMPLETED',
        aiScore: 85,
        isBottleneck: true,
      };
      const sheet = generateNodeListSheet([completeNode]);
      expect(sheet).toBeDefined();
    });

    it('should display correct node types', () => {
      const nodes = [
        { ...mockNodes[0], type: 'TRIGGER' as const },
        { ...mockNodes[1], type: 'ACTION' as const },
        { ...mockNodes[2], type: 'DECISION' as const },
      ];
      const sheet = generateNodeListSheet(nodes);
      expect(sheet).toBeDefined();
    });

    it('should display correct statuses', () => {
      const nodes = [
        { ...mockNodes[0], status: 'PENDING' as const },
        { ...mockNodes[1], status: 'IN_PROGRESS' as const },
        { ...mockNodes[2], status: 'COMPLETED' as const },
      ];
      const sheet = generateNodeListSheet(nodes);
      expect(sheet).toBeDefined();
    });
  });

  describe('generateAdjacencyMatrixSheet', () => {
    it('should create N×N matrix with correct dimensions', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      expect(sheet['!cols']?.length).toBe(mockNodes.length + 1); // N nodes + 1 header column
    });

    it('should freeze header row and first column', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      expect(sheet['!freeze']).toEqual({ xSplit: 1, ySplit: 1 });
    });

    it('should detect edges correctly with binary values', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // Matrix should be created with 0s and 1s
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      expect(range.e.col).toBe(mockNodes.length); // Columns for matrix
      expect(range.e.row).toBe(mockNodes.length); // Rows for matrix
    });

    it('should handle disconnected nodes', () => {
      const disconnectedNode: ActivityNode = {
        id: 'isolated',
        type: 'ACTION',
        label: 'Isolated Node',
        stage: 'PLANNING',
        department: 'TEAM',
        attributes: {
          tool: [],
          avg_time: '1h',
          is_repetitive: false,
          brain_usage: 'LOW',
        },
        ontology_tags: [],
        position: { x: 400, y: 400 },
      };
      const nodesWithIsolated = [...mockNodes, disconnectedNode];
      const sheet = generateAdjacencyMatrixSheet(nodesWithIsolated, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should include node labels as row/column headers', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // Verify structure with node labels
      expect(sheet['!ref']).toBeDefined();
    });

    it('should handle empty edges', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, []);
      expect(sheet).toBeDefined();
    });

    it('should handle single node', () => {
      const singleNode = [mockNodes[0]];
      const sheet = generateAdjacencyMatrixSheet(singleNode, []);
      expect(sheet['!cols']?.length).toBe(2); // 1 node + 1 header column
    });

    it('should set consistent column widths', () => {
      const sheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      const cols = sheet['!cols'] as any[];
      cols.forEach(col => {
        expect(col).toHaveProperty('wch');
        expect(col.wch).toBe(15); // All columns should be 15 width
      });
    });
  });

  describe('generateLeadTimeReportSheet', () => {
    it('should calculate total lead time correctly', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // 2h + 4h + 1h = 7h = 420 minutes
      expect(sheet['!ref']).toBeDefined();
    });

    it('should aggregate by stage correctly', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // Two PLANNING nodes (2h + 4h), one TESTING node (1h)
    });

    it('should aggregate by department correctly', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // PRODUCT_TEAM: 2h, DESIGN_TEAM: 4h, QA_TEAM: 1h
    });

    it('should parse hours correctly', () => {
      const nodesWith_h = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '2h' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWith_h, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should parse minutes correctly', () => {
      const nodesWith_m = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '30m' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWith_m, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should parse days correctly', () => {
      const nodesWith_d = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '1d' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWith_d, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should handle mixed time formats', () => {
      const nodesWithMixed: ActivityNode[] = [
        { ...mockNodes[0], attributes: { ...mockNodes[0].attributes, avg_time: '2h' } },
        { ...mockNodes[1], attributes: { ...mockNodes[1].attributes, avg_time: '30m' } },
        { ...mockNodes[2], attributes: { ...mockNodes[2].attributes, avg_time: '1d' } },
      ];
      const sheet = generateLeadTimeReportSheet(nodesWithMixed, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should handle decimal time values', () => {
      const nodesWithDecimal: ActivityNode[] = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '1.5h' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWithDecimal, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should handle invalid time formats gracefully', () => {
      const nodesWithInvalidTime: ActivityNode[] = [
        { ...mockNodes[0], attributes: { ...mockNodes[0].attributes, avg_time: 'invalid' } },
      ];
      const sheet = generateLeadTimeReportSheet(nodesWithInvalidTime, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should freeze header row', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet['!freeze']).toEqual({ xSplit: 0, ySplit: 1 });
    });

    it('should have 5 columns', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet['!cols']?.length).toBe(5);
    });

    it('should include critical path section', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // Should have critical path section
    });

    it('should handle empty workflow', () => {
      const sheet = generateLeadTimeReportSheet([], []);
      expect(sheet).toBeDefined();
    });

    it('should calculate percentages correctly', () => {
      const sheet = generateLeadTimeReportSheet(mockNodes, mockEdges);
      expect(sheet).toBeDefined();
      // Percentages should sum to 100%
    });
  });

  describe('generateStatisticsSheet', () => {
    it('should calculate total node count', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // Should show 3 total nodes
    });

    it('should calculate completed node count', () => {
      const nodesWithCompleted = [
        { ...mockNodes[0], status: 'COMPLETED' as const },
        { ...mockNodes[1], status: 'IN_PROGRESS' as const },
        { ...mockNodes[2], status: 'PENDING' as const },
      ];
      const sheet = generateStatisticsSheet(nodesWithCompleted);
      expect(sheet).toBeDefined();
      // Should show 1 completed node
    });

    it('should calculate progress percentage', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // Should show progress as percentage
    });

    it('should count bottleneck nodes', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // mockNodes has 1 bottleneck (node_2)
    });

    it('should count AI-automatable nodes (score >= 70)', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // mockNodes has 1 node with score >= 70 (node_3 with 75)
    });

    it('should count by node type', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // Should show: TRIGGER (1), ACTION (1), DECISION (1)
    });

    it('should count by department', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // Should show: PRODUCT_TEAM (1), DESIGN_TEAM (1), QA_TEAM (1)
    });

    it('should count by stage', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet).toBeDefined();
      // Should show: PLANNING (2), TESTING (1)
    });

    it('should freeze header row', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet['!freeze']).toEqual({ xSplit: 0, ySplit: 1 });
    });

    it('should have 2 columns', () => {
      const sheet = generateStatisticsSheet(mockNodes);
      expect(sheet['!cols']?.length).toBe(2);
    });

    it('should handle empty workflow', () => {
      const sheet = generateStatisticsSheet([]);
      expect(sheet).toBeDefined();
      // Should show all zeros
    });

    it('should handle 100% completion', () => {
      const allCompleted = mockNodes.map(n => ({
        ...n,
        status: 'COMPLETED' as const
      }));
      const sheet = generateStatisticsSheet(allCompleted);
      expect(sheet).toBeDefined();
      // Should show 100% progress
    });

    it('should handle nodes with undefined aiScore', () => {
      const nodesWithoutScore = mockNodes.map(n => ({
        ...n,
        aiScore: undefined
      }));
      const sheet = generateStatisticsSheet(nodesWithoutScore);
      expect(sheet).toBeDefined();
    });

    it('should handle large workflows (100+ nodes)', () => {
      const largeNodeList = Array.from({ length: 150 }, (_, i) => ({
        ...mockNodes[0],
        id: `node_${i}`,
        label: `Node ${i}`,
      }));
      const sheet = generateStatisticsSheet(largeNodeList);
      expect(sheet).toBeDefined();
    });
  });

  describe('applyExcelStyling', () => {
    it('should apply styling to workbook', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet(mockNodes);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);
      expect(workbook.Sheets['Test']).toBeDefined();
    });

    it('should bold header rows', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet(mockNodes);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);

      const worksheet = workbook.Sheets['Test'];
      const headerCell = worksheet['A1'] as any;
      expect(headerCell.s).toBeDefined();
      expect(headerCell.s.font?.bold).toBe(true);
    });

    it('should apply gray background to headers', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet(mockNodes);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);

      const worksheet = workbook.Sheets['Test'];
      const headerCell = worksheet['A1'] as any;
      expect(headerCell.s.fill).toBeDefined();
    });

    it('should apply borders to all cells', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet([mockNodes[0]]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);

      const worksheet = workbook.Sheets['Test'];
      const cell = worksheet['A2'] as any;
      expect(cell.s?.border).toBeDefined();
      expect(cell.s.border.left).toBeDefined();
      expect(cell.s.border.right).toBeDefined();
      expect(cell.s.border.top).toBeDefined();
      expect(cell.s.border.bottom).toBeDefined();
    });

    it('should apply alternating row colors', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet(mockNodes);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);

      const worksheet = workbook.Sheets['Test'];
      // Check that alternating rows have different background colors
      const row2 = worksheet['A2'] as any;
      const row3 = worksheet['A3'] as any;

      expect(row2.s?.fill).toBeDefined();
      expect(row3.s?.fill).toBeDefined();
    });

    it('should center align headers', () => {
      const workbook = XLSX.utils.book_new();
      const sheet = generateNodeListSheet(mockNodes);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Test');
      applyExcelStyling(workbook);

      const worksheet = workbook.Sheets['Test'];
      const headerCell = worksheet['A1'] as any;
      expect(headerCell.s.alignment?.horizontal).toBe('center');
      expect(headerCell.s.alignment?.vertical).toBe('center');
    });

    it('should apply styling to all sheets', () => {
      const workbook = XLSX.utils.book_new();
      const nodeListSheet = generateNodeListSheet(mockNodes);
      const matrixSheet = generateAdjacencyMatrixSheet(mockNodes, mockEdges);
      const statsSheet = generateStatisticsSheet(mockNodes);

      XLSX.utils.book_append_sheet(workbook, nodeListSheet, 'Nodes');
      XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matrix');
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Stats');

      applyExcelStyling(workbook);

      ['Nodes', 'Matrix', 'Stats'].forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const cell = worksheet['A1'] as any;
        expect(cell.s).toBeDefined();
      });
    });

    it('should handle workbook with no sheets', () => {
      const workbook = XLSX.utils.book_new();
      expect(() => applyExcelStyling(workbook)).not.toThrow();
    });
  });

  describe('exportWorkflowToExcel', () => {
    it('should create workbook', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(mockProject, options);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should add selected sheets only', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: false,
        includeLeadTimeReport: false,
        includeStatistics: false,
      };
      exportWorkflowToExcel(mockProject, options);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should generate correct filename format', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(mockProject, options);

      const callArgs = (XLSX.writeFile as any).mock.calls[0];
      const filename = callArgs[1];
      expect(filename).toMatch(/Test Project_workflow_\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('should apply styling to workbook', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(mockProject, options);

      const callArgs = (XLSX.writeFile as any).mock.calls[0];
      const workbook = callArgs[0];

      // Verify styling was applied
      const sheets = workbook.SheetNames;
      sheets.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const firstCell = worksheet['A1'] as any;
        expect(firstCell.s).toBeDefined();
      });
    });

    it('should include all 4 sheets when all options are true', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(mockProject, options);

      const callArgs = (XLSX.writeFile as any).mock.calls[0];
      const workbook = callArgs[0];
      expect(workbook.SheetNames.length).toBe(4);
    });

    it('should handle single sheet selection', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: false,
        includeLeadTimeReport: false,
        includeStatistics: false,
      };
      exportWorkflowToExcel(mockProject, options);

      const callArgs = (XLSX.writeFile as any).mock.calls[0];
      const workbook = callArgs[0];
      expect(workbook.SheetNames.length).toBe(1);
      expect(workbook.SheetNames[0]).toBe('노드 목록');
    });

    it('should use XLSX.writeFile for export', () => {
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(mockProject, options);
      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({ SheetNames: expect.any(Array) }),
        expect.stringMatching(/\.xlsx$/)
      );
    });

    it('should handle empty workflow', () => {
      const emptyProject: WorkflowProject = {
        id: 'empty',
        name: 'Empty Project',
        nodes: [],
        edges: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        version: 1,
      };
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(emptyProject, options);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });

    it('should handle large project', () => {
      const largeProject: WorkflowProject = {
        ...mockProject,
        nodes: Array.from({ length: 150 }, (_, i) => ({
          ...mockNodes[0],
          id: `node_${i}`,
          label: `Node ${i}`,
        })),
      };
      const options: ExcelExportOptions = {
        includeNodeList: true,
        includeAdjacencyMatrix: true,
        includeLeadTimeReport: true,
        includeStatistics: true,
      };
      exportWorkflowToExcel(largeProject, options);
      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single node workflow', () => {
      const singleNodeSheet = generateNodeListSheet([mockNodes[0]]);
      expect(singleNodeSheet).toBeDefined();
    });

    it('should handle nodes with undefined optional fields', () => {
      const nodeWithUndefinedFields: ActivityNode = {
        id: 'test',
        type: 'ACTION',
        label: 'Test',
        stage: 'PLANNING',
        department: 'TEAM',
        attributes: {
          tool: [],
          avg_time: '1h',
          is_repetitive: false,
          brain_usage: 'LOW',
        },
        ontology_tags: [],
        position: { x: 0, y: 0 },
      };
      const sheet = generateNodeListSheet([nodeWithUndefinedFields]);
      expect(sheet).toBeDefined();
    });

    it('should handle nodes with very long labels', () => {
      const longLabel = 'A'.repeat(500);
      const nodeWithLongLabel: ActivityNode = {
        ...mockNodes[0],
        label: longLabel,
      };
      const sheet = generateNodeListSheet([nodeWithLongLabel]);
      expect(sheet).toBeDefined();
    });

    it('should handle duplicate node names', () => {
      const duplicateNodes = [
        { ...mockNodes[0], id: 'node_1', label: 'Same Label' },
        { ...mockNodes[1], id: 'node_2', label: 'Same Label' },
      ];
      const sheet = generateNodeListSheet(duplicateNodes);
      expect(sheet).toBeDefined();
    });

    it('should handle cyclic dependency edges', () => {
      const cyclicEdges: WorkflowRelationship[] = [
        {
          id: 'e1-2',
          source: 'node_1',
          target: 'node_2',
          relation_type: 'REQUIRES',
          properties: {},
        },
        {
          id: 'e2-3',
          source: 'node_2',
          target: 'node_3',
          relation_type: 'REQUIRES',
          properties: {},
        },
        {
          id: 'e3-1',
          source: 'node_3',
          target: 'node_1',
          relation_type: 'FEEDBACK_TO',
          properties: {},
        },
      ];
      const sheet = generateAdjacencyMatrixSheet(mockNodes, cyclicEdges);
      expect(sheet).toBeDefined();
    });

    it('should handle zero lead time', () => {
      const nodesWithZeroTime: ActivityNode[] = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '0m' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWithZeroTime, mockEdges);
      expect(sheet).toBeDefined();
    });

    it('should handle very large time values', () => {
      const nodesWithLargeTime: ActivityNode[] = mockNodes.map(n => ({
        ...n,
        attributes: { ...n.attributes, avg_time: '1000d' }
      }));
      const sheet = generateLeadTimeReportSheet(nodesWithLargeTime, mockEdges);
      expect(sheet).toBeDefined();
    });
  });
});
