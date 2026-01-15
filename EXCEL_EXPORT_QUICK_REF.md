# Excel Export - Quick Reference Guide

## Quick Start

### For Users
1. Click "엑셀 내보내기" button in toolbar
2. Customize filename (optional)
3. Select sheets to export (default: all 4)
4. Click "미리보기" to preview sheets (optional)
5. Click "엑셀로 내보내기" to download

### For Developers
Import and use the exporter:

```typescript
import { exportWorkflowToExcel, type ExcelExportOptions } from '@/lib/excelExporter';
import type { WorkflowProject } from '@/types/workflow';

const project: WorkflowProject = { /* ... */ };
const options: ExcelExportOptions = {
  includeNodeList: true,
  includeAdjacencyMatrix: true,
  includeLeadTimeReport: true,
  includeStatistics: true,
};

exportWorkflowToExcel(project, options);
```

---

## API Reference

### Main Function

```typescript
exportWorkflowToExcel(
  project: WorkflowProject,
  options: ExcelExportOptions
): void
```

Creates and downloads Excel file with selected sheets.

**Parameters**:
- `project`: WorkflowProject with nodes and edges
- `options`: ExcelExportOptions with 4 boolean flags

**Returns**: void (initiates browser download)

**Example**:
```typescript
const project: WorkflowProject = {
  id: 'proj_1',
  name: 'Q1 2026 Initiative',
  nodes: [ /* ... */ ],
  edges: [ /* ... */ ],
  createdAt: '2026-01-14T00:00:00Z',
  updatedAt: '2026-01-14T00:00:00Z',
  version: 1,
};

exportWorkflowToExcel(project, {
  includeNodeList: true,
  includeAdjacencyMatrix: false,
  includeLeadTimeReport: true,
  includeStatistics: true,
});
// Downloads: Q1_2026_Initiative_workflow_2026-01-14.xlsx
```

---

### Sheet Generation Functions

#### 1. Node List Sheet
```typescript
generateNodeListSheet(nodes: ActivityNode[]): WorkSheet
```

Creates sheet with node inventory (12 columns).

**Columns**:
1. ID
2. 노드명
3. 타입
4. 부서
5. 단계
6. 소요시간
7. 담당자
8. 상태
9. 도구
10. 태그
11. AI스코어
12. 병목

**Example Output**:
```
ID | 노드명 | 타입 | 부서 | 단계 | 소요시간 | 담당자 | 상태 | 도구 | 태그 | AI스코어 | 병목
---|--------|------|------|------|---------|--------|------|------|------|---------|----
node_1 | Start | TRIGGER | PRODUCT | PLANNING | 2h | 김PM | PENDING | Notion,Figma | #기획,#요구사항 | 45 | No
node_2 | Design | ACTION | DESIGN | PLANNING | 4h | 박디자이너 | READY | Figma,Adobe | #디자인 | 60 | Yes
```

---

#### 2. Adjacency Matrix Sheet
```typescript
generateAdjacencyMatrixSheet(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): WorkSheet
```

Creates N×N binary connectivity matrix.

**Matrix Format**:
- Rows: source nodes (by label)
- Columns: target nodes (by label)
- Values: 1 (edge exists), 0 (no connection)
- Header row frozen
- First column frozen

**Example Output** (3×3):
```
    | Start | Design | QA
----|-------|--------|----
Start | 0 | 1 | 0
Design | 0 | 0 | 1
QA | 0 | 0 | 0
```

---

#### 3. Lead Time Report Sheet
```typescript
generateLeadTimeReportSheet(
  nodes: ActivityNode[],
  edges: WorkflowRelationship[]
): WorkSheet
```

Analyzes lead times across workflow.

**Sections**:
1. **전체** (Total): 전체 리드타임
2. **단계별** (By Stage): Lead time for each stage
3. **부서별** (By Department): Lead time for each department
4. **크리티컬 패스** (Critical Path): Longest path in workflow

**Time Format Parsing**:
- "2h" → 2 hours
- "30m" → 30 minutes
- "1d" → 1 day
- "1d 2h 30m" (not yet supported, use separate)

