// src/components/ChatPanel/ChatPanel.jsx (最终重构版)

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { SettingOutlined, RedoOutlined } from '@ant-design/icons';
import SettingsPanel from './SettingsPanel';
import { useSession } from '../../context/SessionContext'; // 1. 导入 useSession
import { postToAgent } from '../../services/apiService'; // 2. 导入新的 agent API
import './ChatPanel.css'; // 导入聊天面板样式

function ChatPanel() {
  // 3. 从全局Context获取所有需要的数据和方法
  const { state, dispatch } = useSession();
  const { sessionId, sessionStatus, chatHistory, isAgentLoading } = state;

  // 4. 只保留输入框内容的本地状态
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [settings, setSettings] = useState({ sendKey: 'Enter', fontSize: 14 });
  const [messageReactions, setMessageReactions] = useState({});

  // 5. 【删除】旧的 getBotReply 函数被完全删除

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSettingsChange = (newSettings) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  const handleResetChat = () => {
    // 重置会话会清空所有内容，包括聊天记录
    dispatch({ type: 'RESET_SESSION' });
  };

  const handleSend = async () => {
    // 6. 增加判断：如果报告未就绪，或正在加载，或输入为空，则不允许发送
    if (sessionStatus !== 'ready' || isAgentLoading || inputValue.trim() === '') {
      return;
    }

    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    const currentInput = inputValue;
    setInputValue('');

    // 7. 派发 AGENT_START 动作，立刻更新UI
    dispatch({ type: 'AGENT_START', payload: { userMessage } });

    try {
      // 8. 调用新的、极简的 agent API
      const response = await postToAgent(sessionId, currentInput);
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

      // 9. 派发 AGENT_FINISH 动作，更新最终结果
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });

    } catch (error) {
      console.error("调用 agent 接口出错:", error);
      const errorMessage = error.response?.data?.error || error.message;
      const botMessage = { id: Date.now() + 1, text: `请求出错: ${errorMessage}`, sender: 'bot' };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });
    }
  };

  const handleKeyPress = (event) => {
    if (settings.sendKey === 'Enter' && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    } else if (settings.sendKey === 'Ctrl+Enter' && event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    // 增加判断：如果报告未就绪，或正在加载，则不允许发送
    if (sessionStatus !== 'ready' || isAgentLoading) {
      return;
    }

    const userMessage = { id: Date.now(), text: suggestion, sender: 'user' };
    // 派发 AGENT_START 动作，立刻更新UI
    dispatch({ type: 'AGENT_START', payload: { userMessage } });

    try {
      // 调用新的、极简的 agent API
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

      // 派发 AGENT_FINISH 动作，更新最终结果
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });

    } catch (error) {
      console.error("调用 agent 接口出错:", error);
      const errorMessage = error.response?.data?.error || error.message;
      const botMessage = { id: Date.now() + 1, text: `请求出错: ${errorMessage}`, sender: 'bot' };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  const handleShare = async (text) => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text || '');
      }
    } catch (err) {
      console.error('分享失败', err);
    }
  };

  const handleRegenerate = () => {
    // 这里缺少原始提问上下文，暂以提示替代。
    console.warn('暂未接入重新生成逻辑');
  };

  const toggleReaction = (messageId, type) => {
    setMessageReactions(prev => {
      const current = prev[messageId];
      const next = current === type ? null : type;
      return { ...prev, [messageId]: next };
    });
  };

  // 10. 【核心】根据全局状态判断聊天功能是否可用
  const isChatDisabled = sessionStatus !== 'ready';
  const placeholderText = isChatDisabled ? '请等待分析报告生成完毕...' : 'Enter 发送, Shift + Enter 换行';

  return (
    <div className="left_main">
      <div className="slide_wrap" style={{ display: 'flex', flexDirection: 'column', height: '85vh', margin: 'auto 0', padding: '25px', boxSizing: 'border-box' }}>
        {/* Header部分 */}
        <div id="left_chat_header" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>新的聊天</span>
          <div>
            <SettingOutlined style={{ color: '#ccc', cursor: 'pointer', fontSize: '18px' }} onClick={() => setIsSettingsVisible(true)} />
            <RedoOutlined style={{ color: '#ccc', cursor: 'pointer', fontSize: '18px', marginLeft: '15px' }} onClick={handleResetChat} />
          </div>
        </div>

        {/* 聊天记录区，直接读取全局 chatHistory */}
        <div id="chat_message_area" style={{ 
          height: 'calc(85vh - 200px)', // 固定高度，减去头部和输入框的高度
          overflowY: 'auto', 
          padding: '20px', 
          fontSize: `${settings.fontSize}px`,
          scrollbarWidth: 'thin', // Firefox 滚动条样式
          scrollbarColor: '#4a5568 #2d3748' // Firefox 滚动条颜色
        }}>
          {chatHistory.map((message, index) => (
            <div key={message.id} className={`message-group ${message.sender === 'user' ? 'user' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {message.sender === 'bot' && (<img src="/static/images/heart.png" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }} />)}
              <div className="message-content" style={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <span className="sender-name" style={{ color: '#eee', fontSize: '14px', marginBottom: '5px' }}>{message.sender === 'bot' ? 'HeartTalk' : 'You'}</span>
                <div className="message-bubble" style={{ backgroundColor: message.sender === 'user' ? '#0B4EC3' : 'rgba(30, 60, 130, 0.5)', color: '#fff', padding: '10px 15px', borderRadius: '8px', borderTopLeftRadius: message.sender === 'bot' ? 0 : '8px', borderTopRightRadius: message.sender === 'user' ? 0 : '8px', maxWidth: '100%' }}>
                  {message.sender === 'bot' ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
                  {message.sender === 'bot' && (chatHistory.slice(0, index).filter(m => m.sender === 'bot').length >= 2) && (
                    <div className="message-toolbar" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                      <button onClick={() => handleCopy(message.text)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }} title="复制">
                        📋
                      </button>
                      <button onClick={handleRegenerate} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }} title="重新生成">
                        🔄
                      </button>
                      <button onClick={() => handleShare(message.text)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }} title="分享">
                        分享
                      </button>
                      <button onClick={() => toggleReaction(message.id, 'like')} style={{ background: 'transparent', border: 'none', color: messageReactions[message.id] === 'like' ? '#22c55e' : 'inherit', cursor: 'pointer' }} title="点赞">
                        👍
                      </button>
                      <button onClick={() => toggleReaction(message.id, 'dislike')} style={{ background: 'transparent', border: 'none', color: messageReactions[message.id] === 'dislike' ? '#ef4444' : 'inherit', cursor: 'pointer' }} title="点踩">
                        👎
                      </button>
                    </div>
                  )}
                  {message.sender === 'bot' && message.suggestions && (
                    <div className="message-suggestions" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#374151',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            fontWeight: '400'
                          }}
                        >
                          {suggestion} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isAgentLoading && (
            <div className="message-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
              <img src="/static/images/heart.png" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }} />
              <div className="message-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="sender-name" style={{ color: '#eee', fontSize: '14px', marginBottom: '5px' }}>HeartTalk</span>
                <div className="message-bubble" style={{ backgroundColor: 'rgba(30, 60, 130, 0.5)', color: '#fff', padding: '10px 15px', borderRadius: '8px', borderTopLeftRadius: 0, maxWidth: '100%' }}>
                  正在输入...
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 输入区 */}
        <div id="chat_input_section" style={{ padding: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="main-input-area" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <textarea
              id="chat_textarea_input"
              placeholder={placeholderText}
              style={{ flexGrow: 1, backgroundColor: 'transparent', border: 'none', color: 'white', resize: 'none', height: '54px', lineHeight: '24px', fontSize: '14px', maxHeight: '100px', outline: 'none' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isChatDisabled || isAgentLoading}
            />
            <button id="chat_send_button" onClick={handleSend} disabled={isChatDisabled || isAgentLoading} style={{ backgroundColor: '#0B4EC3', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', cursor: 'pointer', marginLeft: '10px', flexShrink: 0 }}>
              {isAgentLoading ? '...' : '发送'}
            </button>
          </div>
        </div>
      </div>
      <SettingsPanel visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} settings={settings} onSettingsChange={handleSettingsChange} />
    </div>
  );
}

export default ChatPanel;