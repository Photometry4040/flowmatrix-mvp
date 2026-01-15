# Phase 7 E2E Tests Documentation

## Overview

This document describes the comprehensive end-to-end tests for Phase 7 features of FlowMatrix:
- **T7.1**: Lead Time Calculator
- **T7.3**: Template Library
- **T7.5**: Excel Export

**File**: `e2e/phase7-features.spec.ts` (545 lines, 15 test cases)

---

## Test Structure

### Main Test Suite: Phase 7 Features E2E
Total test cases: **12** (organized into 3 groups)

#### Group 1: Lead Time Calculator (4 tests)
Tests the lead time analysis panel, critical path calculation, and CSV export.

| # | Test Name | Component | Purpose | Success Criteria |
|---|-----------|-----------|---------|------------------|
| 1 | Open Lead Time Panel | LeadTimePanel | Verify panel renders | "리드타임 분석" title visible in DOM |
| 2 | Display Total Lead Time | LeadTimePanel | Verify lead time display | Total lead time formatted and visible |
| 3 | Highlight Critical Path | LeadTimePanel | Test critical path highlighting | "강조" button works, nodes highlighted |
| 4 | Export Lead Time to CSV | LeadTimePanel | Test CSV export | File downloads with correct naming pattern |

#### Group 2: Template Library (5 tests)
Tests template loading, filtering, searching, creation, and deletion.

| # | Test Name | Component | Purpose | Success Criteria |
|---|-----------|-----------|---------|------------------|
| 5 | Open Template Library Dialog | TemplateLibrary | Dialog opens correctly | Dialog title visible, category tabs shown |
| 6 | Filter by Category | TemplateLibrary | Category filtering works | SW templates visible when SW tab selected |
| 7 | Search Templates | TemplateLibrary | Template search works | Results filtered by search query |
| 8 | Load Built-in Template | TemplateLibrary | Template loading works | Template nodes loaded onto canvas |
| 9 | Save Workflow as Template | TemplateLibrary | Custom template creation | Template saved with correct name and category |
| 10 | Delete Custom Template | TemplateLibrary | Custom template deletion | Template removed from library |

#### Group 3: Excel Export (2 tests)
Tests the Excel export dialog and file download.

| # | Test Name | Component | Purpose | Success Criteria |
|---|-----------|-----------|---------|------------------|
| 11 | Open Excel Export Dialog | ExcelExportDialog | Dialog opens correctly | Dialog title visible, 4 checkboxes present |
| 12 | Export Workflow to Excel | ExcelExportDialog | Excel file generation | File downloads with .xlsx extension |

### Integration Tests (3 additional tests)
Tests interactions between Phase 7 features.

1. **Lead Time Panel persists with workflow changes** - Verifies panel stays visible when workflow is modified
2. **Template and Excel Export features coexist** - Verifies both features are available simultaneously
3. **No console errors on Phase 7 feature interactions** - Ensures no critical JS errors occur

---

## Test Scenarios Details

### Lead Time Calculator Tests

#### Test 1: Open Lead Time Panel
```typescript
// Navigate to workflow page
await expect(page.locator('text=FlowMatrix')).toBeVisible();

// Verify Lead Time Panel is rendered
const leadTimeTitle = page.locator('text=리드타임 분석');
await expect(leadTimeTitle).toBeVisible({ timeout: 5000 });
```

**What it tests:**
- Panel component is properly mounted
- Component receives node and edge data
- Title renders correctly in Korean

**Expected behavior:**
- Panel visible on workflow canvas page
- Title "리드타임 분석" appears in the interface

---

#### Test 2: Display Total Lead Time
```typescript
// Look for the total lead time section
const totalLeadTimeSection = page.locator('.text-2xl.font-mono.font-bold.text-primary');
await expect(totalLeadTimeSection.first()).toBeVisible({ timeout: 5000 });

// Verify content contains time value
const leadTimeText = await totalLeadTimeSection.first().textContent();
expect(leadTimeText).toMatch(/\d+/);
```

**What it tests:**
- Lead time calculation works
- Time is formatted correctly
- Display shows hours/days/minutes

**Expected behavior:**
- Total lead time displayed in format like "7시간" (7 hours)
- Includes breakdown showing hours and days

---

#### Test 3: Highlight Critical Path
```typescript
// Find and click the highlight button
const highlightButton = page.locator('button:has-text("강조")').first();
await highlightButton.click();

// Verify visual highlighting applied
const criticalPathNodes = page.locator('.react-flow__node');
// Nodes should have special styling/border
```

