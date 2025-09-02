// src/context/SessionContext.js

import React, { createContext, useReducer, useContext } from 'react';

// 1. 定义应用需要管理的所有全局状态
const initialState = {
  sessionStatus: 'idle', // 'idle', 'generating_report', 'ready'
  sessionId: null,
  initialAnalysis: null, // 用于仪表盘
  waveform: null, // 用于心电图
  report: null, // AI生成的报告全文
  chatHistory: [{ id: 1, text: '您好，我是HeartTalk。请先上传您的心电图文件。', sender: 'bot' }],
  isAgentLoading: false, // AI助手是否正在回复
  error: null, // 全局错误信息
};

// 2. 创建一个Reducer函数，定义所有可能的状态修改操作
function sessionReducer(state, action) {
  switch (action.type) {
    case 'START_SESSION':
      // 当文件上传成功，开始一个新会话
      return {
        ...state,
        sessionStatus: 'generating_report',
        sessionId: action.payload.sessionId,
        initialAnalysis: action.payload.initialAnalysis,
        waveform: action.payload.waveform,
        report: null, // 清空旧报告
        chatHistory: [{ id: Date.now(), text: '您的文件已收到，正在生成详细分析报告，请稍候... 在此期间，您可以查看右侧的初步指标。', sender: 'bot' }],
        error: null,
      };
    case 'SESSION_READY':
      // 当轮询到状态为 'ready'
      return {
        ...state,
        sessionStatus: 'ready',
        report: action.payload.report,
        chatHistory: [...state.chatHistory, { id: Date.now(), text: `您的专属AI报告已生成完毕！您可以开始向我提问了。

      不知道从何问起？可以试试这样问：

      - 我有房颤吗？
      - 帮我提取详细的生理特征指标
      - 对我的心搏进行分类`, sender: 'bot' }],
      };
    case 'AGENT_START':
      // AI开始回复
      return {
        ...state,
        isAgentLoading: true,
        chatHistory: [...state.chatHistory, action.payload.userMessage]
      };
    case 'AGENT_FINISH':
       // AI回复结束
      return {
        ...state,
        isAgentLoading: false,
        chatHistory: [...state.chatHistory, action.payload.botMessage]
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload.error, isAgentLoading: false };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}

// 3. 创建 React Context
const SessionContext = createContext();

// 4. 创建一个 Provider 组件，用于包裹整个应用
export const SessionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
};

// 5. 创建一个自定义Hook，方便子组件调用
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};