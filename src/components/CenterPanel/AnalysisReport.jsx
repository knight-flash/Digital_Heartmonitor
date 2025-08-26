// src/components/CenterPanel/AnalysisReport.jsx (修改后 - 适应容器)

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from '../../context/SessionContext';

function AnalysisReport() {
  const { state } = useSession();
  const { report, sessionStatus } = state;

  // 定义一个专门的函数，根据状态返回需要渲染的具体内容
  const renderContent = () => {
    if (sessionStatus === 'generating_report') {
      return <p>AI分析报告正在生成中，请稍候...</p>;
    }

    if (sessionStatus === 'ready' && report) {
      return <ReactMarkdown>{report}</ReactMarkdown>;
    }

    return null;
  };

  // 仅当状态不是'idle'时，才渲染整个报告组件
  if (sessionStatus === 'idle') {
    return null;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#0b1c2c',
      borderRadius: '10px',
      padding: '15px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        color: '#fff', 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '15px',
        textAlign: 'center'
      }}>
        智能心电分析报告
      </div>
      <div style={{ 
        padding: '10px', 
        color: '#cceeff', 
        fontSize: '14px', 
        lineHeight: 1.6, 
        overflowY: 'auto', 
        flexGrow: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '5px'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default AnalysisReport;