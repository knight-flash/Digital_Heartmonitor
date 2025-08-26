// src/components/RightPanel/Gauge.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';

// 我们将原index.html中的 getGaugeOption 函数逻辑移入组件内部
// 并让它从 props 中获取所有动态数据
function Gauge({ title, value, unit = '', min, max, lowThreshold, highThreshold }) {

  const getOption = () => {
    const range = max - min;
    const lowPercent = (lowThreshold - min) / range;
    const highPercent = (highThreshold - min) / range;

    return {
      series: [{
        type: 'gauge',
        min: min,
        max: max,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [lowPercent, '#F5B041'],
              [highPercent, '#58D68D'],
              [1, '#E74C3C']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 6,
          offsetCenter: [0, '-50%'],
          itemStyle: { color: 'auto' }
        },
        axisTick: { distance: -15, length: 10, lineStyle: { color: '#fff', width: 1 } },
        splitLine: { distance: -15, length: 15, lineStyle: { color: '#fff', width: 2 } },
        axisLabel: { show: false }, // 刻度标签默认不显示，保持简洁
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 20,
          color: 'auto',
          offsetCenter: [0, '70%'],
          formatter: `{value}`
        },
        data: [{ value: value.toFixed(1) }]
      }]
    };
  };

  return (
    <div className="gauge-item">
      {/* 使用 echarts-for-react 组件，传入配置即可 */}
      <ReactECharts option={getOption()} style={{ height: '120px', width: '100%' }} />
      {/* 标题从 props 中动态获取 */}
      <div className="gauge-title">{title} ({unit})</div>
    </div>
  );
}

export default Gauge;