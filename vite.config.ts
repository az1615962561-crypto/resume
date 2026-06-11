import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  build:
    mode === 'standalone'
      ? {
          rolldownOptions: {
            output: {
              codeSplitting: false,
            },
          },
        }
      : undefined,
}))
