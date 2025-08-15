// src/components/RightPanel/RightPanel.jsx (修改后)

import React from 'react';
import EcgChart from './EcgChart';
import Gauge from '../common/Gauge';
import { useSession } from '../../context/SessionContext'; // 1. 导入useSession

const Placeholder = ({ message }) => (
  <div style={{ color: '#567', textAlign: 'center', paddingTop: '100px', fontSize: '18px' }}>
    {message}
  </div>
);

// 2. 不再需要 analysisData prop
function RightPanel() {
  // 3. 直接从全局Context获取状态
  const { state } = useSession();
  const { initialAnalysis, waveform } = state;

  // 4. 当没有初始分析数据时，显示提示信息
  if (!initialAnalysis) {
    return (
      <div className="right_main">
        <Placeholder message="等待上传文件以显示图表..." />
      </div>
    );
  }

  // 注意：下面的所有逻辑都保持不变，因为它们现在能正确获取到数据了
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
          <img src="/title.png" alt="" />
          实时心电波形图 (ECG)
        </div>
        <div style={{ width: '100%', height: '220px' }}>
          <EcgChart waveformData={waveform} />
        </div>
      </div>
      <div className="right_box">
        <div className="right_title">
          <img src="/title.png" alt="" />
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

export default React.memo(RightPanel);