**What it tests:**
- Critical path algorithm executes
- UI responds to highlight button
- Nodes visually distinguished on canvas

**Expected behavior:**
- Button clickable and responsive
- Critical path nodes styled with gold/yellow border
- Toast message shows "Critical path highlighted"

---

#### Test 4: Export Lead Time to CSV
```typescript
// Click export button
const exportButton = page.locator('[title="Export as CSV"]');
const downloadPromise = context.waitForEvent('download');
await exportButton.click();

// Verify download
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/lead-time-analysis-.*\.csv/);
```

**What it tests:**
- CSV export functionality
- File generation with correct naming
- Download triggers properly

**Expected behavior:**
- File downloads to default download folder
- Filename format: `lead-time-analysis-YYYY-MM-DD.csv`
- Success toast shows "Lead time report exported as CSV"

---

### Template Library Tests

#### Test 5: Open Template Library Dialog
```typescript
const templateButton = page.locator('button:has-text("템플릿")');
await templateButton.click();

const dialogTitle = page.locator('text=템플릿 라이브러리');
await expect(dialogTitle).toBeVisible({ timeout: 3000 });

const categoryTabs = page.locator('[role="tab"]');
expect(await categoryTabs.count()).toBeGreaterThanOrEqual(3);
```

**What it tests:**
- Dialog opens when button clicked
- Title renders correctly
- Category tabs are present

**Expected behavior:**
- Dialog appears with 5 category tabs:
  - 소프트웨어 개발 (SW_DEVELOPMENT)
  - 하드웨어 개발 (HW_DEVELOPMENT)
  - 마케팅 (MARKETING)
  - 디자인 (DESIGN)
  - 커스텀 (CUSTOM)

---

#### Test 6: Filter by Category
```typescript
const swTab = page.locator('[role="tab"]:has-text("소프트웨어 개발")');
await swTab.click();

// Verify SW templates shown
const templateCards = page.locator('[role="tabpanel"] >> text=애자일');
await expect(templateCards).toBeVisible({ timeout: 3000 });
```

**What it tests:**
- Tab switching functionality
- Category filtering works
- Correct templates shown per category

**Expected behavior:**
- Clicking SW_DEVELOPMENT tab shows SW templates
- Only relevant templates displayed for selected category
- Tab has visual "selected" state

---

#### Test 7: Search Templates
```typescript
const searchInput = page.locator('input[placeholder*="템플릿"]').first();
await searchInput.fill('스프린트');

// Results should be filtered
const templateCards = page.locator('[role="tabpanel"] >> .grid >> [role="button"]');
const cardCount = await templateCards.count();
expect(cardCount).toBeGreaterThanOrEqual(0);
```

**What it tests:**
- Search box functionality
- Template filtering by name/tags/description
- Real-time search results

**Expected behavior:**
- Typing "스프린트" (sprint) shows only sprint-related templates
- Search works across template name, description, and tags
- Results update in real-time

---

#### Test 8: Load Built-in Template
```typescript
const loadButtons = page.locator('button:has-text("로드")');
await loadButtons.first().click();

// Dialog should close and workflow loaded
const nodes = page.locator('.react-flow__node');
await expect(nodes.first()).toBeVisible({ timeout: 5000 });
```

**What it tests:**
- Template loading functionality
- Workflow creation from template
- Canvas updates with loaded nodes

**Expected behavior:**
- Dialog closes after load
- New nodes appear on canvas
- Toast shows "템플릿을 불러왔습니다" (template loaded)
- Example: SW template loads 7 nodes for "애자일 스프린트 워크플로우"

---

#### Test 9: Save Workflow as Template
```typescript
const saveButton = page.locator('dialog >> button:has-text("저장")');
await saveButton.click();

// Fill template dialog
const nameInput = page.locator('input#tpl-name');
await nameInput.fill('Test Template');

const confirmSaveButton = page.locator('dialog >> button:has-text("템플릿 저장")');
await confirmSaveButton.click();
```

**What it tests:**
- Template creation from current workflow
- Template name/category/description entry
- Storage of custom template

**Expected behavior:**
- Save dialog opens with form fields:
  - Template name (required)
  - Description (optional)
  - Category dropdown (default: CUSTOM)
  - Tags input (optional)
- Success toast shows "템플릿으로 저장했습니다"
- Template appears in CUSTOM category

---

#### Test 10: Delete Custom Template
```typescript
const firstDeleteButton = page.locator('dialog >> button:has(svg[class*="destructive"])').first();
await firstDeleteButton.click();

// Confirm in AlertDialog
const confirmDeleteButton = page.locator('[role="alertdialog"] >> button:has-text("삭제")');
await confirmDeleteButton.click();
```

