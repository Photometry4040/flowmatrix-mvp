/* Design: Resizable panel wrapper with drag handle
 * Features: Horizontal resize, min/max constraints, visual feedback
 */

import { ReactNode, useCallback, useRef, useState, useEffect } from "react";
import { GripVertical } from "lucide-react";

interface ResizablePanelProps {
  children: ReactNode;
  isResizable: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  side: 'left' | 'right';
}

export default function ResizablePanel({
  children,
  isResizable,
  width,
  onWidthChange,
  minWidth = 300,
  maxWidth = 600,
  side
}: ResizablePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(width);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isResizable) return;
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [isResizable, width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = side === 'right'
        ? startXRef.current - e.clientX
        : e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onWidthChange(clampedWidth);
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, side, minWidth, maxWidth, onWidthChange]);

  if (!isResizable) {
    return <div style={{ width }}>{children}</div>;
  }

  return (
    <div className="relative flex" style={{ width }}>
      {/* Resize handle */}
      <div
        className={`absolute ${side === 'right' ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary transition-colors group z-20`}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-primary rounded-sm p-1">
          <GripVertical className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Fullscreen overlay during resize to prevent conflicts */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}
