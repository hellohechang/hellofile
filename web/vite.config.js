import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // https: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true, // 允许跨域
        ws: true, // 允许websocket代理
        // 重写路径 --> 作用与vue配置pathRewrite作用相同
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