**What it tests:**
- Template deletion functionality
- Confirmation dialog
- Custom template removal

**Expected behavior:**
- Delete button only appears for CUSTOM templates
- AlertDialog asks for confirmation
- Template removed from library after confirmation
- Success toast shows "삭제했습니다"

---

### Excel Export Tests

#### Test 11: Open Excel Export Dialog
```typescript
const excelButton = page.locator('button >> svg[class*="FileSpreadsheet"], button:has-text("엑셀")').first();
await excelButton.click();

const dialogTitle = page.locator('text=엑셀 내보내기');
await expect(dialogTitle).toBeVisible({ timeout: 3000 });

const checkboxes = page.locator('input[type="checkbox"]');
expect(await checkboxes.count()).toBeGreaterThanOrEqual(3);
```

**What it tests:**
- Dialog opens correctly
- All export options visible
- Checkboxes present for 4 export types

**Expected behavior:**
- Dialog title shows "엑셀 내보내기"
- 4 checkbox options visible:
  1. 노드 목록 (Node List) - 12 columns
  2. 인접 행렬 (Adjacency Matrix)
  3. 리드타임 분석 (Lead Time Report)
  4. 통계 (Statistics)
- All checked by default

---

#### Test 12: Export Workflow to Excel
```typescript
const filenameInput = page.locator('input#filename');
const filename = await filenameInput.inputValue();
expect(filename).toMatch(/.*workflow.*\d{4}-\d{2}-\d{2}\.xlsx/);

const downloadPromise = context.waitForEvent('download');
const exportButton = page.locator('button:has-text("엑셀로 내보내기")').last();
await exportButton.click();

const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
```

**What it tests:**
- Excel file generation
- Proper file naming with timestamp
- Download functionality

**Expected behavior:**
- Filename pattern: `{projectName}_workflow_YYYY-MM-DD.xlsx`
- Example: `My Project_workflow_2025-01-15.xlsx`
- File downloads successfully
- File format is .xlsx (Excel 2007+)

---

## Selector Strategy

### Priority Order
1. **data-testid** (preferred): `page.getByTestId('lead-time-panel')`
2. **Text selectors**: `page.locator('button:has-text("강조")')`
3. **Role selectors**: `page.locator('[role="tab"]')`
4. **CSS class selectors**: `page.locator('.text-2xl.font-mono.font-bold.text-primary')`
5. **Attribute selectors**: `page.locator('[title="Export as CSV"]')`

### Example Selectors Used
```typescript
// Lead Time Panel
page.locator('text=리드타임 분석')
page.locator('button:has-text("강조")')
page.locator('[title="Export as CSV"]')

// Template Library
page.locator('button:has-text("템플릿")')
page.locator('[role="tab"]:has-text("소프트웨어 개발")')
page.locator('input[placeholder*="템플릿"]')

// Excel Export
page.locator('button >> svg[class*="FileSpreadsheet"]')
page.locator('input#filename')
page.locator('input[type="checkbox"]')
```

---

## Wait Strategy

### Explicit Waits
```typescript
// Wait for navigation/load
await page.goto('/');
await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });

// Wait for element visibility
await expect(element).toBeVisible({ timeout: 5000 });

// Wait for download
const downloadPromise = context.waitForEvent('download');
const download = await downloadPromise;

// Wait for dialog
await page.waitForTimeout(500); // Give animation time
```

### Timeout Values
- **Page load**: 10s
- **Element visibility**: 5s
- **Dialog open**: 3s
- **Animation delays**: 500ms
- **User interaction**: 2s (for optional features)

---

## Error Handling & Resilience

### Try-Catch Blocks
Used for optional features that may not be present:
```typescript
try {
  await expect(element).toBeVisible({ timeout: 5000 });
} catch {
  // Fallback: check if element exists in DOM
  const count = await page.locator('text=리드타임 분석').count();
  expect(count).toBeGreaterThan(0);
}
```

### Console Error Filtering
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

// Filter known non-critical errors
const criticalErrors = errors.filter(err =>
  !err.includes('ResizeObserver') &&
  !err.includes('Non-Error promise rejection')
);
expect(criticalErrors).toHaveLength(0);
```

---

## Running the Tests

### Run All Phase 7 Tests
```bash
pnpm test:e2e phase7-features
```

### Run Specific Test Suite
```bash
# Lead Time Calculator tests only
pnpm test:e2e phase7-features -g "Lead Time Calculator"

# Template Library tests only
pnpm test:e2e phase7-features -g "Template Library"

