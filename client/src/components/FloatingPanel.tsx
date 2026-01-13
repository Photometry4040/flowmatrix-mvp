/* Design: Floating panel wrapper for draggable panels
 * Features: Drag over canvas, dock/undock toggle, constrained movement
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import { ReactNode, useRef, useState } from "react";

interface FloatingPanelProps {
  children: ReactNode;
  isFloating: boolean;
  position: { x: number; y: number };
  onPositionChange: (x: number, y: number) => void;
  onToggleFloating: () => void;
  width: number;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
}

export default function FloatingPanel({
  children,
  isFloating,
  position,
  onPositionChange,
  onToggleFloating,
  width,
  dragHandleRef,
}: FloatingPanelProps) {
  // If not floating, render children directly (docked mode)
  if (!isFloating) return <>{children}</>;

  // Floating mode: draggable panel with constraints
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const minX = 0;
  const minY = 112; // top-28 = 112px
  const maxX = Math.max(0, window.innerWidth - width - 16);
  const maxY = Math.max(112, window.innerHeight - 150);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from the handle if specified, or from drag-handle class
    const target = e.target as HTMLElement;
    const isDragHandle = target.closest('.drag-handle') !== null;
    const isCustomHandle = dragHandleRef?.current && dragHandleRef.current.contains(e.target as Node);

    if ((dragHandleRef || panelRef.current?.querySelector('.drag-handle')) && !isDragHandle && !isCustomHandle) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    // Clamp to viewport bounds
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    onPositionChange(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: width,
        zIndex: 25,
        userSelect: isDragging ? "none" : "auto",
      }}
      className={isDragging ? "cursor-grabbing" : "cursor-auto"}
    >
      {/* Panel content */}
      {children}
    </motion.div>
  );
}
