// src/components/RightPanel/EcgChart.jsx

import React, { useRef, useEffect} from 'react';
import * as echarts from 'echarts';

// 新的EcgChart接收一个名为 waveformData 的 prop
function EcgChart({ waveformData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // 用ref来保存chart实例，防止重复初始化

  // 这个 effect 只负责初始化图表和销毁
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);

      const option = {
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { show: false, type: 'category' },
        yAxis: { type: 'value', min: -3, max: 6, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
        series: [{
          name: 'ECG',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#00ffc5', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0, color: 'rgba(0, 255, 197, 0.5)'
            }, {
              offset: 1, color: 'rgba(0, 255, 197, 0)'
            }])
          }
        }]
      };
      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // 这个 effect 负责播放数据
  useEffect(() => {
    // 如果没有数据或者没有图表实例，则不执行
    if (!waveformData || !chartInstance.current) return;

    let currentIndex = 0;
    const pointsToShow = 500; // 图表上一次显示500个点 (5秒的数据)
    const updateFrequency = 40; // 每40毫秒更新一次，实现流畅的滚动效果 (1000ms/40ms = 25fps)

    const timer = setInterval(() => {
      // 从完整数据中切片出当前要显示的部分
      const start = currentIndex;
      const end = start + pointsToShow;
      const displayData = [];

      for (let i = start; i < end; i++) {
        // 循环播放的逻辑
        displayData.push(waveformData[i % waveformData.length]);
      }
      
      chartInstance.current.setOption({
        series: [{
          data: displayData
        }]
      });

      // 移动播放头
      currentIndex += 4; // 每次向前滚动10个点
      if (currentIndex >= waveformData.length) {
        currentIndex = 0; // 播放到末尾，从头开始
      }

    }, updateFrequency);

    // 清理函数
    return () => {
      clearInterval(timer);
    };

  }, [waveformData]); // 依赖项是 waveformData，当它从null变为有数据时，启动播放

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
}

export default EcgChart;