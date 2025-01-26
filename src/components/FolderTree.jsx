import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const FileTreeItem = ({ item, onFileSelect, level = 0, isSelected, selectedFile }) => {
  console.log('Rendering FileTreeItem:', item);
  const [isExpanded, setIsExpanded] = useState(false);
  const paddingLeft = `${level * 20}px`;

  const handleItemClick = (e) => {
    e.stopPropagation();
    console.log('Item clicked:', item);
    if (item.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else if (item.isMarkdown) {
      console.log('Selecting file:', item.path);
      onFileSelect(item.path);
    }
  };

  return (
    <li style={{
      listStyle: 'none',
      margin: 0,
      padding: 0,
      backgroundColor: isSelected ? '#e2e8f0' : '#fff'
    }}>
      <div 
        onClick={handleItemClick}
        style={{ 
          cursor: 'pointer', 
          padding: '6px 8px',
          paddingLeft,
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
          backgroundColor: isSelected ? '#e2e8f0' : '#fff',
          borderBottom: '1px solid #edf2f7',
          '&:hover': {
            backgroundColor: '#f7fafc'
          }
        }}
      >
        <span style={{ marginRight: '8px', width: '20px', textAlign: 'center' }}>
          {item.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {item.name}
        </span>
      </div>
      {item.type === 'directory' && isExpanded && item.children && (
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          backgroundColor: '#fff'
        }}>
          {item.children.map((child) => (
            <FileTreeItem 
              key={child.path} 
              item={child} 
              onFileSelect={onFileSelect}
              level={level + 1}
              selectedFile={selectedFile}
              isSelected={child.path === selectedFile}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const FolderTree = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to get all markdown files in a flat array
  const getAllMarkdownFiles = (items) => {
    let markdownFiles = [];
    items.forEach(item => {
      if (item.type === 'file' && item.isMarkdown) {
        markdownFiles.push(item);
      } else if (item.type === 'directory' && item.children) {
        markdownFiles = [...markdownFiles, ...getAllMarkdownFiles(item.children)];
      }
    });
    return markdownFiles;
  };

  const handleFileSelect = (path) => {
    setSelectedFile(path);
    onFileSelect(path);
  };

  const handleNavigation = (direction) => {
    const markdownFiles = getAllMarkdownFiles(files);
    const currentIndex = markdownFiles.findIndex(file => file.path === selectedFile);
    
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : markdownFiles.length - 1;
    } else {
      newIndex = currentIndex < markdownFiles.length - 1 ? currentIndex + 1 : 0;
    }

    handleFileSelect(markdownFiles[newIndex].path);
  };

  useEffect(() => {
    const handleFolderSelected = (event, data) => {
      console.log('Folder selected:', data);
      setLoading(true);
      setCurrentFolder(data.path);
      setFiles(data.structure);
      setLoading(false);
    };

    ipcRenderer.on('folder-selected', handleFolderSelected);

    return () => {
      ipcRenderer.removeListener('folder-selected', handleFolderSelected);
    };
  }, []);

  console.log('FolderTree render:', { 
    currentFolder, 
    filesLength: files.length, 
    files,
    loading 
  });

  return (
    <div style={{
      height: '100%',
      width: '100%',
      backgroundColor: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid #cbd5e0',
        backgroundColor: '#e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h2 style={{ 
            margin: 0,
            color: '#2d3748',
            fontSize: '1.2em'
          }}>
            Documents
          </h2>
          {selectedFile && (
            <div style={{
              display: 'flex',
              gap: '4px'
            }}>
              <button
                onClick={() => handleNavigation('prev')}
                style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  backgroundColor: '#fff',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  flexShrink: 0
                }}
                title="Previous file"
              >
                ←
              </button>
              <button
                onClick={() => handleNavigation('next')}
                style={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  backgroundColor: '#fff',
                  border: '1px solid #cbd5e0',
                  borderRadius: '4px',
                  flexShrink: 0
                }}
                title="Next file"
              >
                →
              </button>
            </div>
          )}
        </div>
        {currentFolder && (
          <div style={{ 
            fontSize: '0.8em', 
            color: '#4a5568', 
            wordBreak: 'break-all',
            padding: '8px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            {currentFolder}
          </div>
        )}
      </div>

      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#fff',
        margin: '8px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0'
      }}>
        {loading ? (
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            color: '#4a5568'
          }}>
            Loading...
          </div>
        ) : files && files.length > 0 ? (
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            backgroundColor: '#fff'
          }}>
            {files.map((item) => {
              console.log('Rendering file item:', item);
              return (
                <FileTreeItem 
                  key={item.path} 
                  item={item} 
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  isSelected={item.path === selectedFile}
                />
              );
            })}
          </ul>
        ) : (
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            color: '#4a5568'
          }}>
            {currentFolder 
              ? 'No markdown files found in this folder' 
              : 'Select a folder from File → Open Folder'}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '8px', 
        borderTop: '1px solid #cbd5e0',
        fontSize: '0.8em',
        color: '#718096',
        backgroundColor: '#f7fafc'
      }}>
        Files loaded: {files.length}
      </div>
    </div>
  );
};

export default FolderTree; 