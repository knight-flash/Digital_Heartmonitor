// src/index.js (修改后)

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SessionProvider } from './context/SessionContext'; // 1. 导入我们创建的Provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. 用 SessionProvider 包裹整个 App */}
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
);

reportWebVitals();