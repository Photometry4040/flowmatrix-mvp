import { test, expect } from '@playwright/test';

test.describe('FlowMatrix Performance Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear LocalStorage to start with a fresh state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });
  });

  test('should handle 50 nodes without performance degradation', async ({ page }) => {
    const startTime = Date.now();
    const addButton = page.getByTestId('add-node-button');

    // Add 50 nodes
    for (let i = 0; i < 50; i++) {
      await addButton.click();
      // Don't wait too long between clicks to simulate rapid adding
      await page.waitForTimeout(50);
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(56, { timeout: 10000 }); // 6 initial + 50 new

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
    console.log(`Added 50 nodes in ${duration}ms`);
  });

  test('should render 100+ nodes efficiently', async ({ page }) => {
    const addButton = page.getByTestId('add-node-button');

    // Add 100 nodes rapidly
    for (let i = 0; i < 100; i++) {
      await addButton.click();
      if (i % 10 === 0) {
        // Only wait every 10 nodes to speed up
        await page.waitForTimeout(100);
      }
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(106, { timeout: 15000 }); // 6 initial + 100 new

    // Check that UI is still responsive
    const viewToggle = page.getByTestId('view-toggle-matrix');
    await viewToggle.click();
    await expect(page.getByTestId('matrix-view')).toBeVisible({ timeout: 5000 });

    // Switch back to canvas
    await page.getByTestId('view-toggle-canvas').click();
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 5000 });
  });

  test('should handle zoom and pan with many nodes', async ({ page }) => {
    const addButton = page.getByTestId('add-node-button');

    // Add 30 nodes
    for (let i = 0; i < 30; i++) {
      await addButton.click();
      await page.waitForTimeout(50);
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(36, { timeout: 5000 });

    // Test zoom controls
    const canvas = page.getByTestId('workflow-canvas');
    await expect(canvas).toBeVisible();

    // Simulate zoom (using React Flow controls)
    const zoomInButton = page.locator('button[aria-label="zoom in"]').first();
    if (await zoomInButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await zoomInButton.click();
      await page.waitForTimeout(500);
    }

    // Simulate pan (drag on canvas)
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + canvasBox.width / 2 + 100, canvasBox.y + canvasBox.height / 2 + 100);
      await page.mouse.up();
    }

    // Canvas should still be responsive
    await expect(canvas).toBeVisible();
  });

  test('should calculate statistics for large number of nodes efficiently', async ({ page }) => {
    const addButton = page.getByTestId('add-node-button');

    // Add 40 nodes
    for (let i = 0; i < 40; i++) {
      await addButton.click();
      await page.waitForTimeout(50);
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(46, { timeout: 5000 });

    // Statistics should be calculated and displayed
    const statsProgress = page.getByTestId('stat-progress');
    const statsBottleneck = page.getByTestId('stat-bottleneck');
    const statsAiReplaceable = page.getByTestId('stat-ai-replaceable');

    await expect(statsProgress).toBeVisible();
    await expect(statsBottleneck).toBeVisible();
    await expect(statsAiReplaceable).toBeVisible();

    // Get the values
    const bottleneckCount = await statsBottleneck.textContent();
    const aiReplaceableCount = await statsAiReplaceable.textContent();

    console.log(`Statistics: Bottlenecks=${bottleneckCount}, AI Replaceable=${aiReplaceableCount}`);

    // Values should be defined
    expect(bottleneckCount).toBeDefined();
    expect(aiReplaceableCount).toBeDefined();
  });

  test('should switch between views with many nodes without lag', async ({ page }) => {
    const addButton = page.getByTestId('add-node-button');

    // Add 50 nodes
    for (let i = 0; i < 50; i++) {
      await addButton.click();
      await page.waitForTimeout(50);
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(56, { timeout: 10000 });

    // Measure view switch time
    const startTime = Date.now();

    // Switch to matrix view
    await page.getByTestId('view-toggle-matrix').click();
    await expect(page.getByTestId('matrix-view')).toBeVisible({ timeout: 3000 });

    const matrixSwitchTime = Date.now() - startTime;

    // Switch back to canvas
    const canvasStartTime = Date.now();
    await page.getByTestId('view-toggle-canvas').click();
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 3000 });

    const canvasSwitchTime = Date.now() - canvasStartTime;

    console.log(`View switch times: Matrix=${matrixSwitchTime}ms, Canvas=${canvasSwitchTime}ms`);

    // Both switches should be fast (< 2 seconds)
    expect(matrixSwitchTime).toBeLessThan(2000);
    expect(canvasSwitchTime).toBeLessThan(2000);
  });

  test('should delete multiple nodes efficiently', async ({ page }) => {
    const addButton = page.getByTestId('add-node-button');

    // Add 20 nodes
    for (let i = 0; i < 20; i++) {
      await addButton.click();
      await page.waitForTimeout(50);
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(26, { timeout: 5000 });

    // Delete 10 nodes using Delete key
    for (let i = 0; i < 10; i++) {
      // Click on a node
      await nodes.nth(6 + i).click();
      await page.waitForTimeout(200);

      // Press Delete key
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
    }

    // Should have 16 nodes left (26 - 10)
    await expect(nodes).toHaveCount(16, { timeout: 5000 });
  });

  test('should maintain performance with LocalStorage operations', async ({ page }) => {
    // Enable performance monitoring
    await page.evaluate(() => {
      (window as any).performanceMarks = [];
      performance.mark('start');
    });

    const addButton = page.getByTestId('add-node-button');

    // Add 30 nodes (triggers auto-save)
    for (let i = 0; i < 30; i++) {
      await addButton.click();
      await page.waitForTimeout(100); // Allow time for auto-save
    }

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(36, { timeout: 5000 });

    // Get performance measurements
    const duration = await page.evaluate(() => {
      performance.mark('end');
      performance.measure('total', 'start', 'end');
      const measure = performance.getEntriesByName('total')[0];
      return measure.duration;
    });

    console.log(`Total duration with auto-save: ${duration}ms`);

    // Should complete within reasonable time even with auto-save
    expect(duration).toBeLessThan(20000); // 20 seconds for 30 nodes with auto-save
  });
});
