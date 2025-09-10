import React, { useEffect, useRef, useState } from 'react';
import {useSession} from "../utils/SessionContext";
import ReactMarkdown from 'react-markdown';

const PageTwo = () => {

    const { state } = useSession();
    const { report, sessionStatus } = state;

    // 滚动进度相关 Hook（必须在任何 return 之前声明，避免条件调用）
    const contentRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isOverflow, setIsOverflow] = useState(false);

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
    const isIdle = sessionStatus === 'idle';

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) {
      setScrollProgress(0);
      setIsOverflow(false);
      return;
    }
    setIsOverflow(true);
    const pct = Math.min(100, Math.max(0, (el.scrollTop / max) * 100));
    setScrollProgress(pct);
  };

  useEffect(() => {
    // 初次渲染和报告变化后检测是否溢出
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      const max = el.scrollHeight - el.clientHeight;
      setIsOverflow(max > 0);
      handleScroll();
    };
    check();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(check);
      ro.observe(el);
    }
    return () => ro && ro.disconnect();
  }, [report, sessionStatus]);

  if (isIdle) {
    return null;
  }

  return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        padding: '15px',
        boxSizing: 'border-box',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        {/* 顶部进度条已移除 */}
        <div style={{
          color: '#111827',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          智能心电分析报告
        </div>
        <div style={{
          padding: '10px',
          color: '#111827',
          fontSize: '14px',
          lineHeight: 1.6,
          overflowY: 'auto',
          height: '68vh',
          backgroundColor: '#f9fafb',
          borderRadius: '5px',
          border: '1px solid #e5e7eb'
        }} ref={contentRef} onScroll={handleScroll}>
          {renderContent()}
        </div>
      </div>
  );
};

export default PageTwo;
