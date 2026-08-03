import React from 'react'
import AppRoutes from './routes'
import { ToastProvider } from './components/feedback/Toast'

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App