**Time Format Output**:
- Minutes → "30분"
- Hours → "2시간"
- Mixed → "2시간 30분"
- Days → "1일" / "1일 2시간"

**Example Output**:
```
구분 | 항목 | 리드타임(분) | 리드타임 | 비율
-----|------|------------|---------|-----
전체 리드타임 | - | 480 | 8시간 | 100%
 | | | |
단계별 | | | |
 | PLANNING | 360 | 6시간 | 75%
 | TESTING | 120 | 2시간 | 25%
 | | | |
부서별 | | | |
 | DESIGN | 240 | 4시간 | 50%
 | PRODUCT | 180 | 3시간 | 37.5%
 | QA | 60 | 1시간 | 12.5%
 | | | |
크리티컬 패스 | - | 480 | 8시간 | 100%
```

---

#### 4. Statistics Sheet
```typescript
generateStatisticsSheet(nodes: ActivityNode[]): WorkSheet
```

Generates workflow metrics summary.

**Metrics**:
- 총 노드 수: Total nodes
- 완료된 노드: Nodes with status COMPLETED
- 진행률: (completed / total) * 100
- 병목 구간: Nodes with isBottleneck = true
- AI 대체 가능 노드: Nodes with aiScore >= 70

**Distributions**:
- By type (TRIGGER, ACTION, DECISION, ARTIFACT)
- By department (PRODUCT_TEAM, DESIGN_TEAM, etc.)
- By stage (PLANNING, DEVELOPMENT, TESTING, etc.)

**Example Output**:
```
메트릭 | 값
-----|-----
총 노드 수 | 12
완료된 노드 | 5
진행률(%) | 41.7
병목 구간 | 2
AI 대체 가능 노드 | 8
 |
타입별 분포 |
  TRIGGER | 2
  ACTION | 6
  DECISION | 3
  ARTIFACT | 1
 |
부서별 분포 |
  PRODUCT_TEAM | 4
  DESIGN_TEAM | 3
  QA_TEAM | 3
  SW_TEAM | 2
 |
단계별 분포 |
  PLANNING | 5
  DEVELOPMENT | 4
  TESTING | 3
```

---

### Styling Function

```typescript
applyExcelStyling(workbook: XLSX.WorkBook): void
```

Applies professional formatting to all sheets.

**Applied Styling**:
- ✅ Bold headers (font weight 700)
- ✅ Light gray background on headers (FFD9D9D9)
- ✅ Centered header alignment
- ✅ Alternating row colors (white / FFF2F2F2)
- ✅ Thin black borders on all cells
- ✅ Left-aligned data cells
- ✅ Frozen header rows (all sheets)
- ✅ Frozen first column (matrix sheet only)

**Note**: SheetJS Community Edition has limited styling. Advanced formatting requires Pro license.

---

## Dialog Component

### Props

```typescript
interface ExcelExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: WorkflowProject | null;
}
```

### Usage

```tsx
import ExcelExportDialog from '@/components/ExcelExportDialog';
import { useState } from 'react';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const currentProject = { /* ... */ };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Export to Excel
      </button>

      <ExcelExportDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        project={currentProject}
      />
    </>
  );
}
```

---

## Types

```typescript
export interface ExcelExportOptions {
  includeNodeList: boolean;
  includeAdjacencyMatrix: boolean;
  includeLeadTimeReport: boolean;
  includeStatistics: boolean;
}
```

---

## Common Use Cases

### Export Everything
```typescript
const options: ExcelExportOptions = {
  includeNodeList: true,
  includeAdjacencyMatrix: true,
  includeLeadTimeReport: true,
  includeStatistics: true,
};
exportWorkflowToExcel(project, options);
```

### Export Data Only (No Analysis)
```typescript
const options: ExcelExportOptions = {
  includeNodeList: true,
  includeAdjacencyMatrix: true,
  includeLeadTimeReport: false,
  includeStatistics: false,
};
exportWorkflowToExcel(project, options);
```

### Export Analysis Only
```typescript
const options: ExcelExportOptions = {
  includeNodeList: false,
  includeAdjacencyMatrix: false,
  includeLeadTimeReport: true,
  includeStatistics: true,
};
exportWorkflowToExcel(project, options);
```

