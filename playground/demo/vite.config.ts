import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const playgroundRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(playgroundRoot, '..')

export default defineConfig(({mode}) => {
  const env = {
    ...loadEnv(mode, playgroundRoot, ''),
    ...loadEnv(mode, __dirname, ''),
  }

  return {
    root: __dirname,
    plugins: [react()],
    envDir: playgroundRoot,
    define: {
      'import.meta.env.VITE_MAPBOX_TOKEN': JSON.stringify(
        env.VITE_MAPBOX_TOKEN || env.SANITY_STUDIO_MAPBOX_TOKEN || '',
      ),
    },
    resolve: {
      alias: {
        sanity: path.resolve(__dirname, 'sanity-stub.ts'),
      },
      dedupe: ['react', 'react-dom', 'styled-components', '@sanity/ui'],
    },
    server: {
      port: 3334,
      strictPort: true,
      fs: {
        allow: [repoRoot, playgroundRoot],
      },
    },
    optimizeDeps: {
      include: [
        'mapbox-gl',
        'react-map-gl/mapbox',
        '@mapbox/mapbox-gl-geocoder',
        '@sanity/ui',
        '@sanity/icons',
      ],
    },
  }
})
