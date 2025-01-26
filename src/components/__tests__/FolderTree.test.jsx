// Mock window.require before any imports
const mockIpcRenderer = {
  send: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn()
};

window.require = jest.fn((module) => {
  if (module === 'electron') {
    return { ipcRenderer: mockIpcRenderer };
  }
  throw new Error(`Unexpected module: ${module}`);
});

// Now import the component and other dependencies
import React, {act} from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FolderTree from '../FolderTree';

describe('FolderTree Component', () => {
  let storedCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIpcRenderer.on.mockImplementation((event, callback) => {
      storedCallback = callback;
      return mockIpcRenderer;
    });
  });

  afterEach(() => {
    storedCallback = null;
  });

  // Positive test cases
  test('renders initial state correctly', () => {
    render(<FolderTree />);
    
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Select a folder from File → Open Folder')).toBeInTheDocument();
    expect(screen.getByText('Files loaded: 0')).toBeInTheDocument();
  });

  test('handles folder selection', async () => {
    render(<FolderTree />);

    expect(mockIpcRenderer.on).toHaveBeenCalledWith('folder-selected', expect.any(Function));

    const mockStructure = [
      { 
        name: 'test.md', 
        type: 'file', 
        path: '/test.md',
        isMarkdown: true 
      },
      { 
        name: 'folder', 
        type: 'directory', 
        path: '/folder',
        children: [] 
      }
    ];

    await act(async () => {
      storedCallback({}, { path: '/test', structure: mockStructure });
    });

    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
      expect(screen.getByText('folder')).toBeInTheDocument();
    });
  });

  test('handles empty folder', async () => {
    render(<FolderTree />);

    expect(mockIpcRenderer.on).toHaveBeenCalledWith('folder-selected', expect.any(Function));

    await act(async () => {
      storedCallback({}, { path: '/test', structure: [] });
    });

    await waitFor(() => {
      expect(screen.getByText('No markdown files found in this folder')).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    render(<FolderTree />);

    expect(mockIpcRenderer.on).toHaveBeenCalledWith('folder-selected', expect.any(Function));

    let loadingShown = false;
    await act(async () => {
      storedCallback({}, { path: '/test', structure: [] });
      loadingShown = screen.queryByText('Loading...') !== null;
    });

    expect(loadingShown).toBe(true);
  });

  test('displays current folder path', async () => {
    render(<FolderTree />);

    expect(mockIpcRenderer.on).toHaveBeenCalledWith('folder-selected', expect.any(Function));

    const testPath = '/test/folder/path';
    await act(async () => {
      storedCallback({}, { path: testPath, structure: [] });
    });

    await waitFor(() => {
      expect(screen.getByText(testPath)).toBeInTheDocument();
    });
  });

  test('handles file navigation', async () => {
    const onFileSelect = jest.fn();
    render(<FolderTree onFileSelect={onFileSelect} />);

    expect(mockIpcRenderer.on).toHaveBeenCalledWith('folder-selected', expect.any(Function));

    const mockStructure = [
      { 
        name: 'test1.md', 
        type: 'file', 
        path: '/test1.md',
        isMarkdown: true 
      },
      { 
        name: 'test2.md', 
        type: 'file', 
        path: '/test2.md',
        isMarkdown: true 
      }
    ];

    // Load files
    await act(async () => {
      storedCallback({}, { path: '/test', structure: mockStructure });
    });

    // Select first file
    await act(async () => {
      fireEvent.click(screen.getByText('test1.md'));
    });

    expect(onFileSelect).toHaveBeenCalledWith('/test1.md');

    // Navigate to next file
    await act(async () => {
      fireEvent.click(screen.getByTitle('Next file'));
    });

    expect(onFileSelect).toHaveBeenCalledWith('/test2.md');

    // Navigate to previous file
    await act(async () => {
      fireEvent.click(screen.getByTitle('Previous file'));
    });

    expect(onFileSelect).toHaveBeenCalledWith('/test1.md');
  });

  test('handles nested file navigation', async () => {
    const onFileSelect = jest.fn();
    render(<FolderTree onFileSelect={onFileSelect} />);

    const mockStructure = [
      { 
        name: 'folder1',
        type: 'directory',
        path: '/folder1',
        children: [
          {
            name: 'test1.md',
            type: 'file',
            path: '/folder1/test1.md',
            isMarkdown: true
          }
        ]
      },
      { 
        name: 'test2.md',
        type: 'file',
        path: '/test2.md',
        isMarkdown: true
      }
    ];

    // Load files
    await act(async () => {
      storedCallback({}, { path: '/test', structure: mockStructure });
    });

    // Expand the folder
    await act(async () => {
      fireEvent.click(screen.getByText('folder1'));
    });

    // Select nested file
    await act(async () => {
      fireEvent.click(screen.getByText('test1.md'));
    });

    expect(onFileSelect).toHaveBeenCalledWith('/folder1/test1.md');

    // Navigate to next file (should go to test2.md)
    await act(async () => {
      fireEvent.click(screen.getByTitle('Next file'));
    });

    expect(onFileSelect).toHaveBeenCalledWith('/test2.md');
  });

  test('renders and handles breadcrumb navigation', async () => {
    render(<FolderTree />);

    const mockStructure = [
      { 
        name: 'test.md', 
        type: 'file', 
        path: '/folder1/subfolder/test.md',
        isMarkdown: true 
      }
    ];

    // Load files with a nested path
    await act(async () => {
      storedCallback({}, { 
        path: '/folder1/subfolder', 
        structure: mockStructure 
      });
    });

    // Check if breadcrumb segments are rendered
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('subfolder')).toBeInTheDocument();

    // Click on a breadcrumb segment
    await act(async () => {
      fireEvent.click(screen.getByText('folder1'));
    });

    // Verify that the IPC message was sent
    expect(mockIpcRenderer.send).toHaveBeenCalledWith('open-folder', '/folder1');

    // Click on root
    await act(async () => {
      fireEvent.click(screen.getByText('/'));
    });

    expect(mockIpcRenderer.send).toHaveBeenCalledWith('open-folder', '/');
  });

  test('renders file breadcrumb navigation', async () => {
    const onFileSelect = jest.fn();
    render(<FolderTree onFileSelect={onFileSelect} />);

    const mockStructure = [
      { 
        name: 'test.md', 
        type: 'file', 
        path: '/docs/folder1/test.md',
        isMarkdown: true 
      }
    ];

    // Load files
    await act(async () => {
      storedCallback({}, { path: '/docs', structure: mockStructure });
    });

    // Select the file
    await act(async () => {
      fireEvent.click(screen.getByText('test.md'));
    });

    // Check if breadcrumb segments are rendered
    expect(screen.getByText('docs')).toBeInTheDocument();
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('test.md')).toBeInTheDocument();

    // Click on a breadcrumb segment
    await act(async () => {
      fireEvent.click(screen.getByText('folder1'));
    });

    // Verify that the IPC message was sent
    expect(mockIpcRenderer.send).toHaveBeenCalledWith('open-folder', '/docs/folder1');
  });
}); 