### Export Single Sheet
```typescript
const options: ExcelExportOptions = {
  includeNodeList: true,
  includeAdjacencyMatrix: false,
  includeLeadTimeReport: false,
  includeStatistics: false,
};
exportWorkflowToExcel(project, options);
// Downloads only "노드 목록" sheet
```

---

## Performance Tips

### For Large Workflows (100+ nodes)

1. **Consider Splitting Exports**:
   - Export nodes in batches
   - Export analysis separately

2. **Disable Unused Sheets**:
   - Skip adjacency matrix for very large workflows
   - It's O(n²) in file size

3. **Monitor Memory**:
   - 1000+ nodes may cause brief UI freeze
   - Browser typically handles up to 10,000+ nodes

4. **File Size Estimation**:
   - Base: ~5KB per sheet
   - Node list: +200 bytes per node
   - Adjacency matrix: +2 bytes per edge
   - Lead time: +100 bytes per node
   - Statistics: +50 bytes per node

---

## Error Handling

The export function is wrapped in try-catch. Toast notifications provide user feedback:

```typescript
// Success
toast.success('내보내기 완료', {
  description: `${filename}이(가) 다운로드되었습니다.`
});

// Error
toast.error('내보내기 실패', {
  description: 'Error message here'
});

// Warning
toast.warning('큰 파일 크기', {
  description: 'File size warning'
});
```

---

## File Naming

**Format**: `{projectName}_workflow_{YYYY-MM-DD}.xlsx`

**Examples**:
- Project: "Q1 Initiative" → `Q1_Initiative_workflow_2026-01-14.xlsx`
- Project: "Product Launch" → `Product_Launch_workflow_2026-01-14.xlsx`
- Project: "新規プロジェクト" → `新規プロジェクト_workflow_2026-01-14.xlsx`

**Notes**:
- Special characters allowed in filename
- Date is local system date
- .xlsx extension added automatically

---

## Testing

### Run Tests
```bash
pnpm test -- excelExporter.test.ts
```

### Test Coverage
- ✅ Node list generation
- ✅ Adjacency matrix creation
- ✅ Lead time calculation
- ✅ Statistics compilation
- ✅ Edge case handling
- ✅ Special character support
- ✅ Missing attribute handling

### Manual Testing Checklist
- [ ] Create workflow with 3-5 nodes
- [ ] Click export button
- [ ] Verify dialog opens
- [ ] Test with all options checked
- [ ] Test with mixed options
- [ ] Verify preview shows correct sheets
- [ ] Download file
- [ ] Open in Excel
- [ ] Verify data accuracy
- [ ] Check styling applied
- [ ] Test with 50+ nodes (performance)
- [ ] Test with special characters

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not visible | Verify toolbar rendered, check DevTools |
| Dialog doesn't open | Check `isExcelExportDialogOpen` state |
| File won't download | Try different Excel application, check antivirus |
| Data looks wrong | Verify node/edge structure matches types |
| Styling missing | SheetJS Community Edition is limited, try Pro |
| File too large | Skip adjacency matrix, reduce node count |
| Slow export | >100 nodes is normal, wait 2-3 seconds |

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements**:
- Blob support
- ArrayBuffer support
- ES2020+ features

---

## Installation & Setup

1. **Install dependency**:
```bash
pnpm add xlsx
pnpm add -D @types/xlsx
```

2. **Verify files**:
```bash
ls -l client/src/lib/excelExporter.ts
ls -l client/src/components/ExcelExportDialog.tsx
```

3. **Build & Test**:
```bash
pnpm build
pnpm test
```

4. **Run development**:
```bash
pnpm dev
```

---

## Migration from Previous Export

If migrating from old export system:

```typescript
// Old way
exportToOldFormat(project);

// New way
exportWorkflowToExcel(project, {
  includeNodeList: true,
  includeAdjacencyMatrix: true,
  includeLeadTimeReport: true,
  includeStatistics: true,
});
```

---

## Support

For issues or questions:
1. Check console for error messages
2. Verify project has nodes and edges
3. Check browser console (F12)
4. Review unit tests for examples
5. Check EXCEL_EXPORT_IMPLEMENTATION.md for detailed docs

---

**Last Updated**: January 14, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
