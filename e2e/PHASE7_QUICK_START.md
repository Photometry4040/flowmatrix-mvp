# Phase 7 E2E Tests - Quick Start Guide

## Quick Commands

### Run All Phase 7 Tests
```bash
pnpm test:e2e phase7-features
```

### Run Tests by Category
```bash
# Lead Time Tests
pnpm test:e2e phase7-features -g "Lead Time"

# Template Tests
pnpm test:e2e phase7-features -g "Template Library"

# Excel Tests
pnpm test:e2e phase7-features -g "Excel Export"

# Integration Tests
pnpm test:e2e phase7-features -g "Integration"
```

### Run with UI (Visual Mode)
```bash
pnpm test:e2e phase7-features --ui
```

### Run Single Test
```bash
pnpm test:e2e phase7-features -g "Open Lead Time Panel"
```

### Debug Mode
```bash
pnpm test:e2e phase7-features --debug
```

### View HTML Report
```bash
pnpm test:e2e phase7-features --reporter=html
```

---

## Test Summary

| # | Test | Category | Duration | Status |
|---|------|----------|----------|--------|
| 1 | Open Lead Time Panel | Lead Time | ~1s | ✓ |
| 2 | Display Total Lead Time | Lead Time | ~1s | ✓ |
| 3 | Highlight Critical Path | Lead Time | ~1s | ✓ |
| 4 | Export Lead Time to CSV | Lead Time | ~2s | ✓ |
| 5 | Open Template Library Dialog | Template | ~1s | ✓ |
| 6 | Filter by Category | Template | ~1s | ✓ |
| 7 | Search Templates | Template | ~1s | ✓ |
| 8 | Load Built-in Template | Template | ~2s | ✓ |
| 9 | Save Workflow as Template | Template | ~2s | ✓ |
| 10 | Delete Custom Template | Template | ~2s | ✓ |
| 11 | Open Excel Export Dialog | Excel | ~1s | ✓ |
| 12 | Export Workflow to Excel | Excel | ~2s | ✓ |
| 13 | Lead Time Panel persists | Integration | ~1s | ✓ |
| 14 | Features coexist | Integration | ~1s | ✓ |
| 15 | No console errors | Integration | ~2s | ✓ |

**Total Tests**: 15
**Estimated Total Duration**: ~20-30 seconds (first run)
**Estimated Total Duration**: ~15-20 seconds (subsequent runs with cache)

---

## Prerequisites

### 1. Start Dev Server
The dev server must be running (either manually or auto-started by Playwright):
```bash
pnpm dev
# Server runs on http://localhost:3000
```

### 2. Clear State (Optional)
Tests clear LocalStorage automatically, but you can manually clear:
```bash
# Open DevTools in browser
localStorage.clear()
location.reload()
```

---

## What Gets Tested

### Lead Time Calculator (Tests 1-4)
- ✓ Panel renders on workflow canvas
- ✓ Total lead time displays correctly
- ✓ Critical path nodes are highlighted
- ✓ CSV export downloads with proper naming

### Template Library (Tests 5-10)
- ✓ Dialog opens and shows tabs
- ✓ Category filtering works
- ✓ Template search filters results
- ✓ Built-in templates load onto canvas
- ✓ Current workflow saves as custom template
- ✓ Custom templates can be deleted

### Excel Export (Tests 11-12)
- ✓ Dialog opens with all options
- ✓ Export generates .xlsx file with correct naming
- ✓ File contains selected sheets

### Integration (Tests 13-15)
- ✓ Lead Time Panel updates with workflow changes
- ✓ All three features work together
- ✓ No critical JavaScript errors occur

---

## Common Issues & Solutions

### ❌ Tests Timeout
**Issue**: Test hangs and times out
**Solution**:
1. Ensure dev server is running: `pnpm dev`
2. Check browser is not blocked by firewall
3. Increase timeout: `--timeout=60000`

### ❌ Element Not Found
**Issue**: Selector doesn't match element
**Solution**:
1. Run with `--debug` flag to inspect
2. Verify element text matches test (case-sensitive Korean text)
3. Check if element is in a dialog/panel that needs scrolling

