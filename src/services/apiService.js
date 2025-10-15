// src/services/apiService.js

import axios from 'axios';

// 1. 创建一个axios实例，集中配置后端API的基础UR
const apiClient = axios.create({
  baseURL: 'https://digitalheart.heartvoice.com.cn', // 从环境变量读取后端地址
  //  baseURL: 'http://localhost:5001', // 从环境变量读取后端地址
  timeout: 600000, // 设置请求超时时间（例如60秒）
});

// const apiClientPlus = axios.create({
//   // baseURL: 'http://localhost:5842', // 从环境变量读取后端地址
//   baseURL: 'https://www.heartvoice.com.cn/sfpdf', // 从环境变量读取后端地址
//   // timeout: 60000, // 设置请求超时时间（例如60秒）
// });

const apiClientPlus = axios.create({
  baseURL: '', // 相对路径，与代理的 /sfpdf 匹配
  timeout: 60000,
  withCredentials: true // 若需要携带凭证
});


/**
 * @description 上传.mat文件并发起分析，对应新的 /analyze 接口
 * @param {File} file - 用户选择的.mat文件
 * @returns {Promise<Object>} - 包含 sessionId, status, waveform, initialAnalysis 的对象
 */
export const analyzeFile = (file) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' 必须与后端接口要求的字段名一
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

/**
 * @description 保存一次问答记录到后端
 * @param {string} sessionId - 会话ID
 * @param {string} question - 用户问题
 * @param {string} suggestions - 建议
 * @param {string} messageId - 消息的id
 * @param {string} rightPanelData - 右边pageOne的数据
 * @param {string} answer - 机器人回答
 * @returns {Promise<Object>} - 后端保存结果
 */
export const saveConversation = (sessionId, question,suggestions, answer, messageId, rightPanelData = {}) => {
  const payload = {
    sessionId,
    question,
    answer,
    messageId,
    suggestions:suggestions,
    // 右侧面板相关数据（可选）
    initialAnalysis: rightPanelData.initialAnalysis ?? undefined,
    waveform: rightPanelData.waveform ?? undefined,
    report: rightPanelData.report ?? undefined,
    ecgEhco: rightPanelData.gifBinary ?? undefined,
  };
  // 请根据后端实际路径调整此接口地址
  return apiClientPlus.post('/sfpdf/digitalHeart/saveMessage', payload);
};

/**
 * @description 根据 sessionId + messageIds 从后端获取分享所需的完整数据
 * @param {string} sessionId
 * @param {Array<string|number>} messageIds
 */
export const fetchSharedData = (sessionId, messageIds) => {
  return apiClientPlus.post('/sfpdf/digitalHeart/getMessage', {
    sessionId,
    messageIds,
  });
};

/**
 * @description 保存点赞/点踩结果
 * @param {string} sessionId
 * @param {string|number} messageId - 机器人消息ID
 * @param {('like'|'dislike'|'none')} reaction
 */
export const saveReaction = (sessionId, messageId, reaction) => {
  const payload = { sessionId, messageId, reaction };
  return apiClientPlus.post('/sfpdf/digitalHeart/saveReaction', payload);
};