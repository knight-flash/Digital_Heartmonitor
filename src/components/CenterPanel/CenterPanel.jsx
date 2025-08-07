import React, { useState, useEffect, useRef } from 'react';
import UploadPanel from './UploadPanel';
import AnalysisReport from './AnalysisReport'; 

function CenterPanel({ appStatus, onUploadSuccess, setIsLoading, analysisData }) {
  const [activeVideo, setActiveVideo] = useState(1);
  const [showReport, setShowReport] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const video1Ref = useRef(null);

  // Effect 1: 监听视频结束事件，决定何时【显示】报告
  useEffect(() => {
    if (appStatus === 'displaying_results') {
      const videoElement = video1Ref.current;
      if (!videoElement) return;
      const handleVideoEnd = () => {
        setActiveVideo(2);
        setShowReport(true);
      };
      videoElement.addEventListener('ended', handleVideoEnd);
      return () => { if (videoElement) videoElement.removeEventListener('ended', handleVideoEnd); };
    }
  }, [appStatus]);

  // Effect 2: 【核心修改】数据加载后，立刻在后台【请求生成】报告
  useEffect(() => {
    if (appStatus === 'displaying_results' && analysisData) {
      const fetchReport = async () => {
        setReportContent("AI报告正在生成中...");
        try {
          const backendUrl = process.env.REACT_APP_API_URL;
          const response = await fetch(`${backendUrl}/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullAnalysis: analysisData.fullAnalysis })
          });
          if (!response.ok) throw new Error('报告服务器响应错误');
          const reportData = await response.json();
          setReportContent(reportData.textReport);
        } catch (error) {
          setReportContent(`报告生成失败: ${error.message}`);
        }
      };
      fetchReport();
    }
  }, [appStatus, analysisData]);

  if (appStatus !== 'displaying_results') {
    return (
      <div className="center_main">
        <div className="center_top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UploadPanel onUploadSuccess={onUploadSuccess} setIsLoading={setIsLoading} />
        </div>
        <div className="center_bottom" />
      </div>
    );
  }

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
        {/* 【修正】...并在这里被正确使用，传递给 AnalysisReport 组件 */}
        {showReport && <AnalysisReport content={reportContent} />}
      </div>
    </div>
  );
}

export default CenterPanel;