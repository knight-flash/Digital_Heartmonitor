import React, { useState, useRef, useEffect } from 'react';
import './ResizableSplitter.css';

const ResizableSplitter = ({ children, initialLeftWidth = 400 }) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const containerRef = useRef(null);

  // 监听窗口大小变化，保持聊天框占页面的40%
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = window.innerWidth * 0.4;
        setLeftWidth(newWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="resizable-container" ref={containerRef}>
      <div 
        className="left-panel" 
        style={{ width: `${leftWidth}px` }}
      >
        {children[0]}
      </div>
      
      <div className="right-panel">
        {children[1]}
      </div>
    </div>
  );
};

export default ResizableSplitter;
