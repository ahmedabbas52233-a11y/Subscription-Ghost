import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const removeSplash = () => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.style.opacity = '0'
    splash.style.transition = 'opacity 0.4s'
    setTimeout(() => splash.remove(), 420)
  }
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

requestAnimationFrame(() => requestAnimationFrame(removeSplash))
