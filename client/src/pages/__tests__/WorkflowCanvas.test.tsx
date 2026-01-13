import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WorkflowCanvas from '../WorkflowCanvas';

// Mocks for external libraries and heavy components

// Keep track of last FloatingPanel props used by WorkflowCanvas
let lastFloatingPanelProps: any = null;

vi.mock('@xyflow/react', () => {
  const React = require('react');

  const MockReactFlow = (props: any) => {
    const { children, onNodeClick, nodes } = props;

    const handleClick = () => {
      if (onNodeClick && nodes && nodes.length > 0) {
        onNodeClick({} as any, nodes[0]);
      }
    };

    return (
      <div data-testid="react-flow-mock">
        <button type="button" data-testid="mock-node" onClick={handleClick}>
          Mock Node
        </button>
        {children}
      </div>
    );
  };

  const MockBackground = (props: any) => <div data-testid="background-mock" {...props} />;
  const MockControls = (props: any) => <div data-testid="controls-mock" {...props} />;
  const MockMiniMap = (props: any) => <div data-testid="minimap-mock" {...props} />;

  const BackgroundVariant = {
    Dots: 'dots',
  };

  return {
    ReactFlow: MockReactFlow,
    Background: MockBackground,
    BackgroundVariant,
    Controls: MockControls,
    MiniMap: MockMiniMap,
    useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
    useEdgesState: (initial: any) => [initial, vi.fn(), vi.fn()],
  };
});

vi.mock('@/lib/workflowEngine', () => ({
  updateWorkflowStatus: (nodes: any) => nodes,
  completeNode: (_id: string, nodes: any) => nodes,
  startNode: vi.fn(),
  calculateWorkflowProgress: () => 0,
  checkPrerequisites: vi.fn(),
  wouldCreateCycle: () => false,
}));

vi.mock('@/lib/workflowStorage', () => ({
  loadCurrentProject: () => null,
  createNewProject: (name: string, description: string) => ({
    id: 'project-1',
    name,
    description,
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  }),
  autoSaveProject: vi.fn(),
  saveProject: vi.fn(),
  getProjectsList: () => [],
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/components/WorkflowNode', () => {
  const React = require('react');
  return {
    default: (props: any) => <div data-testid="workflow-node-mock">{props.data?.label}</div>,
  };
});

vi.mock('@/components/MatrixView', () => {
  const React = require('react');
  return {
    default: (props: any) => (
      <div data-testid="matrix-view-mock">
        {props.nodes?.map((n: any) => (
          <div key={n.id}>{n.label}</div>
        ))}
      </div>
    ),
  };
});

vi.mock('@/components/DraggableNodeType', () => {
  const React = require('react');
  return {
    default: (props: any) => <div data-testid={`draggable-${props.type}`}>{props.label}</div>,
  };
});

vi.mock('@/components/ProjectManager', () => {
  const React = require('react');
  return {
    default: () => <div data-testid="project-manager-mock" />,
  };
});

vi.mock('@/components/ResizablePanel', () => {
  const React = require('react');
  return {
    default: (props: any) => <div data-testid="resizable-panel-mock">{props.children}</div>,
  };
});

vi.mock('@/components/NodeDetailPanel', () => {
  const React = require('react');
  return {
    default: (props: any) => (
      <div data-testid="node-detail-panel-mock">
        <button
          type="button"
          title="플로팅 모드"
          data-testid="right-panel-floating-toggle"
          onClick={props.onToggleFloating}
        >
          Toggle Floating
        </button>
      </div>
    ),
  };
});

vi.mock('@/components/FloatingPanel', () => {
  const React = require('react');
  return {
    default: (props: any) => {
      lastFloatingPanelProps = props;
      const { position } = props;
      return (
        <div
          data-testid="floating-panel-mock"
          style={{ position: 'fixed', left: position.x, top: position.y }}
        >
          {props.children}
        </div>
      );
    },
  };
});

describe('WorkflowCanvas - panel positions and UI classes', () => {
  beforeEach(() => {
    lastFloatingPanelProps = null;
    (window as any).innerWidth = 1200;
    (window as any).innerHeight = 800;
    window.alert = vi.fn();
  });

  it('sets default left floating panel position correctly when toggled', () => {
    render(<WorkflowCanvas />);

    // Left panel floating toggle button (in docked sidebar)
    // Use getAllByTitle and get the first one (left panel), since both panels have the same title
    const floatToggles = screen.getAllByTitle('플로팅 모드');
    const leftFloatToggle = floatToggles[0];
    fireEvent.click(leftFloatToggle);

    expect(lastFloatingPanelProps).toBeTruthy();

    const { position } = lastFloatingPanelProps;
    const expectedX = Math.max(16, window.innerWidth / 4 - 128);

    expect(position).toEqual({ x: expectedX, y: 130 });
  });

  it('sets default right floating panel position correctly when toggled', () => {
    render(<WorkflowCanvas />);

    // First select a node via mocked ReactFlow to open the right panel
    const mockNodeButton = screen.getByTestId('mock-node');
    fireEvent.click(mockNodeButton);

    // Then toggle floating mode for the right panel via mocked NodeDetailPanel
    const rightFloatToggle = screen.getByTestId('right-panel-floating-toggle');
    fireEvent.click(rightFloatToggle);

    expect(lastFloatingPanelProps).toBeTruthy();

    const { position } = lastFloatingPanelProps;
    const expectedX = Math.max(16, window.innerWidth - 400);

    expect(position).toEqual({ x: expectedX, y: 130 });
  });

  it('applies updated UI classes and styles to key elements', () => {
    const { container } = render(<WorkflowCanvas />);

    // Top toolbar header should use floating-toolbar styles
    const title = screen.getByText('FlowMatrix');
    const header = title.closest('header') as HTMLElement;
    expect(header).toBeTruthy();
    expect(header.className).toContain('floating-toolbar');
    expect(header.className).toContain('z-30');

    // Main canvas wrapper should use grid-background class
    const canvas = screen.getByTestId('workflow-canvas');
    expect(canvas.className).toContain('grid-background');

    // React Flow controls should receive floating-toolbar class
    const controls = container.querySelector('[data-testid="controls-mock"]') as HTMLElement;
    expect(controls).toBeTruthy();
    expect(controls.className).toContain('floating-toolbar');

    // Mini map should receive custom background class
    const miniMap = container.querySelector('[data-testid="minimap-mock"]') as HTMLElement;
    expect(miniMap).toBeTruthy();
    expect(miniMap.className).toContain('floating-toolbar');

    // Collapse the left panel and verify collapsed toggle button classes
    const collapseButton = screen.getByTitle('패널 접기');
    fireEvent.click(collapseButton);

    const reopenButton = screen.getByTitle('노드 패널 열기');
    expect(reopenButton.className).toContain('brutal-card');
    expect(reopenButton.className).toContain('shadow-lg');
  });
});
