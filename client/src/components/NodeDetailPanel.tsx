/* Design: Floating detail panel with AI analysis
 * Features: Node properties, AI score breakdown, bottleneck analysis
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ActivityNode } from "@/types/workflow";
import {
  AlertTriangle,
  Brain,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

interface NodeDetailPanelProps {
  node: ActivityNode | null;
  onClose: () => void;
  onUpdate: (node: ActivityNode) => void;
}

export default function NodeDetailPanel({ node, onClose, onUpdate }: NodeDetailPanelProps) {
  if (!node) return null;

  const aiScore = (node as any).aiScore || 0;
  const isBottleneck = (node as any).isBottleneck || false;

  return (
    <div className="absolute right-4 top-28 z-10 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <Card className="brutal-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-display">{node.label}</CardTitle>
              <CardDescription className="mt-1">
                {node.department} · {node.stage}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bottleneck Warning */}
          {isBottleneck && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-1">병목 구간 감지</h4>
                    <p className="text-sm text-muted-foreground">
                      이 작업은 평균 리드타임이 3일로, 전체 프로세스의 흐름을 지연시키고 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Replacement Score */}
          {aiScore > 0 && (
            <Card className="border-success bg-success/10">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-success" />
                      <h4 className="font-semibold text-success">AI 대체 가능성</h4>
                    </div>
                    <Badge variant="outline" className="bg-success/20 text-success border-success">
                      {aiScore}%
                    </Badge>
                  </div>
                  <Progress value={aiScore} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    단순 반복 작업으로 분류되어 AI Agent로 자동화 가능합니다.
                  </p>
                  <Button size="sm" className="w-full gap-2">
                    <Zap className="w-4 h-4" />
                    AI 솔루션 제안 받기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Basic Properties */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">기본 정보</h4>
            
            <div className="space-y-2">
              <Label htmlFor="label" className="text-xs">작업명</Label>
              <Input 
                id="label" 
                value={node.label} 
                className="font-body"
                onChange={(e) => onUpdate({ ...node, label: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1.5 block">소요 시간</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{node.attributes.avg_time}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">창의성 필요도</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{node.attributes.brain_usage}</span>
                </div>
              </div>
            </div>

            {node.attributes.assignee && (
              <div>
                <Label className="text-xs mb-1.5 block">담당자</Label>
                <Input value={node.attributes.assignee} className="font-body" />
              </div>
            )}
          </div>

          <Separator />

          {/* Tools */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">사용 도구</h4>
            <div className="flex flex-wrap gap-2">
              {node.attributes.tool.length > 0 ? (
                node.attributes.tool.map((tool, idx) => (
                  <Badge key={idx} variant="secondary" className="font-mono">
                    {tool}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">등록된 도구 없음</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">온톨로지 태그</h4>
            <div className="flex flex-wrap gap-2">
              {node.ontology_tags.length > 0 ? (
                node.ontology_tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="font-mono text-primary border-primary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">등록된 태그 없음</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Metrics */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm">프로세스 메트릭</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">반복 작업</span>
                <Badge variant={node.attributes.is_repetitive ? "default" : "secondary"}>
                  {node.attributes.is_repetitive ? "예" : "아니오"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">노드 타입</span>
                <Badge variant="outline">{node.type}</Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2">
              <TrendingUp className="w-4 h-4" />
              분석
            </Button>
            <Button variant="destructive" size="sm" className="flex-1">
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
