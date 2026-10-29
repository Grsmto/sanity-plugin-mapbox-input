import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import '@sanity/ui/styles.css'
import {App} from './App'

const root = document.getElementById('root')
const theme = buildTheme()

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
