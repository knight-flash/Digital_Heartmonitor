// src/components/CenterPanel/CenterPanel.jsx (修改后 - 分成两部分)

import React, { useState, useEffect, useRef } from 'react';
import UploadPanel from './UploadPanel';
import EcgChart from '../RightPanel/EcgChart';
import RadarChart from '../common/RadarChart';
import SingleCircularGauge from '../common/SingleCircularGauge';
import { useSession } from '../../context/SessionContext';

function CenterPanel() {
  const { state } = useSession();
  const { sessionStatus, waveform, initialAnalysis } = state;

  // 用于控制视频播放的本地状态和ref
  const [activeVideo, setActiveVideo] = useState(1);
  const video1Ref = useRef(null);

  // 处理视频播放逻辑
  useEffect(() => {
    if (sessionStatus === 'generating_report' || sessionStatus === 'ready') {
      const videoElement = video1Ref.current;
      if (!videoElement) return;

      const handleVideoEnd = () => {
        setActiveVideo(2);
      };

      videoElement.addEventListener('ended', handleVideoEnd);

      return () => {
        if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [sessionStatus]);

  if (sessionStatus === 'idle') {
    return (
      <div className="center_main" style={{paddingLeft:'350px',paddingTop:'180px'}}>
        <div className="center_top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
            <h2 style={{whiteSpace: 'nowrap'}}>欢迎来到数字心脏监测系统</h2>
          </div>
          <UploadPanel />
        </div>
        <div className="center_bottom" />
      </div>
    );
  }

  // 准备心率数据（圆环进度条）
  const heartRateData = initialAnalysis ? {
    title: '心率',
    unit: 'bpm',
    value: initialAnalysis.HR,
    min: 40,
    max: 160,
    low: 60,
    high: 100
  } : null;

  // 准备雷达图数据（活力值、压力值、情绪值、疲劳值、心率变异性）
  const radarData = initialAnalysis ? [
    { title: '活力值', unit: '', value: initialAnalysis.Vitality, min: 0, max: 100, low: 30, high: 70 },
    { title: '压力值', unit: '', value: initialAnalysis.Pressure, min: 0, max: 100, low: 30, high: 70 },
    { title: '情绪值', unit: '', value: initialAnalysis.Emotion, min: 0, max: 100, low: 30, high: 70 },
    { title: '疲劳值', unit: '', value: initialAnalysis.Fatigue, min: 0, max: 100, low: 30, high: 70 },
    { title: '心率变异性', unit: 'HRV', value: initialAnalysis.HRV, min: 0, max: 100, low: 20, high: 60 },
  ] : [];

  return (
    <div className="center_main">
      <div className="center_top" style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        {/* 上半部分：心脏视频和心电图 - 向上移动并缩小宽度 */}
        <div style={{ 
          width: '90%', // 增加卡片宽度从85%到90%
          height: '50%', // 从55%减少到50%，减少卡片高度
          backgroundColor: '#0b1c2c', 
          borderRadius: '10px',
          padding: '15px',
          boxSizing: 'border-box',
          marginBottom: '20px',
          marginTop: '-20px', // 向上移动
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* 左侧：心脏视频 */}
          <div style={{ 
            width: '48%', // 稍微增加心脏视频宽度
            height: '100%', 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: '8px',
            backgroundColor: '#1a2f3d'
          }}>
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

          {/* 右侧：实时心电图 - 更靠近心脏 */}
          <div style={{ 
            width: '48%', // 稍微增加心电图宽度
            height: '100%', 
            borderRadius: '8px',
            padding: '10px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              实时心电波形图 (ECG)
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              <EcgChart waveformData={waveform} />
            </div>
          </div>
        </div>

        {/* 下半部分：核心心电指标 - 分成两部分 */}
        <div style={{ 
          width: '90%', // 与心脏卡片宽度相同
          height: '50%', // 从45%增加到50%，平衡整体布局
          backgroundColor: '#0b1c2c', 
          borderRadius: '10px',
          padding: '15px',
          boxSizing: 'border-box',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0px'
        }}>
          {/* 左侧：心率圆环进度条 */}
          <div style={{ 
            width: '40%', // 从45%减少到40%，为右侧留出更多空间
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              心率监测
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              {heartRateData && <SingleCircularGauge {...heartRateData} />}
            </div>
          </div>

          {/* 右侧：其他指标雷达图 */}
          <div style={{ 
            width: '60%', // 放大到60%，让右侧占满
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'center'
          }}>
            <div style={{ 
              color: '#fff', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              健康指标分析
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              <RadarChart data={radarData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CenterPanel;