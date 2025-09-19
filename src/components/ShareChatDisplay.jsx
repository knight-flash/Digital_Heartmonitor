import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from '../utils/SessionContext';
import './ShareChatDisplay.css';

const ShareChatDisplay = () => {
  const { state } = useSession();
  const { chatHistory } = state;

  return (
    <div className="share-chat-display">
      <div className="chat-header">
        <h3>分享的对话记录</h3>
        <button 
          className="go-to-chat-btn"
          onClick={() => window.location.href = '/'}
        >
          去对话
        </button>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareChatDisplay;
