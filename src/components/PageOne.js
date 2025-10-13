import React, {useEffect, useRef, useState} from 'react';
import EcgChart from "../utils/EcgChart";
import SingleCircularGauge from "../utils/SingleCircularGauge";
import RadarChart from "../utils/RadarChart";
import {useSession} from "../utils/SessionContext";

const PageOne = () => {

    const { state } = useSession();
    const { sessionStatus, waveform, initialAnalysis,gifBinary } = state;
    const [activeVideo, setActiveVideo] = useState(1);
    const [containerHeight, setContainerHeight] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const video1Ref = useRef(null);
    const containerRef = useRef(null);
    const calculationTimeoutRef = useRef(null);
    const lastCalculatedHeight = useRef(0);

    useEffect(() => {
        if (sessionStatus === 'generating_report' || sessionStatus === 'ready') {
            const videoElement = video1Ref.current;
            if (!videoElement) return;

            const handleVideoEnd = () => {
                setActiveVideo(2);
            };

            videoElement.addEventListener('ended', handleVideoEnd);

            return () => {
                if (videoElement) {
                    videoElement.removeEventListener('ended', handleVideoEnd);
                }
            };
        }
    }, [sessionStatus]);

    // 优化的高度计算逻辑 - 防抖和智能更新
    useEffect(() => {
        const calculateHeight = () => {
            if (!containerRef.current || isCalculating) return;
            
            setIsCalculating(true);
            
            // 使用requestAnimationFrame确保在下一帧计算
            requestAnimationFrame(() => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const parentHeight = rect.height;
                    
                    // 只有当高度真正变化时才更新状态
                    if (parentHeight > 0) {
                        const availableHeight = parentHeight - 40; // 20px padding * 2
                        const cardHeight = Math.max(availableHeight / 2, 200); // 最小高度200px
                        
                        // 直接更新高度，确保立即显示
                        lastCalculatedHeight.current = cardHeight;
                        setContainerHeight(cardHeight);
                        
                        // 标记为已初始化，避免后续的闪烁
                        if (!isInitialized) {
                            setIsInitialized(true);
                        }
                    }
                }
                setIsCalculating(false);
            });
        };

        // 防抖函数
        const debouncedCalculateHeight = () => {
            if (calculationTimeoutRef.current) {
                clearTimeout(calculationTimeoutRef.current);
            }
            calculationTimeoutRef.current = setTimeout(calculateHeight, 50);
        };

        // 初始计算 - 只计算一次
        const initialCalculate = () => {
            if (containerRef.current) {
                calculateHeight();
            } else {
                // 如果容器还没准备好，延迟计算
                setTimeout(() => {
                    if (containerRef.current) {
                        calculateHeight();
                    }
                }, 100);
            }
        };

        // 立即初始计算，确保DOM完全渲染
        setTimeout(initialCalculate, 0);

        // 监听窗口大小变化 - 使用防抖
        const handleResize = debouncedCalculateHeight;
        window.addEventListener('resize', handleResize);

        // 简化MutationObserver - 只在必要时触发
        const observer = new MutationObserver(() => {
            debouncedCalculateHeight();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current, {
                attributes: true,
                attributeFilter: ['style']
            });
        }

        // 监听页面可见性变化
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                debouncedCalculateHeight();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
            if (calculationTimeoutRef.current) {
                clearTimeout(calculationTimeoutRef.current);
            }
        };
    }, [isCalculating]);

    // 准备心率数据（圆环进度条）
    const heartRateData = initialAnalysis ? {
        title: '心率',
        unit: 'bpm',
        value: initialAnalysis.HR,
        min: 40,
        max: 160,
        low: 60,
        high: 100
    } : null;

    // 准备雷达图数据（活力值、压力值、情绪值、疲劳值、心率变异性）
    const radarData = initialAnalysis ? [
        { title: '活力值', unit: '', value: initialAnalysis.Vitality, min: 0, max: 100, low: 30, high: 70 },
        { title: '压力值', unit: '', value: initialAnalysis.Pressure, min: 0, max: 100, low: 30, high: 70 },
        { title: '情绪值', unit: '', value: initialAnalysis.Emotion, min: 0, max: 100, low: 30, high: 70 },
        { title: '疲劳值', unit: '', value: initialAnalysis.Fatigue, min: 0, max: 100, low: 30, high: 70 },
        { title: '心率变异性', unit: 'HRV', value:initialAnalysis.HRV, min: 0, max: 100, low: 20, high: 60 },
    ] : [];
    return (
        <div className="center_main" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div ref={containerRef} className="center_top" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '0 20px',
                boxSizing: 'border-box',
                gap: '20px'
            }}>
                {/* 上半部分：心脏视频和心电图 - 向上移动并缩小宽度 */}
                <div style={{
                    width: '85%',
                    height: isInitialized && containerHeight > 0 ? `${containerHeight}px` : '300px',
                    minHeight: '200px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    padding: '15px',
                    boxSizing: 'border-box',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                    {/* 左侧：心脏视频 */}
                    <div style={{
                        width: '48%', // 稍微增加心脏视频宽度
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        backgroundColor: '#1a2f3d'
                    }}>
                        <div id="video-container-1" style={{ width: '100%', height: '100%', display: activeVideo === 1 ? 'block' : 'none' }}>
                            <img
                                src={`data:image/gif;base64,${gifBinary}`}
                                alt="ECG 动图"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        {/*<div id="video-container-1" style={{ width: '100%', height: '100%', display: activeVideo === 1 ? 'block' : 'none' }}>*/}
                        {/*    <video ref={video1Ref} id="heart-video-1" width="100%" height="100%" muted autoPlay playsInline style={{ objectFit: 'cover' }}>*/}
                        {/*        <source src={heartVideo} type="video/mp4" />*/}
                        {/*    </video>*/}
                        {/*</div>*/}
                        {/*<div id="video-container-2" style={{ width: '100%', height: '100%', display: activeVideo === 2 ? 'block' : 'none', position: 'absolute', top: 0, left: 0 }}>*/}
                        {/*    <video id="heart-video-2" width="100%" height="100%" muted loop autoPlay playsInline style={{ objectFit: 'cover' }}>*/}
                        {/*        <source src={heartVideoLoop} type="video/mp4" />*/}
                        {/*    </video>*/}
                        {/*</div>*/}
                    </div>

                    {/* 右侧：实时心电图 - 更靠近心脏 */}
                    <div style={{
                        width: '48%', // 稍微增加心电图宽度
                        height: '100%',
                        borderRadius: '8px',
                        padding: '10px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            实时心电波形图 (ECG)
                        </div>
                        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                            <EcgChart waveformData={(waveform && (waveform.data || waveform)) || []} />
                        </div>
                    </div>
                </div>

                {/* 下半部分：核心心电指标 - 分成两部分 */}
                <div style={{
                    width: '85%',
                    height: isInitialized && containerHeight > 0 ? `${containerHeight}px` : '300px',
                    minHeight: '200px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    padding: '15px',
                    boxSizing: 'border-box',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}>
                    {/* 左侧：心率圆环进度条 */}
                    <div style={{
                        width: '40%', // 从45%减少到40%，为右侧留出更多空间
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            心率监测
                        </div>
                        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                            {heartRateData && <SingleCircularGauge {...heartRateData} />}
                        </div>
                    </div>

                    {/* 右侧：其他指标雷达图 */}
                    <div style={{
                        width: '60%', // 放大到60%，让右侧占满
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '600',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            健康指标分析
                        </div>
                        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                            <RadarChart data={radarData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageOne;
