/**
 * Lead Time Analysis Panel (Redesigned)
 * Compact panel with tabbed interface for better usability and visual hierarchy
 * Displays total workflow lead time, critical path, and stage/department breakdowns
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Layers,
  Building2,
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
  const [activeTab, setActiveTab] = useState("overview");
  const [isLeadTimeExpanded, setIsLeadTimeExpanded] = useState(false);

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

  const stageBreakdownEntries = Object.entries(leadTimeResult.stageBreakdown).sort(
    (a, b) => b[1] - a[1]
  );
  const departmentBreakdownEntries = Object.entries(leadTimeResult.departmentBreakdown).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <Card className="brutal-card w-full bg-card/80 flex flex-col">
      {/* Collapsible Header */}
      <div
        className="p-3 flex items-center justify-between border-b border-primary/20 cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setIsLeadTimeExpanded(!isLeadTimeExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Chevron Icon */}
          <div className="flex-shrink-0">
            {isLeadTimeExpanded ? (
              <ChevronUp className="w-5 h-5 text-primary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary" />
            )}
          </div>

          <Clock className="w-5 h-5 text-primary flex-shrink-0" />

          {/* Header Content */}
          {isLeadTimeExpanded ? (
            // Expanded view
            <div className="flex-1">
              <div className="text-xs font-bold text-muted-foreground">총 리드타임</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-bold text-primary">
                  {leadTimeResult.formatted}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ({leadTimeResult.totalHours}h / {leadTimeResult.totalDays}d)
                </span>
              </div>
            </div>
          ) : (
            // Collapsed view - single line
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xs font-bold text-muted-foreground">총 리드타임:</span>
              <span className="text-sm font-mono font-bold text-primary whitespace-nowrap">
                {leadTimeResult.formatted}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              exportAsCSV();
            }}
            className="gap-1 h-8 px-2"
            title="Export as CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isLeadTimeExpanded && (
        <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col p-3">
          <TabsList className="w-fit h-8 bg-secondary/40 p-1">
            <TabsTrigger value="overview" className="text-xs h-6 gap-1">
              <Zap className="w-3.5 h-3.5" />
              크리티컬
            </TabsTrigger>
            <TabsTrigger value="stages" className="text-xs h-6 gap-1">
              <Layers className="w-3.5 h-3.5" />
              단계
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-xs h-6 gap-1">
              <Building2 className="w-3.5 h-3.5" />
              부서
            </TabsTrigger>
          </TabsList>

          {/* Critical Path Tab */}
          {leadTimeResult.criticalPath.length > 0 && (
            <TabsContent value="overview" className="flex-1 space-y-2.5 mt-2.5 min-h-0">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 rounded text-xs font-mono">
                    {leadTimeResult.criticalPath.length}
                  </span>
                  크리티컬 패스 노드
                </div>
              </div>

              {/* Scrollable Critical Path List */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-2">
                {leadTimeResult.criticalPathNodes.map((node, index) => {
                  const percentage = (node.leadTime / leadTimeResult.totalMinutes) * 100;
                  return (
                    <div
                      key={node.id}
                      className="p-2 bg-secondary/30 border border-yellow-400/30 rounded-sm space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {index + 1}. {node.label}
                        </span>
                        <Badge variant="secondary" className="h-5 text-xs">
                          {formatLeadTime(node.leadTime)}
                        </Badge>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-1">
                        <div
                          className="bg-yellow-400/80 h-1 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{node.id}</div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 pt-2 border-t border-primary/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHighlightCriticalPath}
                  className="gap-1.5 h-7 flex-1 text-xs"
                >
                  <Zap className="w-3 h-3" />
                  강조
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHighlight}
                  className="gap-1.5 h-7 flex-1 text-xs"
                >
                  해제
                </Button>
              </div>

              {/* Bottleneck Warning */}
              {leadTimeResult.criticalPath.length > 0 && (
                <div className="flex gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-destructive/80 leading-tight">
                    <p className="font-bold mb-0.5">병목 감지</p>
                    <p className="text-xs">
                      일부 작업이 전체 리드타임의 30% 이상을 차지합니다.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {/* Stage Breakdown Tab */}
          <TabsContent value="stages" className="flex-1 space-y-2 mt-2.5 min-h-0">
            {stageBreakdownEntries.length > 0 ? (
              <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2">
                {stageBreakdownEntries.map(([stage, minutes]) => {
                  const percentage = (minutes / leadTimeResult.totalMinutes) * 100;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{stage}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatLeadTime(minutes)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground pl-1">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                단계 데이터 없음
              </div>
            )}
          </TabsContent>

          {/* Department Breakdown Tab */}
          <TabsContent value="departments" className="flex-1 space-y-2 mt-2.5 min-h-0">
            {departmentBreakdownEntries.length > 0 ? (
              <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2">
                {departmentBreakdownEntries.map(([department, minutes]) => {
                  const percentage = (minutes / leadTimeResult.totalMinutes) * 100;
                  return (
                    <div key={department} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{department}</span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatLeadTime(minutes)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground pl-1">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                부서 데이터 없음
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      )}
    </Card>
  );
}
