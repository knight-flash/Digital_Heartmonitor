// src/components/CenterPanel/CenterPanel.jsx (最终清理版)

import React, { useState, useEffect, useRef } from 'react';
import UploadPanel from './UploadPanel';
import AnalysisReport from './AnalysisReport'; 

// 在我们最终的、由后端生成报告的架构中，CenterPanel不再需要自己调用getBotReply
// 因此相关的import也被移除了

function CenterPanel({ appStatus, onUploadSuccess, setIsLoading, analysisData }) {
  // --- 状态管理 ---
  const [activeVideo, setActiveVideo] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const video1Ref = useRef(null);

  // --- 副作用 Hook ---
  // 这个 useEffect 的职责很单一：只负责处理介绍视频的播放结束事件
  useEffect(() => {
    if (appStatus === 'displaying_results') {
      const videoElement = video1Ref.current;
      if (!videoElement) return;

      const handleVideoEnd = () => {
        setActiveVideo(2); // 切换到循环视频
        setShowReport(true); // 触发报告区域的显示
      };

      videoElement.addEventListener('ended', handleVideoEnd);
      
      // 清理函数
      return () => {
        if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [appStatus]);

  
  // --- 渲染逻辑 ---

  // 1. 根据应用状态，决定显示上传界面还是仪表盘
  if (appStatus !== 'displaying_results') {
    return (
      <div className="center_main">
        <div className="center_top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadPanel onUploadSuccess={onUploadSuccess} setIsLoading={setIsLoading} />
        </div>
        <div className="center_bottom">
          {/* 初始状态下，报告区为空 */}
        </div>
      </div>
    );
  }

  // 2. 显示仪表盘
  return (
    <div className="center_main">
      <div className="center_top" style={{ width: '684px', height: '430px', position: 'relative', backgroundColor: '#0b1c2c', overflow: 'hidden' }}>
        <div id="video-container-1" style={{ width: '100%', height: '100%', display: activeVideo === 1 ? 'block' : 'none' }}>
          <video ref={video1Ref} id="heart-video-1" width="100%" height="100%" muted autoPlay style={{ objectFit: 'cover' }}>
            <source src="./static/media/heart_video.mp4" type="video/mp4" />
          </video>
        </div>
        <div id="video-container-2" style={{ width: '100%', height: '100%', display: activeVideo === 2 ? 'block' : 'none', position: 'absolute', top: 0, left: 0 }}>
          <video id="heart-video-2" width="100%" height="100%" muted loop autoPlay style={{ objectFit: 'cover' }}>
            <source src="./static/media/heart_video_loop.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="center_bottom">
        {/* 当需要显示报告时 (showReport为true), 
          直接从 analysisData prop 中读取后端已经生成好的 textReport 
        */}
        {showReport && analysisData && <AnalysisReport content={analysisData.textReport} />}
      </div>
    </div>
  );
}

export default CenterPanel;