### ❌ Download Not Starting
**Issue**: File doesn't download
**Solution**:
1. Check browser download settings
2. Ensure JavaScript is enabled
3. Run tests individually to isolate issue

### ❌ Flaky Tests
**Issue**: Test passes sometimes, fails sometimes
**Solution**:
1. Try increasing timeout values
2. Run with `--repeat=3` to verify stability
3. Check system resources (memory, disk space)

---

## Expected Output

### Success (All Tests Pass)
```
Phase 7 Features E2E
  Lead Time Calculator
    ✓ 1. Open Lead Time Panel (1s)
    ✓ 2. Display Total Lead Time (1s)
    ✓ 3. Highlight Critical Path (1s)
    ✓ 4. Export Lead Time to CSV (2s)
  Template Library
    ✓ 5. Open Template Library Dialog (1s)
    ✓ 6. Filter by Category (1s)
    ✓ 7. Search Templates (1s)
    ✓ 8. Load Built-in Template (2s)
    ✓ 9. Save Workflow as Template (2s)
    ✓ 10. Delete Custom Template (2s)
  Excel Export
    ✓ 11. Open Excel Export Dialog (1s)
    ✓ 12. Export Workflow to Excel (2s)
Phase 7 Integration Tests
  ✓ Lead Time Panel persists with workflow changes (1s)
  ✓ Template and Excel Export features coexist (1s)
  ✓ No console errors on Phase 7 feature interactions (2s)

15 passed in 20s
```

### Partial Failure
```
Phase 7 Features E2E
  Lead Time Calculator
    ✓ 1. Open Lead Time Panel
    ✓ 2. Display Total Lead Time
    ✗ 3. Highlight Critical Path
      - Expected element to be visible
      - timeout 5000ms
    ✓ 4. Export Lead Time to CSV
  ...
```

---

## Debugging Tips

### 1. Run Single Test with Debug
```bash
pnpm test:e2e phase7-features -g "Display Total Lead Time" --debug
```

### 2. Slow Down Tests
```bash
# View each step with 1s delay
pnpm test:e2e phase7-features --headed --slow-mo=1000
```

### 3. Keep Browser Open
```bash
# Browser stays open after test for inspection
pnpm test:e2e phase7-features --headed
```

### 4. Generate Video
```bash
# Video of test execution saved to test-results/
pnpm test:e2e phase7-features --video=on
```

### 5. Take Screenshots
```bash
# Screenshots on every step
pnpm test:e2e phase7-features --screenshot=on
```

### 6. Trace for Full Debug Info
```bash
# Detailed trace saved for inspection
pnpm test:e2e phase7-features --trace=on
```

---

## Test Maintenance Checklist

- [ ] Run tests after modifying Phase 7 components
- [ ] Update selectors if Korean text changes
- [ ] Add new tests if new features added
- [ ] Update documentation when tests change
- [ ] Run `--reporter=html` to view detailed report
- [ ] Review test results before committing

---

## File Locations

| File | Purpose |
|------|---------|
| `e2e/phase7-features.spec.ts` | Main test file (545 lines) |
| `e2e/PHASE7_TESTS.md` | Detailed documentation |
| `e2e/PHASE7_QUICK_START.md` | This file |
| `e2e/workflow.spec.ts` | Existing tests (reference) |
| `playwright.config.ts` | Playwright configuration |

---

## Next Steps

1. **Run Tests**: `pnpm test:e2e phase7-features`
2. **View Report**: Open `playwright-report/index.html` in browser
3. **Debug Failures**: Use `--debug` flag for interactive debugging
4. **Integrate in CI/CD**: Tests auto-run in GitHub Actions
5. **Monitor Flakiness**: Track test stability over time

---

## Support & Questions

For detailed information, see **PHASE7_TESTS.md** for:
- Full test descriptions
- Expected behaviors
- Selector strategies
- Error handling details
- Troubleshooting guide
- Performance tips

---

**Last Updated**: 2025-01-15
**Test Count**: 15 (12 main + 3 integration)
**File Size**: 545 lines
**Status**: Ready for execution
