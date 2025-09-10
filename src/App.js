import React, {useEffect} from 'react';
import MainLayout from './components/MainLayout';
import './App.css';
import { useSession } from "./utils/SessionContext";
import {getSessionStatus} from "./services/apiService";

function App() {
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
    }, [sessionId, sessionStatus, dispatch]);
  return (
      <div className="App">
          <MainLayout />
      </div>
  );
}

export default App;
