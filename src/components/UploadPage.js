import React, { useCallback, useRef, useState } from 'react';
import './UploadPage.css';
import {analyzeFile} from "../services/apiService";
import {useSession} from "../utils/SessionContext";

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 仅允许 .mat 文件
const ACCEPT_TYPES = [
  'application/vnd.mathworks.mat',
  'application/x-matlab',
  'application/x-matlab-data',
  'application/matlab',
  'application/octet-stream' // 有些浏览器会把 .mat 标为通用二进制
];
const ACCEPT_EXTS = ['.mat'];

const isAccepted = (file) => {
  if (ACCEPT_TYPES.includes(file.type)) return true;
  const lower = (file.name || '').toLowerCase();
  return ACCEPT_EXTS.some((ext) => lower.endsWith(ext));
};
const MAX_SIZE_MB = 20;
const UploadPage = ({ onAllUploaded, onAnalyze, onAnalyzed }) => {
  const { dispatch } = useSession();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [samplesLocked, setSamplesLocked] = useState(false);

  const onBrowse = () => inputRef.current?.click();

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList);
    const validated = arr.map((file) => {
      let error = '';
      if (!isAccepted(file)) {
        error = '文件类型错误：仅支持 .mat 文件';
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        error = `文件过大，最大 ${MAX_SIZE_MB}MB`;
      }
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
      };
    });
    // 无效文件提示
    const invalid = validated.filter(v => v.status === 'error');
    if (invalid.length > 0) {
      const names = invalid.map(v => `${v.file.name}${v.error ? `（${v.error}）` : ''}`).join('\n');
      window.alert(`以下文件无法上传：\n${names}`);
    }
    setFiles((prev) => {
      const map = new Map(prev.map((f) => [f.id, f]));
      validated.forEach((v) => map.set(v.id, v));
      return Array.from(map.values());
    });
    // 自动开始上传有效文件（直接传入 File，避免 setState 异步导致找不到）
    validated.filter(v => v.status === 'pending').forEach(v => startUpload(v.file, v.id));
  }, []);

  const onInputChange = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    // 允许选择同一文件时也能触发变更
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  // 选择示例文件进行分析（命名避免以 use 开头，防止 hooks 规则误判）
  const handleSampleClick = async (fileName, url) => {
    if (samplesLocked) return;
    setSamplesLocked(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'application/octet-stream' });
      const id = `${file.name}-${file.size}-${Date.now()}`;
      const sampleEntry = { id, file, progress: 0, status: 'pending', error: '' };
      setFiles((prev) => [...prev, sampleEntry]);
      await startUpload(file, id);
    } catch (e) {
      window.alert('示例文件加载失败，请稍后重试');
      setSamplesLocked(false);
    }
  };

  const startUpload = async (file, id) => {
    // 标记开始
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0, error: '' } : f)));

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
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'success', progress: 100 } : f)));
      // 每次成功上传后，立即通知父组件跳转
      if (onAllUploaded) onAllUploaded();
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error?.message || '未知错误';
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'error', error: errorMessage } : f)));
    }
  };

  // 全部上传完成后通知父组件（至少一个成功，且无 pending/uploading）
  const notifiedRef = useRef(false);
  React.useEffect(() => {
    if (notifiedRef.current) return;
    if (files.length === 0) return;
    const hasSuccess = files.some((f) => f.status === 'success');
    const hasActive = files.some((f) => f.status === 'pending' || f.status === 'uploading');
    if (hasSuccess && !hasActive) {
      notifiedRef.current = true;
      if (onAllUploaded) onAllUploaded();
    }
  }, [files, onAllUploaded]);

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="upload-page">
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="file-input"
          onChange={onInputChange}
          accept={ACCEPT_EXTS.join(',')}
        />
        <div className="dropzone-inner">
          <div className="drop-icon">⬆️</div>
          <div className="drop-title">拖拽文件到此处，或点击选择</div>
          <div className="drop-subtitle">仅支持 .mat 文件，单文件不超过 {MAX_SIZE_MB}MB</div>
        </div>
      </div>

      {/* 示例文件快捷入口（将示例 .mat 放在 public/samples/ 目录）*/}
      <div className="file-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
        <span style={{ color: '#64748b', fontSize: 12 }}>示例文件：</span>
        <button className="sample-btn" disabled={samplesLocked} onClick={() => handleSampleClick('A00001.mat', '/samples/A00001.mat')}>A00001.mat</button>
        <button className="sample-btn" disabled={samplesLocked} onClick={() => handleSampleClick('A00002.mat', '/samples/A00002.mat')}>A00002.mat</button>
        <button className="sample-btn" disabled={samplesLocked} onClick={() => handleSampleClick('A00003.mat', '/samples/A00003.mat')}>A00003.mat</button>
      </div>

      {/* 移除了上传全部按钮 */}

      <div className="file-list">
        {files.map(({ id, file, status, error }) => (
          <div key={id} className={`file-item ${status}`}>
            <div className="file-meta">
              <div className="file-icon">📄</div>
              <div className="file-info">
                <div className="file-name" title={file.name}>{file.name}</div>
                <div className="file-sub">{file.type || '未知类型'} · {formatBytes(file.size)}</div>
              </div>
              <div className="file-ops">
                {status === 'pending' && <button className="link" onClick={() => startUpload(file, id)}>上传</button>}
                <button className="link danger" disabled={status === 'uploading'} onClick={() => removeFile(id)}>删除</button>
              </div>
            </div>
            {status === 'uploading' && (
              <div className="file-uploading">
                <span className="spinner" />
                <span>上传中...</span>
              </div>
            )}
            {/* 已移除进度条显示 */}
            {status === 'error' && <div className="file-error">{error}</div>}
            {status === 'success' && <div className="file-success">上传完成</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadPage;



