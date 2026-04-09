import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeViteBase(raw) {
  if (!raw || raw === '/') return '/'
  let s = String(raw).trim()
  if (!s.startsWith('/')) s = `/${s}`
  if (!s.endsWith('/')) s = `${s}/`
  return s
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeViteBase(env.VITE_BASE)

  return {
    base,
    plugins: [
      react(),
      {
        name: 'spa-fallback-404-html',
        closeBundle() {
          const dist = join(process.cwd(), 'dist')
          const indexHtml = join(dist, 'index.html')
          const notFoundHtml = join(dist, '404.html')
          if (existsSync(indexHtml)) copyFileSync(indexHtml, notFoundHtml)
        },
      },
    ],
  }
})
