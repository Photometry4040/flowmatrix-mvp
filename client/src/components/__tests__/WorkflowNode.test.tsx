import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import WorkflowNode from '../WorkflowNode';
import type { ActivityNode } from '@/types/workflow';

const mockNode: ActivityNode = {
  id: 'test-1',
  type: 'ACTION',
  label: 'Test Node',
  stage: 'DEVELOPMENT',
  department: 'SW_TEAM',
  attributes: {
    tool: ['Figma', 'Adobe XD'],
    avg_time: '2h',
    is_repetitive: false,
    brain_usage: 'MEDIUM',
    assignee: '김개발',
  },
  ontology_tags: ['#테스트', '#개발'],
  position: { x: 0, y: 0 },
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <ReactFlowProvider>
      {ui}
    </ReactFlowProvider>
  );
};

describe('WorkflowNode', () => {
  it('should render node with correct label', () => {
    renderWithProvider(<WorkflowNode data={mockNode} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('should display average time', () => {
    renderWithProvider(<WorkflowNode data={mockNode} />);
    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('should display brain usage badge', () => {
    renderWithProvider(<WorkflowNode data={mockNode} />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('should display tools', () => {
    renderWithProvider(<WorkflowNode data={mockNode} />);
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Adobe XD')).toBeInTheDocument();
  });

  it('should show AI score badge when score > 70', () => {
    const nodeWithAI = { ...mockNode, aiScore: 85 } as any;
    renderWithProvider(<WorkflowNode data={nodeWithAI} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('should not show AI score badge when score <= 70', () => {
    const nodeWithLowAI = { ...mockNode, aiScore: 65 } as any;
    renderWithProvider(<WorkflowNode data={nodeWithLowAI} />);
    expect(screen.queryByText('65%')).not.toBeInTheDocument();
  });

  it('should show bottleneck indicator when isBottleneck is true', () => {
    const bottleneckNode = { ...mockNode, isBottleneck: true } as any;
    const { container } = renderWithProvider(<WorkflowNode data={bottleneckNode} />);
    
    // 병목 노드는 특정 클래스를 가짐
    const nodeElement = container.querySelector('.pulse-bottleneck');
    expect(nodeElement).toBeInTheDocument();
  });

  it('should show repetitive indicator when is_repetitive is true', () => {
    const repetitiveNode = {
      ...mockNode,
      attributes: { ...mockNode.attributes, is_repetitive: true },
    };
    renderWithProvider(<WorkflowNode data={repetitiveNode} />);
    expect(screen.getByText('반복 작업')).toBeInTheDocument();
  });

  it('should render different icon for TRIGGER type', () => {
    const triggerNode = { ...mockNode, type: 'TRIGGER' as const };
    const { container } = renderWithProvider(<WorkflowNode data={triggerNode} />);
    
    // Play 아이콘이 렌더링되는지 확인 (SVG 요소)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render different icon for DECISION type', () => {
    const decisionNode = { ...mockNode, type: 'DECISION' as const };
    const { container } = renderWithProvider(<WorkflowNode data={decisionNode} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render different icon for ARTIFACT type', () => {
    const artifactNode = { ...mockNode, type: 'ARTIFACT' as const };
    const { container } = renderWithProvider(<WorkflowNode data={artifactNode} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
