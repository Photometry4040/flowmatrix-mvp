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
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        right: Math.max(0, window.innerWidth - width - 16),
        top: 100,
        bottom: Math.max(100, window.innerHeight - 300),
      }}
      onDragEnd={(_, info) => {
        onPositionChange(
          position.x + info.offset.x,
          position.y + info.offset.y
        );
      }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: width,
        zIndex: 20,
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      {/* Dock Button - floats above panel */}
      <div className="absolute -top-10 left-0 right-0 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFloating}
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
