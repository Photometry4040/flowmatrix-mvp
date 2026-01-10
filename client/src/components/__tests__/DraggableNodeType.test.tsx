import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DraggableNodeType from '../DraggableNodeType';
import { Play } from 'lucide-react';

describe('DraggableNodeType', () => {
  it('should render with correct label', () => {
    render(
      <DraggableNodeType
        type="TRIGGER"
        label="Trigger (시작)"
        icon={Play}
        colorClass="border-success text-success"
      />
    );
    
    expect(screen.getByText('Trigger (시작)')).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <DraggableNodeType
        type="ACTION"
        label="Action (행동)"
        icon={Play}
        colorClass="border-primary text-primary"
      />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have draggable attribute', () => {
    const { container } = render(
      <DraggableNodeType
        type="DECISION"
        label="Decision (판단)"
        icon={Play}
        colorClass="border-accent text-accent"
      />
    );
    
    const draggableElement = container.querySelector('[draggable="true"]');
    expect(draggableElement).toBeInTheDocument();
  });

  it('should set data transfer on drag start', () => {
    const { container } = render(
      <DraggableNodeType
        type="ARTIFACT"
        label="Artifact (산출물)"
        icon={Play}
        colorClass="border-chart-4 text-chart-4"
      />
    );
    
    const draggableElement = container.querySelector('[draggable="true"]') as HTMLElement;
    
    const mockDataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    };
    
    const dragEvent = new DragEvent('dragstart', {
      dataTransfer: mockDataTransfer as any,
    });
    
    fireEvent(draggableElement, dragEvent);
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/reactflow',
      'ARTIFACT'
    );
    expect(mockDataTransfer.effectAllowed).toBe('move');
  });

  it('should apply correct color class', () => {
    const { container } = render(
      <DraggableNodeType
        type="TRIGGER"
        label="Trigger (시작)"
        icon={Play}
        colorClass="border-success text-success"
      />
    );
    
    const element = container.querySelector('.border-success');
    expect(element).toBeInTheDocument();
    
    const textElement = container.querySelector('.text-success');
    expect(textElement).toBeInTheDocument();
  });

  it('should have cursor-grab class', () => {
    const { container } = render(
      <DraggableNodeType
        type="ACTION"
        label="Action (행동)"
        icon={Play}
        colorClass="border-primary text-primary"
      />
    );
    
    const element = container.querySelector('.cursor-grab');
    expect(element).toBeInTheDocument();
  });
});
