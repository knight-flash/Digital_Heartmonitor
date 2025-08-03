// src/App.js

import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import Header from './components/Header/Header';
import './index.css'; // 确保全局样式引入

function App() {
  // 1. 定义顶层状态
  const [appStatus, setAppStatus] = useState('waiting_for_upload'); // waiting_for_upload, loading, displaying_results
  const [analysisData, setAnalysisData] = useState(null); // 用于存储后端返回的所有数据

  // 2. 定义回调函数，用于子组件通知 App 数据已获取
  const handleAnalysisSuccess = (data) => {
    console.log("成功从后端获取数据:", data);
    setAnalysisData(data);
    setAppStatus('displaying_results');
  };
  
  const setIsLoading = (isLoading) => {
    if (isLoading) {
      setAppStatus('loading');
    }
  };

  return (
    <>
      <Header />
      {/* 3. 将状态和回调函数通过 props 传递给 MainLayout */}
      <MainLayout 
        appStatus={appStatus} 
        analysisData={analysisData}
        onUploadSuccess={handleAnalysisSuccess}
        setIsLoading={setIsLoading}
      />
    </>
  );
}

export default App;