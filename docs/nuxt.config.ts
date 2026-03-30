import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-03-30',

  // GitHub Pages 部署配置
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/xmind-ui/' : '/',
    head: {
      title: 'Xmind UI Kit',
    },
  },

  // 静态站点生成
  ssr: false,

  css: [
    resolve(__dirname, '../packages/tokens/dist/tokens.css'),
    resolve(__dirname, 'assets/css/main.css'),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@xmind-ui/tokens': resolve(__dirname, '../packages/tokens'),
        '@xmind-ui/components': resolve(__dirname, '../packages/components'),
      },
    },
  },
})
