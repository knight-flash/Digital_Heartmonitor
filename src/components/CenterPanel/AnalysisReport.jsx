// src/components/CenterPanel/AnalysisReport.jsx

import React from 'react';
import ReactMarkdown from 'react-markdown'; // 1. 引入Markdown渲染组件

// 组件现在接收一个名为 content 的 prop
function AnalysisReport({ content }) {
  return (
    <div className="center_bottom_box" style={{ width: '684px', height: '210px', display: 'flex', flexDirection: 'column' }}>
      <div className="right_title">
        <img src="./static/title.png" alt="" />
        智能心电分析报告
      </div>
      <div className="report-content" style={{ padding: '15px 20px', color: '#cceeff', fontSize: '16px', lineHeight: 1.9, overflowY: 'auto', flexGrow: 1 }}>
        {/* 2. 使用 ReactMarkdown 来渲染AI返回的内容 */}
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default AnalysisReport;