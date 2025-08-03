// src/components/ChatPanel/ChatPanel.jsx

import React, { useState, useEffect, useRef } from 'react';
import { SettingOutlined, RedoOutlined} from '@ant-design/icons';
import SettingsPanel from './SettingsPanel'; // 引入我们刚创建的设置面板组件

// --- 核心API调用函数 (后端代理模式) ---
// 这个函数现在调用我们自己的后端服务，由后端去请求DeepSeek API
const getBotReply = async (chatHistory, currentAnalysisData) => {
  // 从环境变量获取我们自己的后端地址
  const backendUrl = process.env.REACT_APP_API_URL;

  // 1. 动态构建系统提示 (System Prompt)
  let systemPrompt = "你是一个名为HeartTalk的专业心脏健康助手。请友好、简洁地回答用户问题。";
  if (currentAnalysisData && currentAnalysisData.initialAnalysis) {
    const data = currentAnalysisData.initialAnalysis;
    const heartRate = data.Heart_Rate_Mean?.toFixed(2);
    const hrv = (data.HRV_RMSSD * 1000)?.toFixed(2);
    // 将实时数据拼接成一段文字，注入到系统提示中
    systemPrompt += ` 当前用户的实时ECG分析数据如下：平均心率是 ${heartRate} bpm, 心率变异性(RMSSD)是 ${hrv} ms。请利用这些信息来回答。`;
  }

  // 将我们的消息格式转换为API要求的格式
  const apiMessages = chatHistory.map(msg => ({
    role: msg.sender === 'bot' ? 'assistant' : 'user',
    content: msg.text
  }));
  
  // 构造要发送给我们自己后端的请求体
  const payload = {
    messages: [
      { role: "system", content: systemPrompt },
      ...apiMessages
    ]
  };

  try {
    // 2. 请求的URL现在是我们自己的后端 /chat 端点
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '服务器响应错误');
    }

    const data = await response.json();
    const botResponseText = data.choices[0]?.message?.content || "抱歉，我没有收到有效的回复。";
    
    return { id: Date.now(), text: botResponseText, sender: 'bot' };

  } catch (error) {
    console.error("调用后端聊天接口时出错:", error);
    return { id: Date.now(), text: `请求出错: ${error.message}`, sender: 'bot' };
  }
};


const INITIAL_MESSAGE = { id: 1, text: '您好，我是HeartTalk。请先上传您的心电图文件。', sender: 'bot' };
// ChatPanel 组件现在接收 analysisData prop
function ChatPanel({ analysisData }) {
  const [messages, setMessages] = useState([
    { id: 1, text: '您好，我是HeartTalk。请先上传您的心电图文件。', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
 // 【新增】创建一个状态来控制设置面板的可见性
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  // 1. 【新增】使用 useState 来管理设置的状态
  const [settings, setSettings] = useState({
    sendKey: 'Enter', // 默认发送键为 Enter
    fontSize: 14,     // 默认字体大小为 14px
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. 【新增】处理设置变化的函数
  const handleSettingsChange = (newSettings) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  // 3. 【新增】处理重置对话的函数
  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSend = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    // const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    // 3. 【核心改造】调用API时，将当前的分析数据传递过去
    const botResponse = await getBotReply(updatedMessages, analysisData);
    
    setIsLoading(false);
    setMessages(prevMessages => [...prevMessages, botResponse]);
  };

  const handleKeyPress = (event) => {
    if (settings.sendKey === 'Enter') {
      if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        handleSend();
      }
    } else if (settings.sendKey === 'Ctrl+Enter') {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        handleSend();
      }
    }

  
  
  };

  // ... 下方的 JSX 渲染部分代码保持不变 ...
  return (
    <div className="left_main">
      {/* 【核心修改】
        我们将 padding 从 '0' 改为了 '15px'。
        - 这会在容器的上下左右都增加15像素的内边距，将所有内容向中心推。
        - 同时加入 boxSizing: 'border-box'，确保内边距被计算在总高度之内，防止布局破坏。
      */}
      <div 
        className="slide_wrap" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '85vh', 
          margin: 'auto 0',
          padding: '25px', /* 从 '0' 修改为此 */
          boxSizing: 'border-box' /* 新增此行 */
        }}
      >
        <div id="left_chat_header" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>新的聊天</span>
          <div>
            {/* 【新增】设置按钮 */}
            <SettingOutlined 
              style={{ color: '#ccc', cursor: 'pointer', fontSize: '18px' }}
              onClick={() => setIsSettingsVisible(true)} // 点击时，将状态设为true
            />
            <RedoOutlined
              style={{ color: '#ccc', cursor: 'pointer', fontSize: '18px' }}
              onClick={handleResetChat}
            />
            
           
          </div>
        </div>
        <div id="chat_message_area" style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', fontSize: `${settings.fontSize}px` }}>
          {messages.map(message => (
            <div key={message.id} className={`message-group ${message.sender === 'user' ? 'user' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {message.sender === 'bot' && (
                <img src="./static/title.png" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }} />
              )}
              <div className="message-content" style={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <span className="sender-name" style={{ color: '#eee', fontSize: '14px', marginBottom: '5px' }}>{message.sender === 'bot' ? 'HeartTalk' : 'You'}</span>
                <div className="message-bubble" style={{ backgroundColor: message.sender === 'user' ? '#0B4EC3' : 'rgba(30, 60, 130, 0.5)', color: '#fff', padding: '10px 15px', borderRadius: '8px', borderTopLeftRadius: message.sender === 'bot' ? 0 : '8px', borderTopRightRadius: message.sender === 'user' ? 0 : '8px', maxWidth: '100%' }}>
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-group" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
              <img src="./static/title.png" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '12px', flexShrink: 0 }} />
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
        <div id="chat_input_section" style={{ padding: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="input-toolbar" style={{ marginBottom: '5px' }}>
          </div>
          <div className="main-input-area" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <textarea
              id="chat_textarea_input"
              placeholder="Enter 发送, Shift + Enter 换行"
              style={{ flexGrow: 1, backgroundColor: 'transparent', border: 'none', color: 'white', resize: 'none', height: '54px', lineHeight: '24px', fontSize: '14px', maxHeight: '100px', outline: 'none' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading} // 当机器人回复时，禁用输入框
            />
            <button id="chat_send_button" onClick={handleSend} disabled={isLoading} style={{ backgroundColor: '#0B4EC3', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', cursor: 'pointer', marginLeft: '10px', flexShrink: 0 }}>
              {isLoading ? '...' : '发送'}
            </button>
          </div>
        </div>
      </div>
      <div className="panel-footer"></div>
      {/* 7. 【修改】将 settings 和回调函数传递给 SettingsPanel */}
      <SettingsPanel
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

export default ChatPanel;