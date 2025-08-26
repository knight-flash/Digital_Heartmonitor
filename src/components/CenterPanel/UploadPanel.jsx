// src/components/CenterPanel/UploadPanel.jsx (增加示例文件选项)

import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { analyzeFile } from '../../services/apiService';

function UploadPanel() {
  const { dispatch } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('请上传心电图信号文件 (.mat)');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`已选择文件: ${file.name}`);
    }
  };

  const startAnalyze = async (file) => {
    setIsUploading(true);
    setMessage('正在上传并分析文件，请稍候...');
    try {
      const response = await analyzeFile(file);
      dispatch({
        type: 'START_SESSION',
        payload: {
          sessionId: response.data.session_id,
          initialAnalysis: response.data.initialAnalysis,
          waveform: response.data.waveform,
        },
      });
    } catch (error) {
      console.error('上传或分析失败:', error);
      const errorMessage = error.response?.data?.error || error.message || '未知错误';
      setMessage(`处理失败: ${errorMessage}，请重试。`);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('请先选择一个文件，或选择下面的示例');
      return;
    }
    await startAnalyze(selectedFile);
  };

  // 从public静态路径抓取示例文件并作为File上传
  const handleUseSample = async (url, filename) => {
    try {
      setIsUploading(true);
      setMessage(`正在加载示例文件: ${filename} ...`);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`无法加载示例文件 (${res.status})`);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
      await startAnalyze(file);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
      setMessage(`示例文件加载失败：${e.message}。请确认示例已放到public路径。`);
    }
  };

  const buttonStyle = { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' };
  const disabledStyle = isUploading ? { opacity: 0.6, pointerEvents: 'none' } : {};

  return (
    <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
      <h2>{message}</h2>

      {/* 示例文件快捷选择 */}
      <div style={{ marginTop: '10px' }}>
        <span style={{ fontSize: '14px', color: '#cfe6ff' }}>没有.mat文件？试试示例：</span>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* 注意：请将示例文件放到 public/static/samples/ 目录下 */}
          <button style={{ ...buttonStyle, backgroundColor: '#0B4EC3', color: '#fff', ...disabledStyle }} onClick={() => handleUseSample('/static/samples/A00001.mat', 'A00001.mat')}>示例1</button>
          <button style={{ ...buttonStyle, backgroundColor: '#0B4EC3', color: '#fff', ...disabledStyle }} onClick={() => handleUseSample('/static/samples/A00002.mat', 'A00002.mat')}>示例2</button>
          <button style={{ ...buttonStyle, backgroundColor: '#0B4EC3', color: '#fff', ...disabledStyle }} onClick={() => handleUseSample('/static/samples/A00003.mat', 'A00003.mat')}>示例3</button>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <input id="file-upload" type="file" accept=".mat" onChange={handleFileChange} disabled={isUploading} style={{ display: 'none' }} />
        <label htmlFor="file-upload" style={{ ...buttonStyle, backgroundColor: '#ffffff', color: '#000', marginRight: '10px', ...disabledStyle }}>选择文件</label>
        <button onClick={handleUpload} disabled={isUploading} style={{ ...buttonStyle, backgroundColor: '#ffffff', color: 'black', ...disabledStyle }}>
          {isUploading ? '处理中...' : '开始分析'}
        </button>
      </div>
    </div>
  );
}

export default UploadPanel;