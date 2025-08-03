// src/components/CenterPanel/UploadPanel.jsx

import React, { useState } from 'react';

// 这个组件接收两个 props:
// 1. onUploadSuccess: 一个回调函数，当文件成功上传并获得分析结果后调用。
// 2. setIsLoading: 一个函数，用于通知父组件进入“加载中”状态。
function UploadPanel({ onUploadSuccess, setIsLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('请上传心电图信号文件 (.mat)');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('请先选择一个文件');
      return;
    }

    setIsLoading(true); // 通知父组件，开始加载
    setMessage('正在上传并分析文件，请稍候...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 向我们本地运行的Python后端发送请求
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze`, {
          method: 'POST',
          body: formData,
        });

      if (!response.ok) {
        throw new Error('服务器响应错误');
      }

      const data = await response.json();
      
      // 调用父组件传入的回调函数，并将获取到的数据传递出去
      onUploadSuccess(data);

    } catch (error) {
      console.error('上传或分析失败:', error);
      setMessage(`处理失败: ${error.message}，请重试。`);
      setIsLoading(false); // 加载失败，取消加载状态
    }
  };

  return (
    <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
      <h2>{message}</h2>
      <div style={{ marginTop: '20px' }}>
        <input type="file" accept=".mat" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ color:'black',marginLeft: '10px', padding: '8px 16px' }}>
          开始分析
        </button>
      </div>
    </div>
  );
}

export default UploadPanel;