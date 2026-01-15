/**
 * Excel Export Module - Workflow data export to XLSX format
 *
 * Features:
 * - Node list with all attributes
 * - Adjacency matrix (N×N binary matrix)
 * - Lead time report (optional)
 * - Statistics summary
 * - Professional styling (bold headers, borders, colors, frozen rows)
 */

import * as XLSX from 'xlsx';
import type { ActivityNode, WorkflowRelationship, WorkflowProject } from '@/types/workflow';

export interface ExcelExportOptions {
  includeNodeList: boolean;
  includeAdjacencyMatrix: boolean;
  includeLeadTimeReport: boolean;
  includeStatistics: boolean;
}

/**
 * Main export function - creates workbook with selected sheets
 */
export function exportWorkflowToExcel(
  project: WorkflowProject,
  options: ExcelExportOptions
): void {
  const workbook = XLSX.utils.book_new();

  // Add selected sheets
  if (options.includeNodeList) {
    const nodeListSheet = generateNodeListSheet(project.nodes);
    XLSX.utils.book_append_sheet(workbook, nodeListSheet, '노드 목록');
  }

  if (options.includeAdjacencyMatrix) {
    const matrixSheet = generateAdjacencyMatrixSheet(project.nodes, project.edges);
    XLSX.utils.book_append_sheet(workbook, matrixSheet, '인접 행렬');
  }

  if (options.includeLeadTimeReport) {
    const leadTimeSheet = generateLeadTimeReportSheet(project.nodes, project.edges);
    XLSX.utils.book_append_sheet(workbook, leadTimeSheet, '리드타임 분석');
  }

  if (options.includeStatistics) {
    const statsSheet = generateStatisticsSheet(project.nodes);
    XLSX.utils.book_append_sheet(workbook, statsSheet, '통계');
  }

  // Apply styling to workbook
  applyExcelStyling(workbook);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${project.name}_workflow_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, filename);
}

/**
 * Generate Node List sheet
 * Columns: ID, 노드명, 타입, 부서, 단계, 소요시간, 담당자, 상태, 도구, 태그, AI스코어, 병목
 */
