// src/components/RightPanel/RightPanel.jsx

import React from 'react';
import EcgChart from './EcgChart';
import Gauge from '../common/Gauge';

// RightPanel 现在接收 analysisData 作为 prop
function RightPanel({ analysisData }) {
  // 如果还没有分析数据，可以显示一个加载状态或什么都不显示
  if (!analysisData) {
    return <div className="right_main"></div>; // 或者一个 Loading... 组件
  }

  // 从 prop 中解构出我们需要的数据
  const { waveform, initialAnalysis } = analysisData;

  // 使用后端传来的真实分析值，但范围等配置信息暂时保留
  const gaugeData = [
    { title: '心率', unit: 'bpm', value: initialAnalysis.Heart_Rate_Mean, min: 40, max: 160, low: 60, high: 100 },
    { title: 'HRV RMSSD', unit: 'ms', value: initialAnalysis.HRV_RMSSD * 1000, min: 0, max: 100, low: 10, high: 50 }, // RMSSD单位是秒，乘以1000变毫秒
    // 其他指标暂时用占位符，因为我们的简化后端没有计算它们
    { title: 'QRS 波群', unit: 'ms', value: 90, min: 60, max: 140, low: 70, high: 110 },
    { title: 'QT 间期', unit: 'ms', value: 425, min: 300, max: 500, low: 340, high: 440 },
    { title: 'P 电轴', unit: '°', value: 45, min: -30, max: 100, low: 0, high: 75 },
    { title: 'T 电轴', unit: '°', value: 60, min: 0, max: 90, low: 15, high: 75 },
  ];

  return (
    <div className="right_main">
      <div className="right_box">
        <div className="right_title">
          <img src="./static/title.png" alt="" />
          实时心电波形图 (ECG)
        </div>
        <div style={{ width: '100%', height: '220px' }}>
          {/* 将后端传来的真实波形数据传递给 EcgChart 组件 */}
          <EcgChart waveformData={waveform} />
        </div>
      </div>
      <div className="right_box">
        <div className="right_title">
          <img src="./static/title.png" alt="" />
          核心心电指标
        </div>
        <div className="gauge-grid-container">
          {gaugeData.map(data => (
            <Gauge
              key={data.title}
              title={data.title}
              unit={data.unit}
              value={data.value}
              min={data.min}
              max={data.max}
              lowThreshold={data.low}
              highThreshold={data.high}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;