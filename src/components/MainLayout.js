import React, { useEffect, useState } from 'react';
import ResizableSplitter from './ResizableSplitter';
import Header from './Header';
import ChatBox from './ChatBox';
import PageOne from './PageOne';
import PageTwo from './PageTwo';
import UploadPage from './UploadPage';
import { useSession } from '../utils/SessionContext';
import './MainLayout.css';

const MainLayout = () => {
  const [activePage, setActivePage] = useState('upload');
  const [hasUploaded, setHasUploaded] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { state } = useSession();
  const { sessionStatus } = state || {};

  // 当进入报告生成阶段时，自动切换到页面二
  useEffect(() => {
    if (sessionStatus === 'ready') {
      setActivePage('page2');
    }
  }, [sessionStatus]);

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'page1':
        return <PageOne analysisResult={analysisResult} />;
      case 'page2':
        return <PageTwo />;
      case 'upload':
        return (
          <UploadPage
            onAllUploaded={() => {
              if (!hasUploaded) setHasUploaded(true);
              setActivePage('page1');
            }}
            onAnalyzed={({ sessionId, initialAnalysis, waveform }) => {
              setAnalysisResult({ sessionId, initialAnalysis, waveform });
            }}
          />
        );
      default:
        return <PageOne />;
    }
  };

  return (
    <div className="main-app">
      <Header />
      <ResizableSplitter initialLeftWidth={window.innerWidth * 0.4}>
        {/* 左侧聊天框 */}
        <ChatBox />
        
        {/* 右侧页面区域 */}
        <div className="right-panel">
          {/* 页面切换标签 */}
          <div className="page-tabs">
            <div 
              className={`tab ${activePage === 'upload' ? 'active' : ''}`}
              onClick={() => handlePageChange('upload')}
            >
              上传文件
            </div>
            {hasUploaded && (
              <>
                <div 
                  className={`tab ${activePage === 'page1' ? 'active' : ''}`}
                  onClick={() => handlePageChange('page1')}
                >
                  心电指标
                </div>
                <div 
                  className={`tab ${activePage === 'page2' ? 'active' : ''}`}
                  onClick={() => handlePageChange('page2')}
                >
                  心电报告
                </div>
              </>
            )}
          </div>
          
          {/* 页面内容 */}
          <div className="page-container">
            {renderPage()}
          </div>
        </div>
      </ResizableSplitter>
    </div>
  );
};

export default MainLayout;
