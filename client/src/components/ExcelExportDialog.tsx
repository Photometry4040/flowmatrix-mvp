/**
 * Excel Export Dialog Component
 *
 * Features:
 * - Checkbox options for 4 export types
 * - Filename customization
 * - Preview button (shows which sheets will be exported)
 * - Export button with error handling
 * - Progress indicator for large workflows
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkflowProject } from '@/types/workflow';
import { exportWorkflowToExcel, type ExcelExportOptions } from '@/lib/excelExporter';

interface ExcelExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: WorkflowProject | null;
}

export default function ExcelExportDialog({
  isOpen,
  onOpenChange,
  project,
}: ExcelExportDialogProps) {
  const [options, setOptions] = useState<ExcelExportOptions>({
    includeNodeList: true,
    includeAdjacencyMatrix: true,
    includeLeadTimeReport: true,
    includeStatistics: true,
  });

  const [filename, setFilename] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Update filename when project changes
  const getDefaultFilename = (): string => {
    if (!project) return '';
    const timestamp = new Date().toISOString().split('T')[0];
    return `${project.name}_workflow_${timestamp}.xlsx`;
  };

  // Initialize filename on dialog open
  const handleOpenChange = (open: boolean) => {
    if (open && !filename) {
      setFilename(getDefaultFilename());
    }
    onOpenChange(open);
  };

  const toggleOption = (key: keyof ExcelExportOptions) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExport = async () => {
    if (!project) {
      toast.error('프로젝트 정보 없음', {
        description: '프로젝트를 먼저 로드해주세요.'
      });
      return;
    }

    // Validate at least one option is selected
    if (!Object.values(options).some(v => v)) {
      toast.error('내보낼 항목 선택 필요', {
        description: '최소 하나 이상의 항목을 선택해주세요.'
      });
      return;
    }

    // Validate filename
    if (!filename.trim()) {
      toast.error('파일명 입력 필요', {
        description: '파일명을 입력해주세요.'
      });
      return;
    }

    // Check file size warning
    const estimatedSize = estimateFileSize(project, options);
    if (estimatedSize > 10 * 1024 * 1024) {
      // 10MB
      toast.warning('큰 파일 크기', {
        description: `파일 크기가 약 ${(estimatedSize / 1024 / 1024).toFixed(1)}MB입니다. 내보내기에 시간이 걸릴 수 있습니다.`
      });
    }

    try {
      setIsExporting(true);

      // Add delay to show progress indicator
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform export
      exportWorkflowToExcel(project, options);

      toast.success('내보내기 완료', {
        description: `${filename}이(가) 다운로드되었습니다.`
      });

      // Close dialog
      handleOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('내보내기 실패', {
        description: message
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  // Estimate file size based on data
  const estimateFileSize = (
    project: WorkflowProject,
    opts: ExcelExportOptions
  ): number => {
    let size = 0;

    // Each sheet ~5KB base
    if (opts.includeNodeList) size += 5000 + project.nodes.length * 200;
    if (opts.includeAdjacencyMatrix) {
      size += 5000 + project.nodes.length * project.nodes.length * 2;
    }
    if (opts.includeLeadTimeReport) size += 8000 + project.nodes.length * 100;
    if (opts.includeStatistics) size += 6000 + project.nodes.length * 50;

    return size;
  };

  // Count selected sheets
  const selectedSheetCount = Object.values(options).filter(v => v).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>엑셀 내보내기</DialogTitle>
          <DialogDescription>
            워크플로우 데이터를 Excel 파일로 내보냅니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Name Section */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-semibold">
              파일명
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="파일명을 입력하세요"
              disabled={isExporting}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              .xlsx 확장자는 자동으로 추가됩니다.
            </p>
          </div>

          <Separator />

          {/* Export Options Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">내보낼 내용</Label>
            <div className="space-y-3 pl-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="node-list"
                  checked={options.includeNodeList}
                  onCheckedChange={() => toggleOption('includeNodeList')}
                  disabled={isExporting}
                />
                <Label
                  htmlFor="node-list"
                  className="font-normal cursor-pointer flex-1"
                >
                  노드 목록
                  <span className="text-xs text-muted-foreground ml-2">
                    12개 열: ID, 노드명, 타입, 부서, 단계, 소요시간, 담당자, 상태, 도구, 태그, AI스코어, 병목
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adjacency-matrix"
                  checked={options.includeAdjacencyMatrix}
                  onCheckedChange={() => toggleOption('includeAdjacencyMatrix')}
                  disabled={isExporting}
                />
                <Label
                  htmlFor="adjacency-matrix"
                  className="font-normal cursor-pointer flex-1"
                >
                  인접 행렬
                  <span className="text-xs text-muted-foreground ml-2">
                    노드 간 연결 관계 (N×N 이진 행렬)
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lead-time"
                  checked={options.includeLeadTimeReport}
                  onCheckedChange={() => toggleOption('includeLeadTimeReport')}
                  disabled={isExporting}
                />
                <Label
                  htmlFor="lead-time"
                  className="font-normal cursor-pointer flex-1"
                >
                  리드타임 분석
                  <span className="text-xs text-muted-foreground ml-2">
                    전체/단계별/부서별 리드타임 및 크리티컬 패스
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statistics"
                  checked={options.includeStatistics}
                  onCheckedChange={() => toggleOption('includeStatistics')}
                  disabled={isExporting}
                />
                <Label
                  htmlFor="statistics"
                  className="font-normal cursor-pointer flex-1"
                >
                  통계
                  <span className="text-xs text-muted-foreground ml-2">
                    노드 수, 완료률, 병목, AI 대체 가능, 분포 현황
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-muted/50 p-3 rounded-md border border-border space-y-2">
              <p className="text-sm font-semibold">내보낼 시트</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {options.includeNodeList && <li>노드 목록 ({project?.nodes.length || 0}개 노드)</li>}
                {options.includeAdjacencyMatrix && (
                  <li>인접 행렬 ({project?.nodes.length || 0} × {project?.nodes.length || 0})</li>
                )}
                {options.includeLeadTimeReport && <li>리드타임 분석</li>}
                {options.includeStatistics && <li>통계</li>}
              </ul>
              <p className="text-xs text-muted-foreground pt-2">
                총 {selectedSheetCount}개 시트가 포함됩니다.
              </p>
            </div>
          )}

          {/* Warning for no selection */}
          {selectedSheetCount === 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                내보낼 항목을 선택해주세요.
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isExporting && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>엑셀 파일을 생성 중입니다...</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="gap-2"
            disabled={isExporting || selectedSheetCount === 0}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? '미리보기 닫기' : '미리보기'}
          </Button>
          <Button
            onClick={handleExport}
            className="gap-2"
            disabled={
              isExporting ||
              selectedSheetCount === 0 ||
              !filename.trim() ||
              !project
            }
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                내보내기 중...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                엑셀로 내보내기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
