import React, {useEffect, useState} from 'react';
import './Header.css';

const Header = () => {

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. 【设置副作用】使用 useEffect 来启动定时器
  useEffect(() => {
    // 这个函数会在组件首次渲染后执行
    const timerId = setInterval(() => {
      // 每隔1000毫秒（1秒），调用 setCurrentTime 更新状态
      setCurrentTime(new Date());
    }, 1000);

    // 3. 【清理副作用】useEffect 的返回函数
    //    这个函数会在组件卸载时执行
    return () => {
      clearInterval(timerId); // 清除定时器，防止内存泄漏
    };
  }, []); // 空数组 [] 告诉 React 这个 effect 只需在挂载时运行一次
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💬</span>
            <span className="logo-text">数字心脏监测系统7</span>
          </div>
        </div>
        
        <div className="header-center">
          <h1 className="app-title"> {formatDateTime(currentTime)}</h1>
        </div>
        
        <div className="header-right">
          <div className="institution-info">
            <div className="institution-line">血管稳态与重构全国重点实验室</div>
            <div className="institution-line">北京大学健康医疗大数据国家研究院</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
