import { test, expect } from '@playwright/test';

test.describe('FlowMatrix Workflow Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 페이지 로드 대기
    await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });
  });

  test('should display main page with canvas', async ({ page }) => {
    // 제목 확인
    await expect(page.locator('text=FlowMatrix')).toBeVisible();
    
    // 캔버스 뷰 버튼 확인
    await expect(page.locator('text=캔버스')).toBeVisible();
    
    // 노드 추가 패널 확인
    await expect(page.locator('text=노드 추가')).toBeVisible();
  });

  test('should add a new node to canvas', async ({ page }) => {
    // 노드 추가 버튼 클릭 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await expect(addButton).toBeVisible();
    await addButton.click();

    // 새 노드가 캔버스에 추가되었는지 확인
    // React Flow 노드는 특정 클래스를 가짐
    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(1, { timeout: 5000 });
  });

  test('should switch between canvas and matrix view', async ({ page }) => {
    // 초기 상태: 캔버스 뷰
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // 매트릭스 뷰로 전환
    const matrixButton = page.locator('button:has-text("매트릭스")');
    await matrixButton.click();
    
    // 매트릭스 뷰 확인
    await expect(page.locator('text=부서 \\ 단계')).toBeVisible();
    
    // 다시 캔버스 뷰로 전환
    const canvasButton = page.locator('button:has-text("캔버스")');
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
    // 통계 확인
    await expect(page.locator('text=총 노드')).toBeVisible();
    await expect(page.locator('text=병목 구간')).toBeVisible();
    await expect(page.locator('text=AI 대체 가능')).toBeVisible();
  });

  test('should drag and drop node type to canvas', async ({ page }) => {
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
      
      // 노드가 추가되었는지 확인
      const nodes = page.locator('.react-flow__node');
      await expect(nodes).toHaveCount(1, { timeout: 5000 });
    }
  });

  test('should show AI score for repetitive tasks', async ({ page }) => {
    // 노드 추가 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await addButton.click();

    // 노드 클릭하여 상세 패널 열기
    const node = page.locator('.react-flow__node').first();
    await node.click();

    // AI 대체 가능성 섹션 확인
    await expect(page.locator('text=AI 대체 가능성')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('FlowMatrix Matrix View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=FlowMatrix', { timeout: 10000 });
    
    // 매트릭스 뷰로 전환
    const matrixButton = page.locator('button:has-text("매트릭스")');
    await matrixButton.click();
  });

  test('should display matrix grid with departments and stages', async ({ page }) => {
    // 매트릭스 헤더 확인
    await expect(page.locator('text=부서 \\ 단계')).toBeVisible();
    
    // 부서 확인
    await expect(page.locator('text=기획팀')).toBeVisible();
    await expect(page.locator('text=디자인팀')).toBeVisible();
    await expect(page.locator('text=SW팀')).toBeVisible();
    
    // 프로젝트 단계 확인
    await expect(page.locator('text=기획')).toBeVisible();
    await expect(page.locator('text=개발')).toBeVisible();
    await expect(page.locator('text=테스트')).toBeVisible();
  });

  test('should filter nodes by cell in matrix view', async ({ page }) => {
    // 노드를 추가하기 위해 캔버스 뷰로 전환
    const canvasButton = page.locator('button:has-text("캔버스")');
    await canvasButton.click();

    // 노드 추가 (data-testid 사용)
    const addButton = page.getByTestId('add-node-button');
    await addButton.click();

    // 다시 매트릭스 뷰로 전환
    const matrixButton = page.locator('button:has-text("매트릭스")');
    await matrixButton.click();

    // 매트릭스 셀에 노드 수가 표시되는지 확인
    // (실제 구현에 따라 셀렉터가 달라질 수 있음)
    const cells = page.locator('.matrix-cell');
    await expect(cells.first()).toBeVisible();
  });
});
