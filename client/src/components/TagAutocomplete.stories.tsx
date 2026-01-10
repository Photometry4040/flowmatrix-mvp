import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TagAutocomplete from './TagAutocomplete';

const meta = {
  title: 'Components/TagAutocomplete',
  component: TagAutocomplete,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagAutocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const allTags = [
  '#기획',
  '#디자인',
  '#개발',
  '#테스트',
  '#배포',
  '#마케팅',
  '#분석',
  '#문서화',
  '#리뷰',
  '#승인',
];

export const Empty: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([]);
    return (
      <TagAutocomplete
        selectedTags={tags}
        onTagsChange={setTags}
        allTags={allTags}
      />
    );
  },
};

export const WithSelectedTags: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>(['#기획', '#디자인']);
    return (
      <TagAutocomplete
        selectedTags={tags}
        onTagsChange={setTags}
        allTags={allTags}
      />
    );
  },
};

export const ManyTags: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([
      '#기획',
      '#디자인',
      '#개발',
      '#테스트',
      '#배포',
    ]);
    return (
      <TagAutocomplete
        selectedTags={tags}
        onTagsChange={setTags}
        allTags={allTags}
      />
    );
  },
};

export const LimitedSuggestions: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([]);
    const limitedTags = ['#기획', '#디자인', '#개발'];
    return (
      <TagAutocomplete
        selectedTags={tags}
        onTagsChange={setTags}
        allTags={limitedTags}
      />
    );
  },
};
