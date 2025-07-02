const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

console.log("🚀 API Gateway starting...");

function dynamicRewrite(prefix, servicePath) {
  return (path, req) => {
    const newPath = servicePath + path;
    console.log(`[PathRewrite] from: ${path} → ${newPath}`);
    return newPath;
  };
}

function logProxy(req, proxyReq) {
  console.log(`[Proxy] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
}

// 🔐 HOTEL ADMIN SERVICE
app.use(
  '/api/admin/auth',
  createProxyMiddleware({
    target: 'http://hotel-admin:8000',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/admin/auth', '/api/v1/auth'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

app.use(
  '/api/admin/rooms',
  createProxyMiddleware({
    target: 'http://hotel-admin:8000',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/admin/rooms', '/api/v1/rooms'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

app.use(
  '/api/admin/notifications',
  createProxyMiddleware({
    target: 'http://hotel-admin:8000',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/admin/notifications', '/api/v1/notifications'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 🔍 HOTEL SEARCH SERVICE
app.use(
  '/api/search',
  createProxyMiddleware({
    target: 'http://hotel-search:8001',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/search', '/api/v1/search'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 🏨 BOOKING SERVICE
app.use(
  '/api/book',
  createProxyMiddleware({
    target: 'http://booking:8002',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/book', '/api/v1/book'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 💬 COMMENTS SERVICE
app.use(
  '/api/comments',
  createProxyMiddleware({
    target: 'http://comments:8003',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/comments', '/api/v1/comments'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 🔔 NOTIFICATION SERVICE
app.use(
  '/api/notify',
  createProxyMiddleware({
    target: 'http://notification:8004',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/notify', '/api/v1/notifications'),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 🤖 AI AGENT SERVICE
app.use(
  '/api/ai',
  createProxyMiddleware({
    target: 'http://ai-agent:8005',
    changeOrigin: true,
    pathRewrite: dynamicRewrite('/api/ai', ''),
    logLevel: 'debug',
    onProxyReq: logProxy
  })
);

// 🚀 GATEWAY START
app.listen(8080, () => {
  console.log('✅ API Gateway running on http://localhost:8080');
});
