// src/components/RightPanel/RightPanel.jsx (调整底部对齐)

import React from 'react';
import AnalysisReport from '../CenterPanel/AnalysisReport';
import { useSession } from '../../context/SessionContext';

const Placeholder = ({ message }) => (
  <div style={{ color: '#567', textAlign: 'center', paddingTop: '100px', fontSize: '18px' }}>
    {message}
  </div>
);

function RightPanel() {
  const { state } = useSession();
  const { sessionStatus } = state;

  if (sessionStatus === 'idle') {
    return (
      <div className="right_main">
        <Placeholder message="" />
      </div>
    );
  }

  return (
    <div className="right_main" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="right_box" style={{ 
        height: '103%',
        margin: 0,
        marginTop:'-20px',
        marginLeft: '-40px'
      }}>
        <AnalysisReport />
      </div>
    </div>
  );
}

export default React.memo(RightPanel);