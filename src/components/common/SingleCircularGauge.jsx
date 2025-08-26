// src/components/common/SingleCircularGauge.jsx
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

function SingleCircularGauge({ title, value, unit, min, max, low, high }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const range = max - min;
      const lowPercent = (low - min) / range;
      const highPercent = (high - min) / range;

      const option = {
        series: [
          {
            type: 'gauge',
            center: ['50%', '60%'], // 调整位置
            radius: '70%', // 从90%减少到70%，让半圆更小
            startAngle: 200,
            endAngle: -20,
            min: min,
            max: max,
            splitNumber: 5,
            itemStyle: {
              color: '#58D68D' // 指针颜色
            },
            progress: {
              show: true,
              width: 8, // 从10减少到8，让进度条更细
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#58D68D' }, // 绿色
                  { offset: 1, color: '#58D68D' }
                ])
              }
            },
            pointer: {
              show: false // 隐藏指针
            },
            axisLine: {
              lineStyle: {
                width: 8, // 从10减少到8，让轴线更细
                color: [
                  [lowPercent, '#F5B041'],    // 橙色 - 低值区间
                  [highPercent, '#58D68D'],   // 绿色 - 正常区间
                  [1, '#E74C3C']              // 红色 - 高值区间
                ]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            title: {
              offsetCenter: [0, '10%'], // 标题位置
              fontSize: 14,
              color: '#fff'
            },
            detail: {
              fontSize: 18, // 从20减少到18，让数字稍小
              offsetCenter: [0, '-20%'], // 数值位置
              valueAnimation: true,
              formatter: function (value) {
                return value + (unit ? ' ' + unit : '');
              },
              color: 'auto' // 数字颜色跟随指针颜色
            },
            data: [
              {
                value: value,
                name: title
              }
            ]
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [title, value, unit, min, max, low, high]);

  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>;
}

export default SingleCircularGauge; 