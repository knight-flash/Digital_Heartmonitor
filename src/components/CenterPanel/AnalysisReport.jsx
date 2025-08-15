// src/components/CenterPanel/AnalysisReport.jsx (最终版)

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from '../../context/SessionContext';

function AnalysisReport() {
  const { state } = useSession();
  const { report, sessionStatus } = state;

  // 1. 定义一个专门的函数，根据状态返回需要渲染的具体内容
  const renderContent = () => {
    if (sessionStatus === 'generating_report') {
      // 直接返回 JSX 元素，而不是一个字符串
      return <p>AI分析报告正在生成中，请稍候...</p>;
    }

    if (sessionStatus === 'ready' && report) {
      return <ReactMarkdown>{report}</ReactMarkdown>;
    }

    // 默认情况下，不渲染任何内容
    return null;
  };

  // 2. 仅当状态不是'idle'时，才渲染整个报告组件的“外框”
  if (sessionStatus === 'idle') {
    return null;
  }

  return (
    <div className="center_bottom_box" style={{ width: '684px', height: '210px', display: 'flex', flexDirection: 'column' }}>
      <div className="right_title">
        <img src="/title.png" alt="" />
        智能心电分析报告
      </div>
      <div className="report-content" style={{ padding: '15px 20px', color: '#cceeff', fontSize: '16px', lineHeight: 1.9, overflowY: 'auto', flexGrow: 1 }}>
        {/* 3. 直接调用渲染函数 */}
        {renderContent()}
      </div>
    </div>
  );
}

export default AnalysisReport;