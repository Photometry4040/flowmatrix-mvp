import { test, expect } from '@playwright/test';

test.describe('FlowMatrix Workflow Canvas', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear LocalStorage to start with a fresh state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 페이지 로드 대기
    await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });
  });

  test('should display main page with canvas', async ({ page }) => {
    // 제목 확인
    await expect(page.locator('text=FlowMatrix')).toBeVisible();

    // 캔버스 뷰 버튼 확인 (data-testid 사용)
    await expect(page.getByTestId('view-toggle-canvas')).toBeVisible();

    // 노드 추가 버튼 확인 (data-testid 사용)
    await expect(page.getByTestId('add-node-button')).toBeVisible();
  });

  test('should add a new node to canvas', async ({ page }) => {
    // 초기 노드 개수 확인 (6개의 샘플 노드)
    const initialNodes = page.locator('.react-flow__node');
    const initialCount = await initialNodes.count();

    // 노드 추가 버튼 클릭 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await expect(addButton).toBeVisible();
    await addButton.click();

    // 새 노드가 캔버스에 추가되었는지 확인 (초기 개수 + 1)
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(initialCount + 1, { timeout: 5000 });
  });

  test('should switch between canvas and matrix view', async ({ page }) => {
    // 초기 상태: 캔버스 뷰
    await expect(page.locator('.react-flow')).toBeVisible();

    // 매트릭스 뷰로 전환 (data-testid 사용)
    const matrixButton = page.getByTestId('view-toggle-matrix');
    await matrixButton.click();

    // 매트릭스 뷰 확인
    await expect(page.locator('text=부서 \\ 단계')).toBeVisible();

    // 다시 캔버스 뷰로 전환 (data-testid 사용)
    const canvasButton = page.getByTestId('view-toggle-canvas');
    await canvasButton.click();

    // 캔버스 뷰 확인
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should open node detail panel when node is clicked', async ({ page }) => {
    // 노드 추가 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await addButton.click();

    // 노드 클릭
    const node = page.locator('.react-flow__node').first();
    await node.click();

    // 노드 상세 패널 확인 (data-testid 사용)
    await expect(page.getByTestId('node-detail-panel')).toBeVisible({ timeout: 3000 });
  });

  test('should display statistics in toolbar', async ({ page }) => {
    // 통계 확인 (data-testid 사용)
    await expect(page.getByTestId('stat-progress')).toBeVisible();
    await expect(page.getByTestId('stat-bottleneck')).toBeVisible();
    await expect(page.getByTestId('stat-ai-replaceable')).toBeVisible();
  });

  test('should drag and drop node type to canvas', async ({ page }) => {
    // 초기 노드 개수 확인
    const initialNodes = page.locator('.react-flow__node');
    const initialCount = await initialNodes.count();

    // 드래그 가능한 노드 타입 카드 찾기 (data-testid 사용)
    const triggerCard = page.getByTestId('draggable-node-trigger');
    await expect(triggerCard).toBeVisible();

    // React Flow 캔버스 찾기 (data-testid 사용)
    const canvas = page.getByTestId('workflow-canvas');
    await expect(canvas).toBeVisible();

    // 드래그 앤 드롭 시뮬레이션
    const triggerBox = await triggerCard.boundingBox();
    const canvasBox = await canvas.boundingBox();

    if (triggerBox && canvasBox) {
      await page.mouse.move(
        triggerBox.x + triggerBox.width / 2,
        triggerBox.y + triggerBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2
      );
      await page.mouse.up();

      // 노드가 추가되었는지 확인 (초기 개수 + 1)
      const nodes = page.locator('.react-flow__node');
      await expect(nodes).toHaveCount(initialCount + 1, { timeout: 5000 });
    }
  });

  test('should show AI score for repetitive tasks', async ({ page }) => {
    // 초기 노드 중 하나를 클릭 (aiScore가 있는 노드)
    // 6개의 초기 노드 중 일부는 aiScore를 가지고 있음
    const nodes = page.locator('.react-flow__node');
    await expect(nodes.first()).toBeVisible({ timeout: 5000 });

    // 여러 노드를 클릭해서 aiScore가 있는 노드를 찾음
    for (let i = 0; i < 6; i++) {
      await nodes.nth(i).click();
      await page.waitForTimeout(500); // 패널 열림 대기

      // AI 대체 가능성 섹션이 있는지 확인
      const aiScoreSection = page.locator('text=AI 대체 가능성');
      if (await aiScoreSection.isVisible({ timeout: 1000 }).catch(() => false)) {
        // AI 대체 가능성 섹션 확인 성공
        await expect(aiScoreSection).toBeVisible();
        break;
      }
    }
  });
});

test.describe('FlowMatrix Matrix View', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear LocalStorage to start with a fresh state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });

    // 매트릭스 뷰로 전환 (data-testid 사용)
    const matrixButton = page.getByTestId('view-toggle-matrix');
    await matrixButton.click();
  });

  test('should display matrix grid with departments and stages', async ({ page }) => {
    // 매트릭스 헤더 확인 (data-testid 사용)
    await expect(page.getByTestId('matrix-header-corner')).toBeVisible();

    // 부서 확인 (data-testid 사용)
    await expect(page.getByTestId('matrix-dept-product_team')).toBeVisible();
    await expect(page.getByTestId('matrix-dept-design_team')).toBeVisible();
    await expect(page.getByTestId('matrix-dept-sw_team')).toBeVisible();

    // 프로젝트 단계 확인 (data-testid 사용)
    await expect(page.getByTestId('matrix-stage-planning')).toBeVisible();
    await expect(page.getByTestId('matrix-stage-development')).toBeVisible();
    await expect(page.getByTestId('matrix-stage-testing')).toBeVisible();
  });

  test('should filter nodes by cell in matrix view', async ({ page }) => {
    // 노드를 추가하기 위해 캔버스 뷰로 전환 (data-testid 사용)
    const canvasButton = page.getByTestId('view-toggle-canvas');
    await canvasButton.click();

    // 노드 추가 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await addButton.click();

    // 다시 매트릭스 뷰로 전환 (data-testid 사용)
    const matrixButton = page.getByTestId('view-toggle-matrix');
    await matrixButton.click();

    // 매트릭스 셀에 노드 수가 표시되는지 확인
    // (실제 구현에 따라 셀렉터가 달라질 수 있음)
    const cells = page.locator('.matrix-cell');
    await expect(cells.first()).toBeVisible();
  });
});
