// src/components/common/RadarChart.jsx

import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

function RadarChart({ data }) {
  const getOption = () => {
    // 准备雷达图数据
    const indicators = data.map(item => ({
      name: item.title,
      max: item.max,
      min: item.min
    }));

    const values = data.map(item => item.value);

    // 计算颜色区间
    const getColorByValue = (value, min, max, low, high) => {
      if (value < low) return '#F5B041'; // 橙色 - 低值
      if (value > high) return '#E74C3C'; // 红色 - 高值
      return '#58D68D'; // 绿色 - 正常值
    };

    const colors = data.map(item => 
      getColorByValue(item.value, item.min, item.max, item.low, item.high)
    );

    return {
      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      radar: {
        indicator: indicators,
        radius: '50%',
        center: ['50%', '50%'],
        splitNumber: 4,
        axisName: {
          color: '#000',
          fontSize: 11,
          fontWeight: 'bold',
          padding: [3, 5],
          overflow: 'break',
          formatter: function(value, indicator) {
            const index = indicators.findIndex(item => item.name === value);
            const item = data[index];
            const color = getColorByValue(item.value, item.min, item.max, item.low, item.high);
            // 根据是否有单位来决定显示格式
            const scoreText = item.unit ? `${item.value} (${item.unit})` : `${item.value}`;
            return [
              `{color|${value}}`,
              `{score|${scoreText}}`
            ].join('\n');
          },
          rich: {
            color: {
              color: '#000',
              fontSize: 11,
              fontWeight: 'bold'
            },
            score: {
              color: '#000',
              fontSize: 12,
              fontWeight: 'bold',
              padding: [5, 0, 0, 0]
            }
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.15)'
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.25)'
          }
        }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: values,
              name: '心电指标',
              itemStyle: {
                color: '#00ffc5'
              },
              areaStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: 'rgba(0, 255, 197, 0.3)' },
                  { offset: 1, color: 'rgba(0, 255, 197, 0.1)' }
                ])
              },
              lineStyle: {
                width: 2,
                color: '#00ffc5'
              }
            }
          ]
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          // 直接使用params中的值，确保与雷达图显示一致
          const value = params.value;
          const name = params.name;
          
          // 根据名称找到对应的数据项
          const item = data.find(item => item.title === name);
          if (!item) return '';
          
          const color = getColorByValue(item.value, item.min, item.max, item.low, item.high);
          // 根据是否有单位来决定显示格式，与标签下面保持一致
          const scoreText = item.unit ? `${value} (${item.unit})` : `${value}`;
          const rangeText = item.unit ? `${item.low} - ${item.high} (${item.unit})` : `${item.low} - ${item.high}`;
          
          return `
            <div style="color: #fff;">
              <div style="font-weight: bold; margin-bottom: 5px;">${name}</div>
              <div style="color: ${color}; font-size: 16px; font-weight: bold;">
                ${scoreText}
              </div>
              <div style="font-size: 12px; margin-top: 5px;">
                正常范围: ${rangeText}
              </div>
            </div>
          `;
        }
      }
    };
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactECharts option={getOption()} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default RadarChart; 