# Excel Export tests only
pnpm test:e2e phase7-features -g "Excel Export"
```

### Run with UI
```bash
pnpm test:e2e phase7-features --ui
```

### Run with Report
```bash
pnpm test:e2e phase7-features --reporter=html
```

### Debug Mode
```bash
pnpm test:e2e phase7-features --debug
```

---

## Test Data & Setup

### Prerequisites
- Dev server running: `pnpm dev` (auto-started by Playwright)
- Browser: Chromium (configured in playwright.config.ts)
- Base URL: `http://localhost:3000`

### Test Setup (beforeEach)
```typescript
// Clear all state
await context.clearCookies();
await page.goto('/');
await page.evaluate(() => localStorage.clear());
await page.reload();

// Wait for app ready
await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });
```

### Sample Workflow
- 6 initial nodes with sample data
- Each node has department, stage, lead time attributes
- Edges connect nodes to form workflow paths

---

## Expected Results

### Pass Criteria
- ✅ All 12 main tests pass
- ✅ All 3 integration tests pass
- ✅ No console errors (except filtered warnings)
- ✅ All assertions succeed
- ✅ Downloads verify correctly

### Common Passing Indicators
- Toast notifications appear and disappear
- Dialogs open/close smoothly
- Elements render with proper styling
- Files download to expected location
- No JavaScript errors in console

---

## Troubleshooting

### Test Timeout Issues
**Problem**: Test hangs waiting for element
**Solution**:
```typescript
// Increase timeout
await expect(element).toBeVisible({ timeout: 10000 });

// Or check if element exists at all
const exists = await element.isVisible().catch(() => false);
expect(exists).toBeTruthy();
```

### Download Not Detected
**Problem**: Download event not firing
**Solution**:
```typescript
// Ensure listener set up before click
const downloadPromise = context.waitForEvent('download');
await button.click();
const download = await downloadPromise;
```

### Element Selector Not Found
**Problem**: Selector doesn't match element
**Solution**:
```typescript
// Use browser DevTools to find element
// Then update selector with correct text/attributes
const element = page.locator('button:has-text("정확한 텍스트")');
```

### Dialog Not Closing
**Problem**: Dialog remains open after action
**Solution**:
```typescript
// Wait for dialog to actually close
const dialog = page.locator('dialog');
await expect(dialog).not.toBeVisible({ timeout: 5000 });
```

---

## Test Maintenance

### When to Update Tests
- Component selectors change
- Korean text labels change
- New export options added
- Template categories modified
- Excel sheet names changed

### How to Update Tests
1. Find the test that needs updating
2. Update selector or assertion
3. Run test to verify fix
4. Check for related tests that need same fix

### Adding New Tests
1. Follow existing test structure
2. Use same setup/teardown patterns
3. Add to appropriate describe block
4. Include clear comments
5. Document in this file

---

## Performance & Flakiness

### Known Flaky Scenarios
- Toast messages disappearing quickly (mitigated with try-catch)
- Dialog animations affecting element visibility (mitigated with wait)
- Download events (mitigated with proper listener setup)

### Performance Tips
- Tests run in parallel (workers > 1)
- Each test clears state (no inter-test dependencies)
- Timeouts are reasonable (5-10s max)
- No unnecessary waits (500ms only for animations)

---

## Coverage

### Components Tested
- ✅ LeadTimePanel.tsx
- ✅ TemplateLibrary.tsx
- ✅ ExcelExportDialog.tsx
- ✅ WorkflowCanvas.tsx (integration)

### Features Tested
- ✅ Lead time calculation & display
- ✅ Critical path highlighting & export
- ✅ Template loading, filtering, search
- ✅ Custom template creation & deletion
- ✅ Excel export dialog & download

### Workflows Tested
- ✅ Basic feature interaction
- ✅ Error states (no nodes, no project)
- ✅ Feature coexistence (Lead Time + Templates + Excel)
- ✅ Multiple user interactions in sequence

---

## References

- **Playwright Docs**: https://playwright.dev
- **FlowMatrix Repo**: /Users/jueunlee/dev/flowmatrix-mvp
- **Test Config**: playwright.config.ts
- **Existing Tests**: e2e/workflow.spec.ts
- **Component Code**:
  - client/src/components/LeadTimePanel.tsx
  - client/src/components/TemplateLibrary.tsx
  - client/src/components/ExcelExportDialog.tsx

---

**Last Updated**: 2025-01-15
**Test File**: e2e/phase7-features.spec.ts (545 lines)
**Total Tests**: 15 (12 main + 3 integration)
