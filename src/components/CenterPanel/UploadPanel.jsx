// src/components/CenterPanel/UploadPanel.jsx (修改后)

import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext'; // 1. 导入useSession
import { analyzeFile } from '../../services/apiService'; // 2. 导入新的API函数

// 3. 不再需要任何props
function UploadPanel() {
  const { dispatch } = useSession(); // 4. 获取dispatch函数
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('请上传心电图信号文件 (.mat)');
  const [isUploading, setIsUploading] = useState(false); // 使用本地loading状态

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`已选择文件: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('请先选择一个文件');
      return;
    }

    setIsUploading(true);
    setMessage('正在上传并分析文件，请稍候...');

    try {
      // 5. 调用新的、统一的API服务函数
      const response = await analyzeFile(selectedFile);

      // 6. 【核心】文件上传成功后，派发一个全局的 'START_SESSION' 动作
      dispatch({
        type: 'START_SESSION',
        payload: {
          sessionId: response.data.session_id,
          initialAnalysis: response.data.initialAnalysis,
          waveform: response.data.waveform
        }
      });
      // 注意：成功后我们不再需要做任何事，因为后续流程已由App.js中的轮询接管

    } catch (error) {
      console.error('上传或分析失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '未知错误';
      setMessage(`处理失败: ${errorMessage}，请重试。`);
      dispatch({ type: 'SET_ERROR', payload: errorMessage }); // 也可以派发一个全局错误
      setIsUploading(false);
    }
    // 注意：这里的isUploading状态不会再重置为false，因为成功后整个视图会切换
  };

  return (
    <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
      <h2>{message}</h2>
      <div style={{ marginTop: '20px' }}>
        <input type="file" accept=".mat" onChange={handleFileChange} disabled={isUploading} />
        <button onClick={handleUpload} disabled={isUploading} style={{ color:'black',marginLeft: '10px', padding: '8px 16px' }}>
          {isUploading ? '处理中...' : '开始分析'}
        </button>
      </div>
    </div>
  );
}

export default UploadPanel;