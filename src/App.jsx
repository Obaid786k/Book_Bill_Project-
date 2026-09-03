import React, { useEffect } from 'react'
import AppRoutes from './routes'
import { ToastProvider } from './components/feedback/Toast'
import { useAuthStore } from './store/authStore'
import GlobalLoading from './components/common/states/GlobalLoading'

function App() {
  const { initialize, isInitializing } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isInitializing) {
    return <GlobalLoading />
  }

  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}

export default App
