import path from 'node:path'
import {defineConfig} from '@sanity/pkg-utils'
import type {Plugin} from 'rollup'

function cssFilesPlugin(): Plugin {
  return {
    name: 'css-files',
    transform(code, id) {
      if (!id.endsWith('.css')) {
        return null
      }

      const styleId = `sanity-plugin-mapbox-input:${path.basename(id)}`

      return {
        code: `const css = ${JSON.stringify(code)};
if (typeof document !== 'undefined' && !document.getElementById(${JSON.stringify(styleId)})) {
  const style = document.createElement('style');
  style.id = ${JSON.stringify(styleId)};
  style.textContent = css;
  document.head.appendChild(style);
}
export default css;
`,
        map: {mappings: ''},
      }
    },
  }
}

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',
  extract: {
    rules: {
      'ae-forgotten-export': 'off',
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
  rollup: {
    plugins: (prev) => [...prev, cssFilesPlugin()],
  },
})
