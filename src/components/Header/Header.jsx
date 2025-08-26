import React, { useState, useEffect } from 'react';

// 这是一个辅助函数，用于将Date对象格式化为您期望的 "YYYY-MM-DD HH:MM:SS" 格式
const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function Header() {
  // 1. 【创建状态】使用 useState 创建一个状态变量 `currentTime` 来存储时间
  //    它的初始值是当前的Date对象
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
    <div className="header">
      <span className="title">数字心脏监测系统</span>
      {/* 4. 【渲染UI】从状态中读取时间并格式化显示 */}
      <span className="time" id="show_time">
        {formatDateTime(currentTime)}
      </span>
      <span className="desc">
        北京大学健康医疗大数据国家研究院：
        <a href="http://dshm.bjmu.edu.cn">Website</a>
      </span>
    </div>
  );
}

export default Header;