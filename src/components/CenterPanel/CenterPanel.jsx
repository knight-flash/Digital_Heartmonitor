// src/components/CenterPanel/CenterPanel.jsx

import React, { useState, useEffect, useRef } from 'react';
import UploadPanel from './UploadPanel';
import AnalysisReport from './AnalysisReport'; // 1. 引入报告组件

// 接收 analysisData prop
function CenterPanel({ appStatus, onUploadSuccess, setIsLoading, analysisData }) {
  const [activeVideo, setActiveVideo] = useState(1);
  const [showReport, setShowReport] = useState(false); // 2. 新增状态控制报告显示
  const video1Ref = useRef(null);

  useEffect(() => {
    if (appStatus === 'displaying_results') {
      const videoElement = video1Ref.current;
      if (!videoElement) return;

      const handleVideoEnd = () => {
        setActiveVideo(2);
        setShowReport(true); // 3. 当视频1结束时，设置 showReport 为 true
      };

      videoElement.addEventListener('ended', handleVideoEnd);
      return () => videoElement.removeEventListener('ended', handleVideoEnd);
    }
  }, [appStatus]);

  if (appStatus !== 'displaying_results') {
    return (
      <div className="center_main">
        <div className="center_top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadPanel onUploadSuccess={onUploadSuccess} setIsLoading={setIsLoading} />
        </div>
        <div className="center_bottom"></div>
      </div>
    );
  }

  return (
    <div className="center_main">
      <div className="center_top" style={{ width: '684px', height: '430px', position: 'relative', backgroundColor: '#0b1c2c', overflow: 'hidden' }}>
        {/* ... 视频部分代码不变 ... */}
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
        {/* 4. 根据 showReport 状态和是否有数据，条件性地渲染报告 */}
        {showReport && analysisData && <AnalysisReport analysisData={analysisData.initialAnalysis} />}
      </div>
    </div>
  );
}

export default CenterPanel;