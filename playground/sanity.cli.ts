import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineCliConfig} from 'sanity/cli'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'playground',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  vite: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias || {}),
        'sanity-plugin-mapbox-input': path.resolve(__dirname, '../src'),
      },
    },
  }),
})
