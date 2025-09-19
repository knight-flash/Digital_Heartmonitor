import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatBox.css';
import { useSession } from '../utils/SessionContext';
import { postToAgent, saveConversation } from '../services/apiService';
import { saveReaction } from '../services/apiService';
import ChatHistorySelector from './ChatHistorySelector';
import Toast from './Toast';

const ChatBox = () => {
  const { state, dispatch } = useSession();
  const { sessionId, sessionStatus, chatHistory, isAgentLoading, initialAnalysis, waveform, report } = state;
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [showHistorySelector, setShowHistorySelector] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAgentLoading]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text) return;
    if (sessionStatus !== 'ready' || isAgentLoading) return;

    const userMessage = { id: Date.now(), text, sender: 'user' };
    setInputMessage('');
    dispatch({ type: 'AGENT_START', payload: { userMessage } });

    try {
      const response = await postToAgent(sessionId, text);
      // 为机器人消息添加建议选项
      const suggestions = [
        '你可以陪我玩些什么游戏?',
        '给我讲个笑话吧。',
        '你都知道哪些知识?'
      ];
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.data.response, 
        sender: 'bot',
        suggestions: suggestions
      };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });

      // 保存问答到后端（忽略错误，不影响前端体验）
      try {
        await saveConversation(
          sessionId,
          text,
          botMessage.text,
          botMessage.id,
          { initialAnalysis, waveform, report }
        );
      } catch (e) {
        console.warn('保存问答失败', e);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || '请求失败';
      const botMessage = { id: Date.now() + 1, text: `请求出错: ${errorMessage}`, sender: 'bot' };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (sessionStatus !== 'ready' || isAgentLoading) return;

    const userMessage = { id: Date.now(), text: suggestion, sender: 'user' };
    dispatch({ type: 'AGENT_START', payload: { userMessage } });

    try {
      const response = await postToAgent(sessionId, suggestion);
      // 为机器人消息添加建议选项
      const suggestions = [
        '你可以陪我玩些什么游戏?',
        '给我讲个笑话吧。',
        '你都知道哪些知识?'
      ];
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.data.response, 
        sender: 'bot',
        suggestions: suggestions
      };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });

      // 保存建议问答
      try {
        await saveConversation(
          sessionId,
          suggestion,
          botMessage.text,
          botMessage.id,
          { initialAnalysis, waveform, report }
        );
      } catch (e) {
        console.warn('保存问答失败', e);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || '请求失败';
      const botMessage = { id: Date.now() + 1, text: `请求出错: ${errorMessage}`, sender: 'bot' };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });
    }
  };

  // 原生的复制功能navigator.clipboard.writeText 只能在https或者localhost下使用
  // const handleCopy = async (text) => {
  //   try {
  //     await navigator.clipboard.writeText(text || '');
  //     setToast({
  //       message: '复制成功！',
  //       type: 'success'
  //     });
  //   } catch (e) {
  //     console.error('复制失败', e);
  //     setToast({
  //       message: '复制失败，请重试',
  //       type: 'error'
  //     });
  //   }
  // };
  const handleCopy = async (text) => {
      // 备选方案：使用document.execCommand
      const textarea = document.createElement('textarea');
      textarea.value = text || '';
      textarea.style.position = 'fixed'; // 防止滚动
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999); // 适配移动设备

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setToast({
            message: '复制成功！',
            type: 'success'
          });
        } else {
          throw new Error('execCommand failed');
        }
      } catch (err) {
        console.error('复制失败', err);
        setToast({
          message: '复制失败，请重试',
          type: 'error'
        });
      } finally {
        document.body.removeChild(textarea);
      }

  };

  // 原生的复制功能navigator.clipboard.writeText 只能在https或者localhost下使用
  // const handleShareConversation = async (shareContent) => {
  //   try {
  //     if (navigator.share) {
  //       await navigator.share({ text: shareContent });
  //     } else {
  //       await navigator.clipboard.writeText(shareContent || '');
  //     }
  //   } catch (e) {
  //     console.error('分享失败', e);
  //   }
  // };

  const handleShareConversation = async (shareContent) => {
    // 确保在用户交互事件中调用（如点击）
    if (!shareContent) {
      setToast({
        message:'分享的内容不能为空',
        type:'error'
      })
      return;
    }
    try {
          // 传统复制方法，兼容性更好
          const textarea = document.createElement('textarea');
          textarea.value = shareContent;
          textarea.style.position = 'fixed';
          document.body.appendChild(textarea);
          textarea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (successful) {
            setToast({
              message: '分享链接已复制到剪贴板！',
              type: 'success'
            });
          } else {
            setToast({
              message: '链接写入剪贴板失败！',
              type: 'error'
            });
          }
    } catch (e) {
      // 忽略用户主动取消分享的情况
      if (e.name !== 'AbortError') {
        console.error('操作失败:', e);
        // 可以在这里添加用户提示，如"请手动复制内容"
      }
    }
  };

  const handleShowHistorySelector = () => {
    setShowHistorySelector(true);
  };

  const handleShowToast = (toastData) => {
    setToast(toastData);
  };

  const toggleReaction = async (messageId, type) => {
    // 计算本次点击后的状态
    const prevType = messageReactions[messageId];
    const nextType = prevType === type ? null : type;

    setMessageReactions(prev => ({ ...prev, [messageId]: nextType }));

    // 异步保存到后端（不会阻塞UI）
    try {
      const reaction = prevType === type ? 'none' : type;
      await saveReaction(sessionId, messageId, reaction);
      // 成功提示
      const msg = nextType
        ? (type === 'like' ? '已点赞' : '已点踩')
        : (type === 'like' ? '已取消点赞' : '已取消点踩');
      setToast({ message: msg, type: 'success' });
    } catch (e) {
      console.warn('保存点赞/点踩失败', e);
      setToast({ message: '操作失败，请重试', type: 'error' });
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>聊天窗口</h3>
      </div>
      
      <div className="chat-messages">
        {chatHistory.map((message, index) => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.sender === 'bot' && (
              <div className="bot-info">
                <div className="bot-avatar">🤖</div>
                <div className="bot-name">HeartTalk</div>
              </div>
            )}
            {message.sender === 'user' && (
              <div className="user-info">
                <div className="user-name">用户</div>
                <div className="user-avatar">👤</div>
              </div>
            )}
            <div className="message-content">
              {message.sender === 'bot' ? (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              ) : (
                message.text
              )}
              {message.sender === 'bot' && (chatHistory.slice(0, index).filter(m => m.sender === 'bot').length >= 2) && (
                <div className="message-toolbar">
                  <button className="tb-btn" title="复制" onClick={() => handleCopy(message.text)}>📋</button>
                  <button className="tb-btn" title="分享对话" onClick={handleShowHistorySelector}>↪️分享对话</button>
                  <button className="tb-btn" title="点赞" onClick={() => toggleReaction(message.id, 'like')} style={{ color: messageReactions[message.id] === 'like' ? '#22c55e' : undefined }}>👍</button>
                  <button className="tb-btn" title="点踩" onClick={() => toggleReaction(message.id, 'dislike')} style={{ color: messageReactions[message.id] === 'dislike' ? '#ef4444' : undefined }}>👎</button>
                </div>
              )}
              {message.sender === 'bot' && message.suggestions && (
                <div className="message-suggestions">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isAgentLoading && (
          <div className={`message bot`}>
            <div className="bot-info">
              <div className="bot-avatar">🤖</div>
              <div className="bot-name">HeartTalk</div>
            </div>
            <div className="message-content">正在输入...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
        />
        <button onClick={handleSendMessage} disabled={sessionStatus !== 'ready' || isAgentLoading}>
          {isAgentLoading ? '...' : '发送'}
        </button>
      </div>
      
      {showHistorySelector && (
        <ChatHistorySelector
          chatHistory={chatHistory}
          sessionData={state}
          onClose={() => setShowHistorySelector(false)}
          onShare={handleShareConversation}
          onShowToast={handleShowToast}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ChatBox;
