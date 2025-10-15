const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

    // 新增：apiClientPlus 的代理（针对 sfpdf 相关接口）
    app.use(
        '/sfpdf', // 假设 apiClientPlus 的请求路径包含 /sfpdf（需与实际接口匹配）
        createProxyMiddleware({
            target: 'https://www.heartvoice.com.cn', // 代理到目标域名
            changeOrigin: true,
            // 可选：如果接口路径不需要额外前缀，可省略 pathRewrite
            // pathRewrite: { '^/sfpdf': '/sfpdf' }
        })
    );
};