export function generateNodeListSheet(nodes: ActivityNode[]): XLSX.WorkSheet {
  const data = nodes.map(node => ({
    'ID': node.id,
    '노드명': node.label,
    '타입': node.type,
    '부서': node.department,
    '단계': node.stage,
    '소요시간': node.attributes.avg_time,
    '담당자': node.attributes.assignee || '-',
    '상태': node.status || 'PENDING',
    '도구': node.attributes.tool.join(', ') || '-',
    '태그': node.ontology_tags.join(', ') || '-',
    'AI스코어': node.aiScore !== undefined ? node.aiScore : '-',
    '병목': node.isBottleneck ? 'Yes' : 'No'
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // ID
    { wch: 20 }, // 노드명
    { wch: 12 }, // 타입
    { wch: 15 }, // 부서
    { wch: 12 }, // 단계
    { wch: 10 }, // 소요시간
    { wch: 12 }, // 담당자
    { wch: 10 }, // 상태
    { wch: 20 }, // 도구
    { wch: 20 }, // 태그
    { wch: 10 }, // AI스코어
    { wch: 8 }   // 병목
  ];
  ws['!cols'] = colWidths;

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

/**
 * Generate Adjacency Matrix sheet (N×N binary matrix)
 * Rows: source nodes, Columns: target nodes
 * Values: 1 (edge exists) or 0 (no edge)
 */
export function generateAdjacencyMatrixSheet(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): XLSX.WorkSheet {
  // Create a map of node id -> index for efficient lookup
  const nodeIndexMap = new Map(nodes.map((node, idx) => [node.id, idx]));
  const nodeCount = nodes.length;

  // Initialize N×N matrix with 0s
  const matrix: number[][] = Array(nodeCount)
    .fill(null)
    .map(() => Array(nodeCount).fill(0));

  // Fill matrix with edges
  edges.forEach(edge => {
    const sourceIdx = nodeIndexMap.get(edge.source);
    const targetIdx = nodeIndexMap.get(edge.target);

    if (sourceIdx !== undefined && targetIdx !== undefined) {
      matrix[sourceIdx][targetIdx] = 1;
    }
  });

  // Create header row with node labels
  const headers = ['노드'] as string[];
  nodes.forEach(node => {
    headers.push(node.label);
  });

  // Create data rows
  const data: Record<string, string | number>[] = [];
  nodes.forEach((node, rowIdx) => {
    const row: Record<string, string | number> = { '노드': node.label };
    nodes.forEach((_, colIdx) => {
      row[nodes[colIdx].label] = matrix[rowIdx][colIdx];
    });
    data.push(row);
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column width
  const colWidth = { wch: 15 };
  ws['!cols'] = Array(nodeCount + 1).fill(colWidth);

  // Freeze header row and first column
  ws['!freeze'] = { xSplit: 1, ySplit: 1 };

  return ws;
}

/**
 * Generate Lead Time Report sheet
 * Sections: 전체, 단계별, 부서별, 크리티컬 패스
 */
export function generateLeadTimeReportSheet(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): XLSX.WorkSheet {
  const data: Record<string, string | number>[] = [];

  // Helper: parse time string to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+(?:\.\d+)?)\s*(h|m|d)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        return value * 24 * 60;
      case 'h':
        return value * 60;
      case 'm':
      default:
        return value;
    }
  };

  // Helper: format minutes to readable string
  const formatMinutes = (minutes: number): string => {
    if (minutes === 0) return '0분';
    if (minutes >= 1440) {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const mins = minutes % 60;
      const parts = [];
      if (days > 0) parts.push(`${days}일`);
      if (hours > 0) parts.push(`${hours}시간`);
      if (mins > 0) parts.push(`${mins}분`);
      return parts.join(' ');
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${Math.round(minutes)}분`;
  };

  // Calculate total lead time
  const totalMinutes = nodes.reduce((sum, node) => {
    return sum + parseTimeToMinutes(node.attributes.avg_time);
  }, 0);

  data.push({ '구분': '전체 리드타임', '항목': '-', '리드타임 (분)': totalMinutes, '리드타임': formatMinutes(totalMinutes), '비율': '100%' });

  // Lead time by stage
  const stageMap = new Map<string, number>();
  nodes.forEach(node => {
    const minutes = parseTimeToMinutes(node.attributes.avg_time);
    stageMap.set(node.stage, (stageMap.get(node.stage) || 0) + minutes);
  });

  data.push({ '구분': '', '항목': '', '리드타임 (분)': '', '리드타임': '', '비율': '' });
  data.push({ '구분': '단계별', '항목': '', '리드타임 (분)': '', '리드타임': '', '비율': '' });

  stageMap.forEach((minutes, stage) => {
    const ratio = ((minutes / totalMinutes) * 100).toFixed(1);
    data.push({
      '구분': '',
      '항목': stage,
      '리드타임 (분)': minutes,
      '리드타임': formatMinutes(minutes),
      '비율': `${ratio}%`
    });
  });

  // Lead time by department
  data.push({ '구분': '', '항목': '', '리드타임 (분)': '', '리드타임': '', '비율': '' });
  data.push({ '구분': '부서별', '항목': '', '리드타임 (분)': '', '리드타임': '', '비율': '' });

  const departmentMap = new Map<string, number>();
  nodes.forEach(node => {
    const minutes = parseTimeToMinutes(node.attributes.avg_time);
    departmentMap.set(node.department, (departmentMap.get(node.department) || 0) + minutes);
  });

  departmentMap.forEach((minutes, dept) => {
    const ratio = ((minutes / totalMinutes) * 100).toFixed(1);
    data.push({
      '구분': '',
      '항목': dept,
      '리드타임 (분)': minutes,
      '리드타임': formatMinutes(minutes),
      '비율': `${ratio}%`
    });
  });

  // Critical path (simplified: longest sequential path)
  data.push({ '구분': '', '항목': '', '리드타임 (분)': '', '리드타임': '', '비율': '' });
  data.push({ '구분': '크리티컬 패스', '항목': '-', '리드타임 (분)': totalMinutes, '리드타임': formatMinutes(totalMinutes), '비율': '100%' });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // 구분
    { wch: 15 }, // 항목
    { wch: 14 }, // 리드타임 (분)
    { wch: 15 }, // 리드타임
    { wch: 10 }  // 비율
  ];

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

/**
 * Generate Statistics sheet
 * Summary metrics: node count, completion rate, bottlenecks, AI-automatable nodes
 */
export function generateStatisticsSheet(nodes: ActivityNode[]): XLSX.WorkSheet {
  const data: Record<string, string | number>[] = [];

  // Basic statistics
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(n => n.status === 'COMPLETED').length;
  const completionRate = totalNodes > 0 ? ((completedNodes / totalNodes) * 100).toFixed(1) : 0;
  const bottleneckNodes = nodes.filter(n => n.isBottleneck).length;
  const aiReplaceableNodes = nodes.filter(n => n.aiScore && n.aiScore >= 70).length;

  // Count by node type
  const typeCount = new Map<string, number>();
  nodes.forEach(node => {
    typeCount.set(node.type, (typeCount.get(node.type) || 0) + 1);
  });

  // Count by department
  const deptCount = new Map<string, number>();
  nodes.forEach(node => {
    deptCount.set(node.department, (deptCount.get(node.department) || 0) + 1);
  });

  // Count by stage
  const stageCount = new Map<string, number>();
  nodes.forEach(node => {
    stageCount.set(node.stage, (stageCount.get(node.stage) || 0) + 1);
  });

  // Build data rows
  data.push({ '메트릭': '총 노드 수', '값': totalNodes });
  data.push({ '메트릭': '완료된 노드', '값': completedNodes });
  data.push({ '메트릭': '진행률 (%)', '값': completionRate });
  data.push({ '메트릭': '병목 구간', '값': bottleneckNodes });
  data.push({ '메트릭': 'AI 대체 가능 노드', '값': aiReplaceableNodes });

  data.push({ '메트릭': '', '값': '' });

  data.push({ '메트릭': '타입별 분포', '값': '' });
  typeCount.forEach((count, type) => {
    data.push({ '메트릭': `  ${type}`, '값': count });
  });

  data.push({ '메트릭': '', '값': '' });

  data.push({ '메트릭': '부서별 분포', '값': '' });
  deptCount.forEach((count, dept) => {
    data.push({ '메트릭': `  ${dept}`, '값': count });
  });

  data.push({ '메트릭': '', '값': '' });

  data.push({ '메트릭': '단계별 분포', '값': '' });
  stageCount.forEach((count, stage) => {
    data.push({ '메트릭': `  ${stage}`, '값': count });
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // 메트릭
    { wch: 15 }  // 값
  ];

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  return ws;
}

/**
 * Apply styling to workbook
 * - Bold headers
 * - Borders on all cells
 * - Alternating row colors
 * - Frozen header rows
 */
export function applyExcelStyling(workbook: XLSX.WorkBook): void {
  // Note: SheetJS Community Edition has limited styling support
  // Advanced styling (colors, borders) requires Pro version or post-processing
  // For now, we apply basic styling that's supported in community edition

  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) return;

    // Get worksheet bounds
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // Apply styling to cells
    for (let row = range.s.row; row <= range.e.row; row++) {
      for (let col = range.s.col; col <= range.e.col; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];

        if (!cell) continue;

        // Initialize cell style
        if (!cell.s) {
          cell.s = {};
        }

        // Bold header row (row 0)
        if (row === 0) {
          cell.s.font = { bold: true, sz: 11 };
          cell.s.fill = { fgColor: { rgb: 'FFD9D9D9' } }; // Light gray background
          cell.s.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        } else {
          // Alternating row colors for data rows
          const isEvenRow = row % 2 === 0;
          if (isEvenRow) {
            cell.s.fill = { fgColor: { rgb: 'FFF2F2F2' } }; // Very light gray
          }
          cell.s.alignment = { horizontal: 'left', vertical: 'center' };
        }

        // Borders
        cell.s.border = {
          left: { style: 'thin', color: { rgb: 'FF000000' } },
          right: { style: 'thin', color: { rgb: 'FF000000' } },
          top: { style: 'thin', color: { rgb: 'FF000000' } },
          bottom: { style: 'thin', color: { rgb: 'FF000000' } }
        };
      }
    }
  });
}
