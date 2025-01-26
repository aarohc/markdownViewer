import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import { Marp } from '@marp-team/marp-core';
const { ipcRenderer } = window.require('electron');

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

// Initialize Marp
const marp = new Marp({
  container: false,
  markdown: {
    breaks: true,
  },
  options: {
    looseYAML: false,
    markdown: true,
  },
});

const MermaidDiagram = ({ content }) => {
  const [svg, setSvg] = useState('');
  
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-diagram-' + Math.random(), content);
        setSvg(svg);
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error);
      }
    };
    
    renderDiagram();
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};

const MarkdownViewer = ({ file }) => {
  const [content, setContent] = useState('');
  const [isMarpFile, setIsMarpFile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const loadContent = async () => {
      if (!file) {
        setContent('');
        setSlides([]);
        return;
      }

      try {
        const content = await ipcRenderer.invoke('read-file', file);
        setContent(content);

        // Check if it's a Marp file by looking for Marp front matter
        const isMarp = content.includes('marp: true') || 
                      file.toLowerCase().endsWith('.marp.md');
        setIsMarpFile(isMarp);

        if (isMarp) {
          const { html, css } = marp.render(content);
          // Split HTML into slides
          const slideElements = html.split('<section');
          const processedSlides = slideElements
            .filter(slide => slide.trim())
            .map(slide => '<section' + slide);
          setSlides(processedSlides);
          
          // Inject Marp styles
          const styleElement = document.createElement('style');
          styleElement.innerHTML = css;
          document.head.appendChild(styleElement);
          
          return () => {
            document.head.removeChild(styleElement);
          };
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setContent('Error loading content');
      }
    };

    loadContent();
  }, [file]);

  const handleKeyDown = (e) => {
    if (isMarpFile) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMarpFile, slides.length]);

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (language === 'mermaid') {
        return <MermaidDiagram content={String(children)} />;
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  if (!file) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        color: '#4a5568',
        fontSize: '1.2em',
        textAlign: 'center',
        padding: '20px',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        margin: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ 
            fontSize: '3em', 
            marginBottom: '20px',
            color: '#cbd5e0'
          }}>
            📄
          </div>
          <div>No file selected</div>
          <div style={{ 
            fontSize: '0.8em',
            color: '#718096',
            marginTop: '10px'
          }}>
            Select a markdown file from the sidebar to view its content
          </div>
        </div>
      </div>
    );
  }

  if (isMarpFile) {
    return (
      <div className="marp-viewer" style={{
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        margin: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f7fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '0.9em',
            color: '#4a5568'
          }}>
            {file.split('/').pop()} (Slide {currentSlide + 1} of {slides.length})
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              style={{
                padding: '4px 8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: currentSlide === 0 ? '#f7fafc' : '#fff'
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
              disabled={currentSlide === slides.length - 1}
              style={{
                padding: '4px 8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: currentSlide === slides.length - 1 ? '#f7fafc' : '#fff'
              }}
            >
              Next
            </button>
          </div>
        </div>
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div 
            dangerouslySetInnerHTML={{ __html: slides[currentSlide] || '' }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="markdown-viewer" style={{
      height: '100%',
      backgroundColor: '#fff',
      border: '1px solid #cbd5e0',
      borderRadius: '4px',
      margin: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{
          fontSize: '0.9em',
          color: '#4a5568',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {file.split('/').pop()} {/* Show just the filename */}
        </div>
      </div>
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto'
      }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
          className="markdown-content"
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownViewer; 