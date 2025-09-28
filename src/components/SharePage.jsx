import React, { useEffect, useState } from 'react';
import { parseShareData, getShareIdFromUrl, parseEncShareFromUrl } from '../utils/shareUtils';
import { fetchSharedData } from '../services/apiService';
import { useSession } from '../utils/SessionContext';
import PageOne from './PageOne';
import PageTwo from './PageTwo';
import Header from './Header';
import ShareChatDisplay from './ShareChatDisplay';
import ResizableSplitter from './ResizableSplitter';
import './SharePage.css';
import './MainLayout.css';

const SharePage = () => {
  const { state, dispatch } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [activePage, setActivePage] = useState('page1');

  useEffect(() => {
    const loadShareData = async () => {
      try {
        // 优先使用查询参数策略
        const enc = parseEncShareFromUrl();
        if (enc) {
          const { sessionId, messageIds } = enc;
          // 向后端请求还原全部数据
          const resp = await fetchSharedData(sessionId, messageIds);
          // 兼容后端返回 { code, data, message }
          const payload = resp?.data?.data ?? resp?.data;

          // 将后端返回的 chatHistory 规范化为前端需要的 [{sender:'user'}, {sender:'bot'}] 对
          const normalizeHistory = (rawList) => {
            if (!Array.isArray(rawList)) return [];
            const normalized = [];
            rawList.forEach((item) => {
              // 后端示例中：item.sender 实际是“问题文本”，item.text 是“回答文本”
              const questionText = item?.sender ?? '';
              const answerText = item?.text ?? '';
              const userMsgId = item?.parentUserMessageId || `${item?.id}_q`;
              if (questionText) {
                normalized.push({
                  id: userMsgId,
                  sender: 'user',
                  text: questionText,
                  createdAt: item?.createdAt
                });
              }
              if (answerText) {
                normalized.push({
                  id: item?.id,
                  sender: 'bot',
                  text: answerText,
                  createdAt: item?.createdAt,
                  parentUserMessageId: userMsgId
                });
              }
            });
            return normalized;
          };

          const normalizedHistory = normalizeHistory(payload?.chatHistory);

          setShareData({ metadata: { totalConversations: messageIds.length } });
          dispatch({
            type: 'RESTORE_SHARED_SESSION',
            payload: {
              sessionStatus: 'ready',
              sessionId: payload?.sessionId || sessionId,
              initialAnalysis: payload?.initialAnalysis ?? null,
              waveform: payload?.waveform ?? null,
              report: payload?.report ?? null,
              gifBinary:payload?.ecgEhco??null,
              chatHistory: normalizedHistory,
            }
          });
          // 如果有报告，默认切换到报告页
          if (payload?.report) {
            setActivePage('page2');
          }
          setLoading(false);
          return;
        }

        // 兼容旧的shareId路径（本地存储方案）
        const shareId = getShareIdFromUrl();
        if (shareId) {
          const data = parseShareData(shareId);
          setShareData(data);
          dispatch({
            type: 'RESTORE_SHARED_SESSION',
            payload: {
              sessionStatus: data.sessionStatus,
              sessionId: data.sessionId,
              initialAnalysis: data.initialAnalysis,
              waveform: data.waveform,
              report: data.report,
              chatHistory: data.chatHistory
            }
          });
          if (data.report) {
            setActivePage('page2');
          }
          setLoading(false);
          return;
        }

        throw new Error('无效的分享链接');

      } catch (err) {
        console.error('加载分享数据失败:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadShareData();
  }, [dispatch]);

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'page1':
        return <PageOne />;
      case 'page2':
        return <PageTwo />;
      default:
        return <PageOne />;
    }
  };

  if (loading) {
    return (
      <div className="share-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载分享内容...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>加载失败</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="share-page">
      <Header />
      <ResizableSplitter initialLeftWidth={window.innerWidth * 0.4}>
        {/* 左侧聊天显示 */}
        <ShareChatDisplay />
        
        {/* 右侧页面区域 */}
        <div className="right-panel">
          {/* 页面切换标签 */}
          <div className="page-tabs">
            <div 
              className={`tab ${activePage === 'page1' ? 'active' : ''}`}
              onClick={() => handlePageChange('page1')}
            >
              心电指标
            </div>
            {state?.report && (
              <div 
                className={`tab ${activePage === 'page2' ? 'active' : ''}`}
                onClick={() => handlePageChange('page2')}
              >
                心电报告
              </div>
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

export default SharePage;
