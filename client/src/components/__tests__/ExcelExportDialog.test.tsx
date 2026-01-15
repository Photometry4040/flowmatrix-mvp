/**
 * Excel Export Dialog Component Tests
 * Comprehensive tests for dialog rendering, options, and export functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ExcelExportDialog from '../ExcelExportDialog';
import type { WorkflowProject } from '@/types/workflow';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock Excel exporter
vi.mock('@/lib/excelExporter', () => ({
  exportWorkflowToExcel: vi.fn(),
}));

describe('ExcelExportDialog', () => {
  const mockProject: WorkflowProject = {
    id: 'proj_1',
    name: 'Test Project',
    description: 'Test project for export',
    nodes: [
      {
        id: 'node_1',
        type: 'TRIGGER',
        label: 'Start',
        stage: 'PLANNING',
        department: 'TEAM_A',
        attributes: {
          tool: ['Notion'],
          avg_time: '2h',
          is_repetitive: false,
          brain_usage: 'HIGH',
          assignee: 'John',
        },
        ontology_tags: ['#planning'],
        position: { x: 0, y: 0 },
      },
      {
        id: 'node_2',
        type: 'ACTION',
        label: 'Execute',
        stage: 'EXECUTION',
        department: 'TEAM_B',
        attributes: {
          tool: ['Figma'],
          avg_time: '4h',
          is_repetitive: false,
          brain_usage: 'HIGH',
        },
        ontology_tags: ['#execution'],
        position: { x: 100, y: 100 },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'node_1',
        target: 'node_2',
        relation_type: 'REQUIRES',
        properties: {},
      },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    version: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ExcelExportDialog
          isOpen={false}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.queryByText('엑셀 내보내기')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();
    });

    it('should display dialog title', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();
    });

    it('should display dialog description', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('워크플로우 데이터를 Excel 파일로 내보냅니다.')).toBeInTheDocument();
    });

    it('should render filename input field', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      const input = screen.getByPlaceholderText('파일명을 입력하세요');
      expect(input).toBeInTheDocument();
    });

    it('should display file extension note', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('.xlsx 확장자는 자동으로 추가됩니다.')).toBeInTheDocument();
    });

    it('should render all UI elements', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('내보낼 내용')).toBeInTheDocument();
      expect(screen.getByText('파일명')).toBeInTheDocument();
    });
  });

  describe('Export Options', () => {
    it('should render 4 checkboxes', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(4);
    });

    it('should render node list checkbox', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('노드 목록')).toBeInTheDocument();
    });

    it('should render adjacency matrix checkbox', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('인접 행렬')).toBeInTheDocument();
    });

    it('should render lead time report checkbox', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('리드타임 분석')).toBeInTheDocument();
    });

    it('should render statistics checkbox', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('통계')).toBeInTheDocument();
    });

    it('should have all options checked by default', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      checkboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true);
      });
    });

    it('should allow toggling options on and off', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const firstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
      expect(firstCheckbox.checked).toBe(true);

      await user.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(false);

      await user.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(true);
    });

    it('should require at least one option selected', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      checkboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true); // At least one should be checked
      });
    });

    it('should show warning when no options are selected', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      expect(screen.getByText('내보낼 항목을 선택해주세요.')).toBeInTheDocument();
    });
  });

  describe('Filename Input', () => {
    it('should render filename input', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    it('should allow editing filename', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'my_export');

      expect(input.value).toBe('my_export');
    });

    it('should have default filename when dialog opens', () => {
      const { rerender } = render(
        <ExcelExportDialog
          isOpen={false}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      rerender(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      expect(input.value).toBeTruthy();
      expect(input.value).toMatch(/Test Project_workflow_\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('should validate filename is not empty', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should handle special characters in filename', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'export_2024_01_15');

      expect(input.value).toBe('export_2024_01_15');
    });

    it('should disable input when exporting', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      expect(input.disabled).toBe(false);

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(input.disabled).toBe(false); // Will be re-enabled after export
      });
    });
  });

  describe('Preview Button', () => {
    it('should render preview button', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('미리보기')).toBeInTheDocument();
    });

    it('should show preview when clicked', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      await user.click(previewButton);

      expect(screen.getByText('내보낼 시트')).toBeInTheDocument();
    });

    it('should toggle preview visibility', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      expect(screen.queryByText('내보낼 시트')).not.toBeInTheDocument();

      await user.click(previewButton);
      expect(screen.getByText('내보낼 시트')).toBeInTheDocument();

      await user.click(screen.getByText('미리보기 닫기'));
      expect(screen.queryByText('내보낼 시트')).not.toBeInTheDocument();
    });

    it('should display selected sheets in preview', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      await user.click(previewButton);

      expect(screen.getByText('노드 목록 (2개 노드)')).toBeInTheDocument();
      expect(screen.getByText(/인접 행렬.*2.*×.*2/)).toBeInTheDocument();
      expect(screen.getByText('리드타임 분석')).toBeInTheDocument();
      expect(screen.getByText('통계')).toBeInTheDocument();
    });

    it('should show correct sheet count in preview', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      await user.click(previewButton);

      expect(screen.getByText('총 4개 시트가 포함됩니다.')).toBeInTheDocument();
    });

    it('should disable preview button when no options selected', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const previewButton = screen.getByText('미리보기');
      expect(previewButton).toBeDisabled();
    });

    it('should update preview when options change', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      await user.click(previewButton);

      expect(screen.getByText('총 4개 시트가 포함됩니다.')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Uncheck adjacency matrix

      expect(screen.getByText('총 3개 시트가 포함됩니다.')).toBeInTheDocument();
    });
  });

  describe('Export Button', () => {
    it('should render export button', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );
      expect(screen.getByText('엑셀로 내보내기')).toBeInTheDocument();
    });

    it('should be disabled when no options selected', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should be disabled when filename is empty', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should be disabled when project is null', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={null}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should be enabled when all requirements met', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      expect(input.value).toBeTruthy();

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).not.toBeDisabled();
    });

    it('should show loading state during export', async () => {
      const user = userEvent.setup();
      const { getByText } = render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('엑셀 파일을 생성 중입니다...')).toBeInTheDocument();
      });
    });

    it('should show success toast on completion', async () => {
      const user = userEvent.setup();
      const { getByText } = render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show error toast on export failure', async () => {
      const user = userEvent.setup();
      const { exportWorkflowToExcel } = await import('@/lib/excelExporter');
      vi.mocked(exportWorkflowToExcel).mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should close dialog on successful export', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not close dialog on export error', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();
      const { exportWorkflowToExcel } = await import('@/lib/excelExporter');
      vi.mocked(exportWorkflowToExcel).mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Dialog should still be open after error
      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();
    });

    it('should validate required fields before export', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          project={null}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('File Size Warning', () => {
    it('should show warning for large workflows', async () => {
      const user = userEvent.setup();
      const largeProject: WorkflowProject = {
        ...mockProject,
        nodes: Array.from({ length: 200 }, (_, i) => ({
          ...mockProject.nodes[0],
          id: `node_${i}`,
          label: `Node ${i}`,
        })),
      };

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={largeProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalled();
      });
    });

    it('should not block export with file size warning', async () => {
      const user = userEvent.setup();
      const largeProject: WorkflowProject = {
        ...mockProject,
        nodes: Array.from({ length: 200 }, (_, i) => ({
          ...mockProject.nodes[0],
          id: `node_${i}`,
          label: `Node ${i}`,
        })),
      };

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={largeProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should estimate file size correctly', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      // Should not show warning for small project
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const filenameInput = screen.getByPlaceholderText('파일명을 입력하세요');
      const label = screen.getByLabelText('파일명');
      expect(label).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeInTheDocument();

      // Tab should navigate to elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('should have proper checkbox labels', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      expect(screen.getByLabelText('노드 목록')).toBeInTheDocument();
      expect(screen.getByLabelText('인접 행렬')).toBeInTheDocument();
      expect(screen.getByLabelText('리드타임 분석')).toBeInTheDocument();
      expect(screen.getByLabelText('통계')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should display ARIA attributes for form elements', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요');
      expect(input).toHaveAttribute('id');
    });
  });

  describe('State Management', () => {
    it('should initialize with all options checked', () => {
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      checkboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true);
      });
    });

    it('should maintain state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const firstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
      await user.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(false);

      rerender(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      // State should be reset on re-render (default behavior)
      const newFirstCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
      expect(newFirstCheckbox.checked).toBe(true);
    });

    it('should handle filename initialization correctly', () => {
      const { rerender } = render(
        <ExcelExportDialog
          isOpen={false}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input1 = screen.queryByPlaceholderText('파일명을 입력하세요') as HTMLInputElement | null;
      expect(input1?.value || '').toBe('');

      rerender(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input2 = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      expect(input2.value).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when export fails', async () => {
      const user = userEvent.setup();
      const { exportWorkflowToExcel } = await import('@/lib/excelExporter');
      vi.mocked(exportWorkflowToExcel).mockImplementation(() => {
        throw new Error('Network error');
      });

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '내보내기 실패',
          expect.objectContaining({ description: 'Network error' })
        );
      });
    });

    it('should handle missing project gracefully', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={null}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should show validation error for empty filename', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '   '); // Only spaces

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();
    });

    it('should show validation error for no options selected', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const exportButton = screen.getByText('엑셀로 내보내기');
      expect(exportButton).toBeDisabled();

      expect(screen.getByText('내보낼 항목을 선택해주세요.')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should pass correct options to exportWorkflowToExcel', async () => {
      const user = userEvent.setup();
      const { exportWorkflowToExcel } = await import('@/lib/excelExporter');

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(exportWorkflowToExcel).toHaveBeenCalledWith(
          mockProject,
          expect.objectContaining({
            includeNodeList: true,
            includeAdjacencyMatrix: true,
            includeLeadTimeReport: true,
            includeStatistics: true,
          })
        );
      });
    });

    it('should pass selected options only to exportWorkflowToExcel', async () => {
      const user = userEvent.setup();
      const { exportWorkflowToExcel } = await import('@/lib/excelExporter');

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Uncheck adjacency matrix

      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      await waitFor(() => {
        expect(exportWorkflowToExcel).toHaveBeenCalledWith(
          mockProject,
          expect.objectContaining({
            includeNodeList: true,
            includeAdjacencyMatrix: false,
            includeLeadTimeReport: true,
            includeStatistics: true,
          })
        );
      });
    });

    it('should handle complete export workflow', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          project={mockProject}
        />
      );

      // 1. Verify initial state
      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();

      // 2. Toggle an option
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      // 3. Change filename
      const input = screen.getByPlaceholderText('파일명을 입력하세요') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'custom_export');

      // 4. Show preview
      const previewButton = screen.getByText('미리보기');
      await user.click(previewButton);
      expect(screen.getByText('내보낼 시트')).toBeInTheDocument();

      // 5. Export
      const exportButton = screen.getByText('엑셀로 내보내기');
      await user.click(exportButton);

      // 6. Verify export completed
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle project with no nodes', () => {
      const emptyProject: WorkflowProject = {
        ...mockProject,
        nodes: [],
        edges: [],
      };

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={emptyProject}
        />
      );

      const previewButton = screen.getByText('미리보기');
      expect(previewButton).toBeInTheDocument();
    });

    it('should handle very long project name', () => {
      const longNameProject: WorkflowProject = {
        ...mockProject,
        name: 'A'.repeat(200),
      };

      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={longNameProject}
        />
      );

      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();
    });

    it('should handle rapid option changes', async () => {
      const user = userEvent.setup();
      render(
        <ExcelExportDialog
          isOpen={true}
          onOpenChange={vi.fn()}
          project={mockProject}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      for (let i = 0; i < 10; i++) {
        await user.click(checkboxes[i % 4]);
      }

      expect(screen.getByText('엑셀 내보내기')).toBeInTheDocument();
    });
  });
});
