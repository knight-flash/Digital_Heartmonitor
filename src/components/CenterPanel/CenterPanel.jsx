// src/components/CenterPanel/CenterPanel.jsx (修正视频播放版)

import React, { useState, useEffect, useRef } from 'react'; // 1. 重新引入需要的hooks
import UploadPanel from './UploadPanel';
import AnalysisReport from './AnalysisReport';
import { useSession } from '../../context/SessionContext';

function CenterPanel() {
  const { state } = useSession();
  const { sessionStatus } = state;

  // 2. 恢复用于控制视频播放的本地状态和ref
  const [activeVideo, setActiveVideo] = useState(1);
  const video1Ref = useRef(null);

  // 3. 恢复只与视频播放相关的useEffect
  useEffect(() => {
    // 仅当进入结果显示状态时，才处理视频逻辑
    if (sessionStatus === 'generating_report' || sessionStatus === 'ready') {
      const videoElement = video1Ref.current;
      if (!videoElement) return;

      // 当第一个视频播放结束时，切换到第二个循环播放的视频
      const handleVideoEnd = () => {
        setActiveVideo(2);
      };

      videoElement.addEventListener('ended', handleVideoEnd);

      // 清理事件监听器
      return () => {
        if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [sessionStatus]); // 依赖于sessionStatus来触发


  if (sessionStatus === 'idle') {
    return (
      <div className="center_main">
        <div className="center_top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadPanel />
        </div>
        <div className="center_bottom" />
      </div>
    );
  }

  // 4. 恢复原始的、包含两个video标签的JSX结构
  return (
    <div className="center_main">
      <div className="center_top" style={{ width: '688px', height: '387px', position: 'relative', backgroundColor: '#0b1c2c', overflow: 'hidden' }}>
        <div id="video-container-1" style={{ width: '100%', height: '100%', display: activeVideo === 1 ? 'block' : 'none' }}>
          {/* 使用原始的视频文件路径 */}
          <video ref={video1Ref} id="heart-video-1" width="100%" height="100%" muted autoPlay style={{ objectFit: 'cover' }}>
            <source src="./static/media/heart_video.mp4" type="video/mp4" />
          </video>
        </div>
        <div id="video-container-2" style={{ width: '100%', height: '100%', display: activeVideo === 2 ? 'block' : 'none', position: 'absolute', top: 0, left: 0 }}>
          {/* 使用原始的循环视频文件路径 */}
          <video id="heart-video-2" width="100%" height="100%" muted loop autoPlay style={{ objectFit: 'cover' }}>
            <source src="./static/media/heart_video_loop.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="center_bottom">
        <AnalysisReport />
      </div>
    </div>
  );
}

export default CenterPanel;