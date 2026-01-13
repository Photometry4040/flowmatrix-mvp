import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import FloatingPanel from '../FloatingPanel';

// Capture props passed into framer-motion's motion.div
let lastMotionDivProps: any = null;

vi.mock('framer-motion', async () => {
  const actual: any = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: (props: any) => {
        lastMotionDivProps = props;
        return <div data-testid="floating-panel-mock" {...props} />;
      },
    },
  };
});

describe('FloatingPanel', () => {
  const onPositionChange = vi.fn();
  const onToggleFloating = vi.fn();

  beforeEach(() => {
    lastMotionDivProps = null;
    onPositionChange.mockReset();
    onToggleFloating.mockReset();

    // Ensure consistent viewport between tests
    (window as any).innerWidth = 1200;
    (window as any).innerHeight = 800;
  });

  const renderPanel = (position = { x: 100, y: 150 }, width = 300) => {
    return render(
      <FloatingPanel
        isFloating={true}
        position={position}
        onPositionChange={onPositionChange}
        onToggleFloating={onToggleFloating}
        width={width}
      >
        <div>Content</div>
      </FloatingPanel>
    );
  };

  it('clamps drag position to viewport bounds on drag end', () => {
    renderPanel();

    expect(lastMotionDivProps).toBeTruthy();

    const { onDragEnd } = lastMotionDivProps;

    // Panel bounds derived from component implementation
    // minX = 0, minY = 112
    // maxX = window.innerWidth - width - 16 = 1200 - 300 - 16 = 884
    // maxY = window.innerHeight - 150 = 650

    // Simulate dragging far outside bottom-right
    onDragEnd?.(null, { offset: { x: 10_000, y: 10_000 } });

    expect(onPositionChange).toHaveBeenCalledWith(884, 650);

    onPositionChange.mockClear();

    // Simulate dragging far outside top-left
    onDragEnd?.(null, { offset: { x: -10_000, y: -10_000 } });

    expect(onPositionChange).toHaveBeenCalledWith(0, 112);
  });

  it('sets dragConstraints based on window size and current position', () => {
    const position = { x: 200, y: 200 };
    const width = 400;

    renderPanel(position, width);

    expect(lastMotionDivProps).toBeTruthy();

    const { dragConstraints } = lastMotionDivProps;

    // From implementation:
    // minX = 0, minY = 112
    // maxX = window.innerWidth - width - 16 = 1200 - 400 - 16 = 784
    // maxY = window.innerHeight - 150 = 650
    // dragConstraints = {
    //   left: minX - position.x,
    //   right: maxX - position.x,
    //   top: minY - position.y,
    //   bottom: maxY - position.y,
    // }

    expect(dragConstraints).toEqual({
      left: 0 - 200,
      right: 784 - 200,
      top: 112 - 200,
      bottom: 650 - 200,
    });
  });
});
