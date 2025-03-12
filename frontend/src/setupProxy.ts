// setupProxy.ts
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app: { use: (arg0: string, arg1: any) => void; }) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8000", // The backend
      changeOrigin: true,
      // pathRewrite: { "^/api": "/api" }, // Not strictly needed if your backend routes on /api
    })
  );
};
