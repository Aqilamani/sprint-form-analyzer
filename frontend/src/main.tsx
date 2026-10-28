import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Mocks are on in dev unless VITE_USE_MOCKS=false; off in builds unless VITE_USE_MOCKS=true.
const mockFlag = import.meta.env.VITE_USE_MOCKS
const useMocks = mockFlag === undefined ? import.meta.env.DEV : mockFlag === 'true'

async function enableMocks() {
  if (!useMocks) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass' })
}

enableMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
