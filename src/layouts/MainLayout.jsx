// src/layouts/MainLayout.jsx

import React from 'react';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import CenterPanel from '../components/CenterPanel/CenterPanel';
import RightPanel from '../components/RightPanel/RightPanel';

function MainLayout({ appStatus, analysisData, onUploadSuccess, setIsLoading }) {
  return (
    <div className="main">
      <ChatPanel analysisData={analysisData} />
      <CenterPanel 
        appStatus={appStatus} 
        onUploadSuccess={onUploadSuccess}
        setIsLoading={setIsLoading}
        // 1. 将分析数据也传递给 CenterPanel 用于报告
        analysisData={analysisData} 
      />
      {/* 2. 将分析数据传递给 RightPanel 用于图表 */}
      <RightPanel analysisData={analysisData} /> 
    </div>
  );
}

export default MainLayout;