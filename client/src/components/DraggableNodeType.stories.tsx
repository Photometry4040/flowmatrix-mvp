import type { Meta, StoryObj } from '@storybook/react';
import DraggableNodeType from './DraggableNodeType';
import { Play, Zap, GitBranch, FileText } from 'lucide-react';

const meta = {
  title: 'Components/DraggableNodeType',
  component: DraggableNodeType,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '250px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DraggableNodeType>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Trigger: Story = {
  args: {
    type: 'TRIGGER',
    label: 'Trigger (시작)',
    icon: Play,
    colorClass: 'border-success text-success',
  },
};

export const Action: Story = {
  args: {
    type: 'ACTION',
    label: 'Action (행동)',
    icon: Zap,
    colorClass: 'border-primary text-primary',
  },
};

export const Decision: Story = {
  args: {
    type: 'DECISION',
    label: 'Decision (판단)',
    icon: GitBranch,
    colorClass: 'border-accent text-accent',
  },
};

export const Artifact: Story = {
  args: {
    type: 'ARTIFACT',
    label: 'Artifact (산출물)',
    icon: FileText,
    colorClass: 'border-chart-4 text-chart-4',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-2">
      <DraggableNodeType
        type="TRIGGER"
        label="Trigger (시작)"
        icon={Play}
        colorClass="border-success text-success"
      />
      <DraggableNodeType
        type="ACTION"
        label="Action (행동)"
        icon={Zap}
        colorClass="border-primary text-primary"
      />
      <DraggableNodeType
        type="DECISION"
        label="Decision (판단)"
        icon={GitBranch}
        colorClass="border-accent text-accent"
      />
      <DraggableNodeType
        type="ARTIFACT"
        label="Artifact (산출물)"
        icon={FileText}
        colorClass="border-chart-4 text-chart-4"
      />
    </div>
  ),
};
