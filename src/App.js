// src/App.js (修改后)

import React, { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Header from './components/Header/Header';
import './index.css';
import { useSession } from './context/SessionContext'; // 1. 导入自定义Hook
import { getSessionStatus } from './services/apiService'; // 2. 导入API服务

function App() {
  // 3. 从全局Context中获取状态和dispatch函数
  const { state, dispatch } = useSession();
  const { sessionId, sessionStatus } = state;

  // 4. 【核心】实现轮询逻辑的useEffect
  useEffect(() => {
    // 如果状态不是'generating_report'，则什么也不做
    if (sessionStatus !== 'generating_report' || !sessionId) {
      return;
    }

    console.log(`[Polling] 开始轮询 session: ${sessionId}`);

    // 启动一个定时器，每3秒查询一次状态
    const intervalId = setInterval(async () => {
      try {
        const response = await getSessionStatus(sessionId);
        const newStatus = response.data.status;

        console.log(`[Polling] 查询状态: ${newStatus}`);

        // 如果后端返回状态'ready'
        if (newStatus === 'ready') {
          // 派发一个SESSION_READY动作，将报告存入全局状态
          dispatch({
            type: 'SESSION_READY',
            payload: { report: response.data.report },
          });
          // 清除定时器，停止轮询
          clearInterval(intervalId);
          console.log('[Polling] 报告已就绪，停止轮询。');
        }
      } catch (error) {
        console.error('[Polling] 轮询出错:', error);
        dispatch({ type: 'SET_ERROR', payload: '获取报告状态失败' });
        clearInterval(intervalId); // 出错时也停止轮询
      }
    }, 3000); // 轮询间隔：3000毫秒

    // React Effect的清理函数：当组件卸载或依赖项变化时，清除定时器
    return () => {
      clearInterval(intervalId);
    };
  }, [sessionId, sessionStatus, dispatch]); // 依赖项

  // 5. App组件现在变得非常简洁，不再需要管理状态和回调函数
  return (
    <>
      <Header />
      {/* MainLayout也不再需要任何props，它内部的子组件将直接从Context获取数据 */}
      <MainLayout />
    </>
  );
}

export default App;