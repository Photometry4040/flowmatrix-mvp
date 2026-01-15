/**
 * Lead Time Analysis Panel
 * Displays total workflow lead time, critical path, and stage/department breakdowns
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  calculateWorkflowLeadTime,
  formatLeadTime,
  isNodeOnCriticalPath,
  calculateBottleneckSeverity,
} from "@/lib/leadTimeCalculator";
import type { ActivityNode, WorkflowRelationship, LeadTimeResult } from "@/types/workflow";
import {
  Clock,
  Zap,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface LeadTimePanelProps {
  nodes: ActivityNode[];
  edges: WorkflowRelationship[];
  onHighlightCriticalPath?: (nodeIds: string[]) => void;
  onClearHighlight?: () => void;
}

export default function LeadTimePanel({
  nodes,
  edges,
  onHighlightCriticalPath,
  onClearHighlight,
}: LeadTimePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showStageBreakdown, setShowStageBreakdown] = useState(false);
  const [showDepartmentBreakdown, setShowDepartmentBreakdown] = useState(false);

  const leadTimeResult: LeadTimeResult = useMemo(
    () => calculateWorkflowLeadTime(nodes, edges),
    [nodes, edges]
  );

  const handleHighlightCriticalPath = () => {
    if (onHighlightCriticalPath) {
      onHighlightCriticalPath(leadTimeResult.criticalPath);
      toast.success("Critical path highlighted");
    }
  };

  const handleClearHighlight = () => {
    if (onClearHighlight) {
      onClearHighlight();
      toast.info("Highlight cleared");
    }
  };

  const exportAsCSV = () => {
    if (nodes.length === 0) {
      toast.error("No nodes to export");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Node ID",
      "Label",
      "Department",
      "Stage",
      "Lead Time (min)",
      "Lead Time (formatted)",
      "On Critical Path",
      "Severity",
    ];

    const rows = nodes.map(node => {
      const onCriticalPath = isNodeOnCriticalPath(node.id, leadTimeResult.criticalPath);
      const leadTime = node.attributes?.avg_time || "0m";
      const severityStr = onCriticalPath
        ? calculateBottleneckSeverity(
            parseInt(node.attributes?.avg_time?.match(/\d+/)?.[0] || "0") * 60,
            leadTimeResult.totalMinutes
          )
        : "N/A";

      return [
        node.id,
        node.label,
        node.department,
        node.stage,
        node.attributes?.avg_time || "0m",
        leadTime,
        onCriticalPath ? "Yes" : "No",
        severityStr,
      ];
    });

    // Summary section
    const summary = [
      [],
      ["Lead Time Analysis Summary"],
      ["Total Lead Time", leadTimeResult.formatted],
      ["Total Minutes", leadTimeResult.totalMinutes],
      ["Total Hours", leadTimeResult.totalHours],
      ["Total Days", leadTimeResult.totalDays],
      ["Critical Path Length", leadTimeResult.criticalPath.length],
      [],
      ["Stage Breakdown"],
      ...Object.entries(leadTimeResult.stageBreakdown).map(([stage, minutes]) => [
        stage,
        formatLeadTime(minutes),
      ]),
      [],
      ["Department Breakdown"],
      ...Object.entries(leadTimeResult.departmentBreakdown).map(([dept, minutes]) => [
        dept,
        formatLeadTime(minutes),
      ]),
    ];

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row
          .map(cell => {
            // Escape cells with commas or quotes
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
      ...summary.map(row =>
        row
          .map(cell => {
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `lead-time-analysis-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Lead time report exported as CSV");
  };

  if (nodes.length === 0) {
    return null;
  }

  return (
    <Card className="brutal-card w-full space-y-3 p-4 bg-card/80">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">리드타임 분석</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportAsCSV}
            className="gap-1 h-8"
            title="Export as CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator />

          {/* Total Lead Time */}
          <div className="space-y-2">
            <div className="text-sm font-bold text-muted-foreground">총 리드타임</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-primary">
                {leadTimeResult.formatted}
              </span>
              <span className="text-xs text-muted-foreground">
                ({leadTimeResult.totalHours}h / {leadTimeResult.totalDays}d)
              </span>
            </div>
          </div>

          {/* Critical Path */}
          {leadTimeResult.criticalPath.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  크리티컬 패스
                  <span className="text-xs font-mono">({leadTimeResult.criticalPath.length} nodes)</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto bg-secondary/30 p-2 rounded-sm border border-border">
                  {leadTimeResult.criticalPathNodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="text-xs space-y-0.5 p-2 bg-secondary/50 rounded-sm border-l-2 border-yellow-400"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">
                          {index + 1}. {node.label}
                        </span>
                        <span className="text-muted-foreground">
                          {formatLeadTime(node.leadTime)}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">{node.id}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHighlightCriticalPath}
                    className="gap-1.5 h-8 flex-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    강조
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHighlight}
                    className="gap-1.5 h-8 flex-1"
                  >
                    해제
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Stage Breakdown */}
          <div className="space-y-2">
            <button
              onClick={() => setShowStageBreakdown(!showStageBreakdown)}
              className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showStageBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              단계별 리드타임
              <span className="text-xs font-mono">
                ({Object.keys(leadTimeResult.stageBreakdown).length})
              </span>
            </button>

            {showStageBreakdown && Object.entries(leadTimeResult.stageBreakdown).length > 0 && (
              <div className="space-y-1 pl-4 border-l-2 border-primary/30">
                {Object.entries(leadTimeResult.stageBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([stage, minutes]) => {
                    const percentage = (minutes / leadTimeResult.totalMinutes) * 100;
                    return (
                      <div key={stage} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{stage}</span>
                          <span className="font-mono text-muted-foreground">
                            {formatLeadTime(minutes)}
                          </span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="space-y-2">
            <button
              onClick={() => setShowDepartmentBreakdown(!showDepartmentBreakdown)}
              className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDepartmentBreakdown ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              부서별 리드타임
              <span className="text-xs font-mono">
                ({Object.keys(leadTimeResult.departmentBreakdown).length})
              </span>
            </button>

            {showDepartmentBreakdown && Object.entries(leadTimeResult.departmentBreakdown).length > 0 && (
              <div className="space-y-1 pl-4 border-l-2 border-accent/30">
                {Object.entries(leadTimeResult.departmentBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([department, minutes]) => {
                    const percentage = (minutes / leadTimeResult.totalMinutes) * 100;
                    return (
                      <div key={department} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{department}</span>
                          <span className="font-mono text-muted-foreground">
                            {formatLeadTime(minutes)}
                          </span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-accent to-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Bottleneck Warning */}
          {leadTimeResult.criticalPath.length > 0 && (
            <>
              <Separator />
              <div className="flex gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-sm">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-xs text-destructive/80">
                  <p className="font-bold mb-1">병목 감지</p>
                  <p>
                    크리티컬 패스의 일부 작업이 전체 리드타임의 30% 이상을 차지합니다. 이들 작업의
                    최적화를 우선적으로 고려하세요.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
