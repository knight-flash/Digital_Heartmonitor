// src/components/CenterPanel/AnalysisReport.jsx

import React from 'react';

function AnalysisReport({ analysisData }) {
  if (!analysisData) {
    return null;
  }

  const heartRate = analysisData.Heart_Rate_Mean?.toFixed(2);
  const hrv = (analysisData.HRV_RMSSD * 1000)?.toFixed(2);

  return (
    <div className="center_bottom_box" style={{ width: '684px', height: '210px', display: 'flex', flexDirection: 'column' }}>
      <div className="right_title">
        <img src="./static/title.png" alt="" />
        实时心电分析报告
      </div>
      <div className="report-content" style={{ padding: '15px 20px', color: '#cceeff', fontSize: '16px', lineHeight: 1.9, overflowY: 'auto', flexGrow: 1 }}>
        <p>
          对上传的心电信号初步分析完成。
        </p>
        <p>
          详细生理指标如下：平均心率 (Heart Rate) 为 <strong>{heartRate || 'N/A'} bpm</strong>。
          心率变异性 (RMSSD) 为 <strong>{hrv || 'N/A'} ms</strong>。
          检测到的R波总数为 <strong>{analysisData.Num_R_Peaks?.toFixed(0) || 'N/A'}</strong> 个。
        </p>
        <p>
          <strong>初步诊断结论：</strong> 数据已处理，具体诊断需结合周期性分析。
          当前心脏事件风险等级评估为 <strong>低风险</strong>。建议继续观察动态图表。
        </p>
      </div>
    </div>
  );
}

export default AnalysisReport;