import React, { useState } from 'react';
import './ChatHistorySelector.css';
import { generateEncShareLink } from '../utils/shareUtils';

const ChatHistorySelector = ({ chatHistory, sessionData, onClose, onShowToast }) => {
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // 检测是否为错误消息
  const isErrorMessage = (text) => {
    if (!text) return false;
    
    const errorPatterns = [
      /请求出错/i,
      /Network Error/i,
      /网络错误/i,
      /连接失败/i,
      /请求失败/i,
      /服务器错误/i,
      /服务异常/i,
      /timeout/i,
      /超时/i,
      /error/i,
      /失败/i
    ];
    
    return errorPatterns.some(pattern => pattern.test(text));
  };

  // 将聊天记录按对话分组（用户消息+对应的机器人回复）
  const groupConversations = () => {
    const conversations = [];
    
    // 找到所有用户消息
    const userMessages = chatHistory.filter(msg => msg.sender === 'user');
    
    userMessages.forEach((userMsg, index) => {
      // 找到这个用户消息在原始历史中的位置
      const userIndex = chatHistory.findIndex(msg => msg.id === userMsg.id);
      
      // 查找这个用户消息后面的第一个机器人回复
      let botMessage = null;
      for (let i = userIndex + 1; i < chatHistory.length; i++) {
        if (chatHistory[i].sender === 'bot') {
          botMessage = chatHistory[i];
          break;
        }
      }
      
      // 只创建有成功机器人回复的对话对象，过滤掉错误消息
      if (botMessage && !isErrorMessage(botMessage.text)) {
        const conversation = {
          id: `conv_${userMsg.id}`,
          userMessage: userMsg,
          botMessage: botMessage,
          index: index
        };
        
        conversations.push(conversation);
      }
    });

    return conversations;
  };

  const conversations = groupConversations();

  const handleConversationToggle = (conversationId) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleShareSelected = async () => {
    const selectedConvs = conversations.filter(conv => 
      selectedConversations.has(conv.id)
    );
    
    if (selectedConvs.length === 0) {
      alert('请至少选择一个对话记录');
      return;
    }

    setIsGeneratingLink(true);
    
    try {
      console.log('开始生成分享链接...');
      console.log('选中的对话:', selectedConvs);
      console.log('会话数据:', sessionData);
      
      // 新策略：仅打包 sessionId + messageIds
      const messageIds = selectedConvs
        .map(conv => (conv.botMessage ? conv.botMessage.id : null))
        .filter(Boolean);
      const shareLink = generateEncShareLink(sessionData.sessionId, messageIds);
      console.log('生成的分享链接:', shareLink);
      
      // 复制链接到剪贴板
      const textarea = document.createElement('textarea');
      textarea.value = shareLink;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (!success){
        console.error('复制失败');
      }
      // 显示成功提示
      if (onShowToast) {
        onShowToast({
          message: '对话链接已生成！',
          type: 'success'
        });
      }
      
      onClose();
    } catch (error) {
      console.error('生成分享链接失败:', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      
      if (onShowToast) {
        onShowToast({
          message: `生成分享链接失败: ${error.message}`,
          type: 'error'
        });
      } else {
        alert(`生成分享链接失败: ${error.message}`);
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(conversations.map(conv => conv.id)));
    }
  };

  return (
    <div className="chat-history-selector-overlay">
      <div className="chat-history-selector-modal">
        <div className="selector-header">
          <h3>选择要分享的对话记录</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="selector-actions">
          <button 
            className="select-all-btn"
            onClick={handleSelectAll}
          >
            {selectedConversations.size === conversations.length ? '取消全选' : '全选'}
          </button>
          <span className="selected-count">
            已选择 {selectedConversations.size} 个对话
          </span>
        </div>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              暂无对话记录
            </div>
          ) : (
            conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`conversation-item ${selectedConversations.has(conversation.id) ? 'selected' : ''}`}
                onClick={() => handleConversationToggle(conversation.id)}
              >
                <div className="conversation-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedConversations.has(conversation.id)}
                    onChange={() => handleConversationToggle(conversation.id)}
                  />
                </div>
                <div className="conversation-content">
                  <div className="conversation-preview">
                    <div className="user-message">
                      <strong>用户:</strong> {conversation.userMessage.text}
                    </div>
                    {conversation.botMessage && (
                      <div className="bot-message">
                        <strong>HeartTalk:</strong> {conversation.botMessage.text.length > 100 
                          ? conversation.botMessage.text.substring(0, 100) + '...' 
                          : conversation.botMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="selector-footer">
          <button className="cancel-btn" onClick={onClose}>
            取消
          </button>
          <button 
            className="share-btn" 
            onClick={handleShareSelected}
            disabled={selectedConversations.size === 0 || isGeneratingLink}
          >
            {isGeneratingLink ? '生成链接中...' : `生成分享链接 (${selectedConversations.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySelector;
