import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const FileTreeItem = ({ item, onFileSelect, level = 0 }) => {
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
      backgroundColor: '#fff'
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
          backgroundColor: '#fff',
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

  useEffect(() => {
    console.log('FolderTree: Setting up event listener');
    const handleFolderSelected = (event, { path, structure }) => {
      console.log('Received folder-selected event:', { path, structure });
      setCurrentFolder(path);
      setLoading(true);
      try {
        console.log('Setting files with structure:', structure);
        // Force a new array reference to ensure React detects the change
        setFiles([...structure]);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setLoading(false);
      }
    };

    ipcRenderer.on('folder-selected', handleFolderSelected);

    return () => {
      console.log('FolderTree: Cleaning up event listener');
      ipcRenderer.removeListener('folder-selected', handleFolderSelected);
    };
  }, []);

  console.log('FolderTree render:', { 
    currentFolder, 
    filesLength: files.length, 
    files,
    loading 
  });

  // Debug render
  return (
    <div style={{
      height: '100%',
      width: '100%',
      backgroundColor: '#f0f4f8',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      overflow: 'hidden', // Ensure border radius works with child elements
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid #cbd5e0',
        backgroundColor: '#e2e8f0'
      }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#2d3748',
          fontSize: '1.2em'
        }}>
          Documents
        </h2>
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
                  onFileSelect={onFileSelect}
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