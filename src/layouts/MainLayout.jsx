// src/layouts/MainLayout.jsx (修改后)

import React from 'react';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import CenterPanel from '../components/CenterPanel/CenterPanel';
import RightPanel from '../components/RightPanel/RightPanel';

// 不再需要接收或传递任何props
function MainLayout() {
  return (
    <div className="main">
      <ChatPanel />
      <CenterPanel />
      <RightPanel />
    </div>
  );
}

export default MainLayout;