import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import NodeDetailPanel from '../NodeDetailPanel';
import type { ActivityNode } from '@/types/workflow';

const mockNode: ActivityNode = {
  id: 'node_1',
  type: 'ACTION',
  label: 'Test Node',
  stage: 'DEVELOPMENT',
  department: 'SW_TEAM',
  attributes: {
    tool: ['Figma'],
    avg_time: '2h',
    is_repetitive: false,
    brain_usage: 'MEDIUM',
    assignee: 'Tester',
  },
  ontology_tags: ['#test'],
  position: { x: 0, y: 0 },
};

describe('NodeDetailPanel', () => {
  const onClose = vi.fn();
  const onUpdate = vi.fn();
  const onDelete = vi.fn();
  const onToggleCollapse = vi.fn();
  const onToggleFloating = vi.fn();

  const renderPanel = (overrides: Partial<React.ComponentProps<typeof NodeDetailPanel>> = {}) => {
    return render(
      <NodeDetailPanel
        node={mockNode}
        onClose={onClose}
        onUpdate={onUpdate}
        onDelete={onDelete}
        allTags={['#test']}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        isFloating={false}
        onToggleFloating={onToggleFloating}
        {...overrides}
      />
    );
  };

  it('renders main panel with correct positioning classes and styles when expanded', () => {
    renderPanel();

    const panel = screen.getByTestId('node-detail-panel');

    // Positioning and layout classes should match implementation
    const className = panel.className;
    expect(className).toContain('absolute');
    expect(className).toContain('right-4');
    expect(className).toContain('top-28');
    expect(className).toContain('z-20');
    expect(className).toContain('w-96');
    expect(className).toContain('max-h-[calc(100vh-8rem)]');
    expect(className).toContain('overflow-y-auto');
  });

  it('renders collapsed toggle button with correct positioning when collapsed', () => {
    renderPanel({ isCollapsed: true });

    // When collapsed, the floating toggle button container (motion.div) wraps the button
    const collapsedToggleContainer = screen.getByRole('button', {
      name: '노드 상세 패널 열기',
    }).parentElement as HTMLElement | null;

    expect(collapsedToggleContainer).toBeTruthy();

    const className = collapsedToggleContainer!.className;
    expect(className).toContain('absolute');
    expect(className).toContain('right-4');
    expect(className).toContain('top-28');
    expect(className).toContain('z-20');
  });
});
