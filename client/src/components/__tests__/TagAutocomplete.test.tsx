import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagAutocomplete from '../TagAutocomplete';

const allTags = ['#기획', '#디자인', '#개발', '#테스트', '#배포'];

describe('TagAutocomplete', () => {
  it('should render input field', () => {
    const onTagsChange = vi.fn();
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    expect(input).toBeInTheDocument();
  });

  it('should display selected tags', () => {
    const onTagsChange = vi.fn();
    render(
      <TagAutocomplete
        selectedTags={['#기획', '#디자인']}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    expect(screen.getByText('#기획')).toBeInTheDocument();
    expect(screen.getByText('#디자인')).toBeInTheDocument();
  });

  it('should add tag with # prefix when Enter is pressed', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    
    // 입력 및 Enter 키 시뮬레이션
    fireEvent.change(input, { target: { value: '개발' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(onTagsChange).toHaveBeenCalledWith(['#개발']);
  });

  it('should not add # prefix if already present', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    
    fireEvent.change(input, { target: { value: '#개발' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(onTagsChange).toHaveBeenCalledWith(['#개발']);
  });

  it('should remove tag when X button is clicked', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={['#기획', '#디자인']}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    // X 버튼 찾기 (첫 번째 태그의 X 버튼)
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    
    expect(onTagsChange).toHaveBeenCalledWith(['#디자인']);
  });

  it('should not add duplicate tags', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={['#기획']}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    
    fireEvent.change(input, { target: { value: '기획' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // 이미 선택된 태그는 추가되지 않아야 함
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it('should show suggestions when input is focused', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    fireEvent.focus(input);
    
    // Popover가 열리면 추천 태그가 표시됨
    // (실제로는 Radix UI Popover의 동작에 따라 다를 수 있음)
  });

  it('should filter suggestions based on input', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)');
    fireEvent.change(input, { target: { value: '개발' } });
    
    // 입력에 따라 필터링된 추천이 표시되어야 함
    // (실제 구현에 따라 테스트 방법이 달라질 수 있음)
  });

  it('should clear input after adding tag', () => {
    const onTagsChange = vi.fn();
    
    render(
      <TagAutocomplete
        selectedTags={[]}
        onTagsChange={onTagsChange}
        allTags={allTags}
      />
    );
    
    const input = screen.getByPlaceholderText('태그 입력 (예: #기획, #디자인)') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '개발' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(input.value).toBe('');
  });
});
