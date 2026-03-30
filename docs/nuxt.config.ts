import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-03-30',
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
  app: {
    head: {
      title: 'Xmind UI Kit',
    },
  },
})
