import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // 这一步非常重要：它让代码里的 process.env.API_KEY 在浏览器里也能工作
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})