// src/components/RightPanel/RightPanel.jsx (最终确认版)

import React from 'react';
import EcgChart from './EcgChart';
import Gauge from '../common/Gauge'; // 假设 Gauge 组件在同级目录

// 这是一个简单的占位/加载组件
const Placeholder = ({ message }) => (
  <div style={{ color: '#567', textAlign: 'center', paddingTop: '100px', fontSize: '18px' }}>
    {message}
  </div>
);

function RightPanel({ analysisData }) {
  // 【优化1】当没有数据时，显示明确的提示信息
  if (!analysisData) {
    return (
      <div className="right_main">
        <Placeholder message="等待上传文件以显示图表..." />
      </div>
    );
  }

  const { waveform, initialAnalysis } = analysisData;

  const gaugeData = [
    { title: '心率', unit: 'bpm', value: initialAnalysis.HR, min: 40, max: 160, low: 60, high: 100 },
    { title: '压力值', unit: '', value: initialAnalysis.Pressure, min: 0, max: 100, low: 30, high: 70 },
    { title: '心率变异性', unit: 'HRV', value: initialAnalysis.HRV, min: 0, max: 100, low: 20, high: 60 },
    { title: '情绪值', unit: '', value: initialAnalysis.Emotion, min: 0, max: 100, low: 30, high: 70 },
    { title: '疲劳值', unit: '', value: initialAnalysis.Fatigue, min: 0, max: 100, low: 30, high: 70 },
    { title: '活力值', unit: '', value: initialAnalysis.Vitality, min: 0, max: 100, low: 30, high: 70 },
  ];

  return (
    <div className="right_main">
      <div className="right_box">
        <div className="right_title">
          <img src="./static/title.png" alt="" />
          实时心电波形图 (ECG)
        </div>
        <div style={{ width: '100%', height: '220px' }}>
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

// 【优化2】使用 React.memo 包裹组件
// 只要传入的 analysisData 没有发生变化，React就会跳过对这个组件的重新渲染
export default React.memo(RightPanel);