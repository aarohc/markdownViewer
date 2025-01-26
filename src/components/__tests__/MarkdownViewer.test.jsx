import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownViewer from '../MarkdownViewer';

// Mock the dependencies that use ESM
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

jest.mock('remark-gfm', () => {
  return function mockRemarkGfm() {
    return {};
  };
});

jest.mock('rehype-raw', () => {
  return function mockRehypeRaw() {
    return {};
  };
});

jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn()
}));

describe('MarkdownViewer Component', () => {
  // Positive test cases
  test('renders markdown content correctly', () => {
    const markdown = '# Hello\n## World\n- List item';
    render(<MarkdownViewer content={markdown} selectedFile="test.md" />);
    expect(screen.getByTestId('markdown-content')).toHaveTextContent(markdown);
  });

  test('renders code blocks with syntax highlighting', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    render(<MarkdownViewer content={markdown} selectedFile="test.md" />);
    expect(screen.getByTestId('markdown-content')).toHaveTextContent('const x = 1;');
  });

  // Negative test cases
  test('handles empty content gracefully', () => {
    render(<MarkdownViewer content="" selectedFile="test.md" />);
    expect(screen.getByTestId('markdown-content')).toBeEmptyDOMElement();
  });

  test('handles null content', () => {
    render(<MarkdownViewer content={null} selectedFile="test.md" />);
    expect(screen.getByTestId('markdown-content')).toBeEmptyDOMElement();
  });

  test('shows no file selected message', () => {
    render(<MarkdownViewer content={null} selectedFile={null} />);
    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.getByText('Select a markdown file from the sidebar to view its content')).toBeInTheDocument();
  });
}); 