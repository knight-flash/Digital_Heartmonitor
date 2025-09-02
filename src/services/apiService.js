// src/services/apiService.js

import axios from 'axios';

// 1. 创建一个axios实例，集中配置后端API的基础URL
const apiClient = axios.create({
  baseURL: 'https://digitalheart.heartvoice.com.cn', // 从环境变量读取后端地址
  //  baseURL: 'http://localhost:5001', // 从环境变量读取后端地址
  timeout: 60000, // 设置请求超时时间（例如60秒）
});

/**
 * @description 上传.mat文件并发起分析，对应新的 /analyze 接口
 * @param {File} file - 用户选择的.mat文件
 * @returns {Promise<Object>} - 包含 sessionId, status, waveform, initialAnalysis 的对象
 */
export const analyzeFile = (file) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' 必须与后端接口要求的字段名一致

  return apiClient.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * @description 根据 session_id 查询会话状态，对应新的 /session-status/:session_id 接口
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} - 包含 status 和 report (如果已就绪) 的对象
 */
export const getSessionStatus = (sessionId) => {
  return apiClient.get(`/session-status/${sessionId}`);
};

/**
 * @description 向智能代理发送消息，对应新的 /agent 接口
 * @param {string} sessionId - 会话ID
 * @param {string} prompt - 用户的原始提问
 * @returns {Promise<Object>} - 包含AI回复的对象
 */
export const postToAgent = (sessionId, prompt) => {
  const payload = {
    session_id: sessionId,
    prompt: prompt,
  };
  return apiClient.post('/agent', payload);
};