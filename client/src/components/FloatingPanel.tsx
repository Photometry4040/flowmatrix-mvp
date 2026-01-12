/* Design: Floating panel wrapper for draggable panels
 * Features: Drag over canvas, dock/undock toggle, constrained movement
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import { ReactNode } from "react";

interface FloatingPanelProps {
  children: ReactNode;
  isFloating: boolean;
  position: { x: number; y: number };
  onPositionChange: (x: number, y: number) => void;
  onToggleFloating: () => void;
  width: number;
}

export default function FloatingPanel({
  children,
  isFloating,
  position,
  onPositionChange,
  onToggleFloating,
  width,
}: FloatingPanelProps) {
  // If not floating, render children directly (docked mode)
  if (!isFloating) return <>{children}</>;

  // Floating mode: draggable panel with constraints
  const minX = 0;
  const minY = 112; // top-28 = 112px
  const maxX = Math.max(0, window.innerWidth - width - 16);
  const maxY = Math.max(112, window.innerHeight - 150);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: minX - position.x,
        right: maxX - position.x,
        top: minY - position.y,
        bottom: maxY - position.y,
      }}
      onDragEnd={(_, info) => {
        // Calculate new position based on offset
        let newX = position.x + info.offset.x;
        let newY = position.y + info.offset.y;

        // Clamp to viewport bounds
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        onPositionChange(newX, newY);
      }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: width,
        zIndex: 25,
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      {/* Dock Button - floats above panel */}
      <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFloating}
          onMouseDown={(e) => e.stopPropagation()}
          className="brutal-card gap-2 h-8 shadow-lg"
          title="패널 도킹"
        >
          <Pin className="w-3 h-3" />
          도킹
        </Button>
      </div>

      {/* Panel content */}
      {children}
    </motion.div>
  );
}
