import type { Meta, StoryObj } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';
import WorkflowNode from './WorkflowNode';
import type { ActivityNode } from '@/types/workflow';

const meta = {
  title: 'Components/WorkflowNode',
  component: WorkflowNode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <div style={{ width: '300px', height: '200px' }}>
          <Story />
        </div>
      </ReactFlowProvider>
    ),
  ],
} satisfies Meta<typeof WorkflowNode>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseNode: ActivityNode = {
  id: 'story-1',
  type: 'ACTION',
  label: '디자인 시안 작성',
  stage: 'PLANNING',
  department: 'DESIGN_TEAM',
  attributes: {
    tool: ['Figma', 'Adobe XD'],
    avg_time: '2h',
    is_repetitive: false,
    brain_usage: 'MEDIUM',
    assignee: '김디자이너',
  },
  ontology_tags: ['#디자인', '#기획'],
  position: { x: 0, y: 0 },
};

export const TriggerNode: Story = {
  args: {
    data: {
      ...baseNode,
      type: 'TRIGGER',
      label: '프로젝트 기획 시작',
      attributes: {
        ...baseNode.attributes,
        brain_usage: 'HIGH',
      },
    },
  },
};

export const ActionNode: Story = {
  args: {
    data: baseNode,
  },
};

export const DecisionNode: Story = {
  args: {
    data: {
      ...baseNode,
      type: 'DECISION',
      label: '품질 검수',
      attributes: {
        ...baseNode.attributes,
        tool: ['Jira', 'TestRail'],
        brain_usage: 'HIGH',
      },
    },
  },
};

export const ArtifactNode: Story = {
  args: {
    data: {
      ...baseNode,
      type: 'ARTIFACT',
      label: '최종 보고서',
      attributes: {
        ...baseNode.attributes,
        tool: ['Google Docs', 'Notion'],
        avg_time: '1.5h',
        brain_usage: 'LOW',
      },
    },
  },
};

export const BottleneckNode: Story = {
  args: {
    data: {
      ...baseNode,
      label: 'PCB 발주 (병목)',
      attributes: {
        ...baseNode.attributes,
        tool: ['SAP', 'Excel'],
        avg_time: '30m',
        brain_usage: 'LOW',
      },
      isBottleneck: true,
    },
  },
};

export const AIReplaceableNode: Story = {
  args: {
    data: {
      ...baseNode,
      label: '데이터 입력 작업',
      attributes: {
        ...baseNode.attributes,
        tool: ['Excel'],
        avg_time: '45m',
        is_repetitive: true,
        brain_usage: 'LOW',
      },
      aiScore: 85,
    },
  },
};

export const BottleneckWithAI: Story = {
  args: {
    data: {
      ...baseNode,
      label: '반복 데이터 처리',
      attributes: {
        ...baseNode.attributes,
        tool: ['Excel', 'Python'],
        avg_time: '1h',
        is_repetitive: true,
        brain_usage: 'LOW',
      },
      isBottleneck: true,
      aiScore: 92,
    },
  },
};

export const RepetitiveTask: Story = {
  args: {
    data: {
      ...baseNode,
      label: '주간 보고서 작성',
      attributes: {
        ...baseNode.attributes,
        tool: ['PowerPoint'],
        avg_time: '30m',
        is_repetitive: true,
        brain_usage: 'LOW',
      },
    },
  },
};
