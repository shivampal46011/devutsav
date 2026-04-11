import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Defer PostHog to idle time — don't block the critical rendering path.
// Dynamic import also splits posthog-js into a separate lazy chunk.
if (import.meta.env.VITE_POSTHOG_KEY) {
  const initPostHog = () => {
    import('posthog-js').then(({ default: posthog }) => {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        session_recording: {
          maskAllInputs: false,
          maskInputAttributes: ['password', 'credit-card'],
        },
        enable_recording_console_log: false,
      })
    })
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initPostHog)
  } else {
    setTimeout(initPostHog, 2000)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
