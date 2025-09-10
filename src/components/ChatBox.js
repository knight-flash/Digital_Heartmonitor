import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatBox.css';
import { useSession } from '../utils/SessionContext';
import { postToAgent } from '../services/apiService';

const ChatBox = () => {
  const { state, dispatch } = useSession();
  const { sessionId, sessionStatus, chatHistory, isAgentLoading } = state;
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);
  const [messageReactions, setMessageReactions] = useState({});

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
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || '请求失败';
      const botMessage = { id: Date.now() + 1, text: `请求出错: ${errorMessage}`, sender: 'bot' };
      dispatch({ type: 'AGENT_FINISH', payload: { botMessage } });
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '');
    } catch (e) {
      console.error('复制失败', e);
    }
  };

  const handleShare = async (text) => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text || '');
      }
    } catch (e) {
      console.error('分享失败', e);
    }
  };

  const handleRegenerate = () => {
    console.warn('暂未接入重新生成逻辑');
  };

  const toggleReaction = (messageId, type) => {
    setMessageReactions(prev => {
      const current = prev[messageId];
      const next = current === type ? null : type;
      return { ...prev, [messageId]: next };
    });
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
              {/*{message.sender === 'bot' && (chatHistory.slice(0, index).filter(m => m.sender === 'bot').length >= 2) && (*/}
              {/*  <div className="message-toolbar">*/}
              {/*    <button className="tb-btn" title="复制" onClick={() => handleCopy(message.text)}>📋</button>*/}
              {/*    <button className="tb-btn" title="分享" onClick={() => handleShare(message.text)}>↪️分享</button>*/}
              {/*    <button className="tb-btn" title="点赞" onClick={() => toggleReaction(message.id, 'like')} style={{ color: messageReactions[message.id] === 'like' ? '#22c55e' : undefined }}>👍</button>*/}
              {/*    <button className="tb-btn" title="点踩" onClick={() => toggleReaction(message.id, 'dislike')} style={{ color: messageReactions[message.id] === 'dislike' ? '#ef4444' : undefined }}>👎</button>*/}
              {/*  </div>*/}
              {/*)}*/}
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
    </div>
  );
};

export default ChatBox;
