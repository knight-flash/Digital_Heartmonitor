// 分享工具函数

/**
 * 序列化会话数据为可分享的格式
 * @param {Object} sessionData - 会话数据
 * @param {Array} selectedConversations - 选中的对话记录
 * @returns {Object} 序列化后的数据
 */
export const serializeSessionData = (sessionData, selectedConversations = null) => {
  const {
    sessionStatus,
    sessionId,
    initialAnalysis,
    waveform,
    report,
    chatHistory
  } = sessionData;

  // 如果指定了选中的对话，只包含这些对话
  let filteredChatHistory = chatHistory;
  if (selectedConversations && selectedConversations.length > 0) {
    filteredChatHistory = [];
    
    // 遍历选中的对话，提取用户消息和对应的机器人回复
    selectedConversations.forEach(conversation => {
      // 添加用户消息
      filteredChatHistory.push(conversation.userMessage);
      
      // 添加对应的机器人回复（如果存在）
      if (conversation.botMessage) {
        filteredChatHistory.push(conversation.botMessage);
      }
    });
  }

  return {
    version: '1.0',
    timestamp: Date.now(),
    sessionStatus,
    sessionId,
    initialAnalysis,
    waveform,
    report,
    chatHistory: filteredChatHistory,
    metadata: {
      totalConversations: selectedConversations ? selectedConversations.length : 0,
      originalChatCount: chatHistory.length
    }
  };
};

/**
 * 生成分享链接
 * @param {Object} serializedData - 序列化后的数据
 * @returns {string} 分享链接
 */
export const generateShareLink = (serializedData) => {
  try {
    console.log('开始生成分享链接，数据:', serializedData);
    
    // 验证数据
    if (!serializedData) {
      throw new Error('序列化数据为空');
    }
    
    // 压缩数据
    const compressedData = compressData(serializedData);
    console.log('数据压缩完成，长度:', compressedData.length);
    
    // 生成分享ID（使用时间戳+随机数）
    const shareId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('生成的分享ID:', shareId);
    
    // 构建分享链接
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${shareId}`;
    console.log('构建的分享链接:', shareUrl);
    
    // 将数据存储到localStorage（实际应用中应该存储到服务器）
    try {
      localStorage.setItem(`share_${shareId}`, compressedData);
      console.log('数据已存储到localStorage');
    } catch (storageError) {
      console.error('存储到localStorage失败:', storageError);
      throw new Error('数据存储失败，可能是数据过大');
    }
    
    return shareUrl;
  } catch (error) {
    console.error('生成分享链接失败:', error);
    throw new Error(`生成分享链接失败: ${error.message}`);
  }
};

/**
 * 压缩数据（简单的Base64编码）
 * @param {Object} data - 要压缩的数据
 * @returns {string} 压缩后的字符串
 */
const compressData = (data) => {
  try {
    console.log('开始压缩数据...');
    const jsonString = JSON.stringify(data);
    console.log('JSON字符串长度:', jsonString.length);
    
    const compressed = btoa(unescape(encodeURIComponent(jsonString)));
    console.log('压缩完成，压缩后长度:', compressed.length);
    
    return compressed;
  } catch (error) {
    console.error('数据压缩失败:', error);
    throw new Error(`数据压缩失败: ${error.message}`);
  }
};

/**
 * 解压数据
 * @param {string} compressedData - 压缩后的字符串
 * @returns {Object} 解压后的数据
 */
const decompressData = (compressedData) => {
  try {
    const jsonString = decodeURIComponent(escape(atob(compressedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('解压数据失败:', error);
    throw new Error('数据格式错误');
  }
};

/**
 * 从分享链接解析数据
 * @param {string} shareId - 分享ID
 * @returns {Object} 解析后的会话数据
 */
export const parseShareData = (shareId) => {
  try {
    const compressedData = localStorage.getItem(`share_${shareId}`);
    if (!compressedData) {
      throw new Error('分享链接不存在或已过期');
    }
    
    const data = decompressData(compressedData);
    
    // 验证数据格式
    if (!data.version || !data.timestamp) {
      throw new Error('数据格式错误');
    }
    
    return data;
  } catch (error) {
    console.error('解析分享数据失败:', error);
    throw error;
  }
};

/**
 * 检查URL是否为分享链接
 * @param {string} url - 要检查的URL
 * @returns {Object|null} 如果是分享链接返回{shareId, isShareLink: true}，否则返回null
 */
export const checkShareUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    if (pathParts[1] === 'share' && pathParts[2]) {
      return {
        shareId: pathParts[2],
        isShareLink: true
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * 从当前URL获取分享ID
 * @returns {string|null} 分享ID，如果不是分享链接则返回null
 */
export const getShareIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  if (pathParts[1] === 'share' && pathParts[2]) {
    return pathParts[2];
  }
  return null;
};

/**
 * 清理过期的分享数据（可选功能）
 * @param {number} maxAge - 最大保存时间（毫秒），默认7天
 */
export const cleanupExpiredShares = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (key.startsWith('share_')) {
      try {
        const compressedData = localStorage.getItem(key);
        const data = decompressData(compressedData);
        
        if (now - data.timestamp > maxAge) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // 如果数据损坏，直接删除
        localStorage.removeItem(key);
      }
    }
  });
};

/**
 * 生成仅包含会话和消息ID的分享链接（Base64编码在查询参数中）
 * @param {string} sessionId
 * @param {Array<string|number>} messageIds
 * @returns {string}
 */
export const generateEncShareLink = (sessionId, messageIds) => {
  if (!sessionId || !Array.isArray(messageIds) || messageIds.length === 0) {
    throw new Error('缺少必要参数：sessionId 或 messageIds');
  }
  const payload = { sessionId, messageIds };
  const token = compressData(payload);
  const baseUrl = window.location.origin;
  return `${baseUrl}/share?s=${encodeURIComponent(token)}`;
};

/**
 * 从当前URL解析分享查询参数并解码
 * @returns {{sessionId: string, messageIds: Array<string|number>} | null}
 */
export const parseEncShareFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('s');
  if (!token) return null;
  try {
    const jsonString = decodeURIComponent(escape(atob(token)));
    const data = JSON.parse(jsonString);
    if (!data.sessionId || !Array.isArray(data.messageIds)) return null;
    return data;
  } catch (e) {
    console.error('解析分享参数失败', e);
    return null;
  }
};
