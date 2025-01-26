import React, { useState } from 'react';
import FolderTree from './FolderTree';
import MarkdownViewer from './MarkdownViewer';

const Layout = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <div style={{ 
        width: '300px',
        height: '100%',
        borderRight: '1px solid #cbd5e0',
        overflow: 'hidden',
        
      }}>
        <FolderTree onFileSelect={setSelectedFile} />
      </div>
      <div style={{ 
        flex: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        <MarkdownViewer file={selectedFile} />
      </div>
    </div>
  );
};

export default Layout; 