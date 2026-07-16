import { useEffect, useRef } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Toaster } from '@/components/ui/toaster'
import { useOfflineQueue } from '@/hooks/use-offline-queue'
import { toast } from '@/hooks/use-toast'
import { AboutPage } from '@/pages/about'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { Sandbox } from '@/pages/sandbox'

function FramedLayout() {
  return (
    <div className="mx-auto w-[1126px] max-w-full flex-1 border-x border-border text-center">
      <Outlet />
    </div>
  )
}

function AuthExpiredNotice() {
  const { authExpired, pendingSentences, pendingWorkingSets } = useOfflineQueue()
  const hasNotifiedRef = useRef(false)

  useEffect(() => {
    if (!authExpired) {
      hasNotifiedRef.current = false
      return
    }
    if (hasNotifiedRef.current) return
    hasNotifiedRef.current = true
    const pendingCount = pendingSentences.length + pendingWorkingSets.length
    toast({
      description: `Your session expired while offline — log in again to sync ${pendingCount} pending change${pendingCount === 1 ? '' : 's'}.`,
      duration: 8000,
    })
  }, [authExpired, pendingSentences.length, pendingWorkingSets.length])

  return null
}

function App() {
  return (
    <TooltipProvider delayDuration={1000}>
      <Routes>
        <Route path="/" element={<Sandbox />} />
        <Route element={<FramedLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
      <Toaster />
      <ConfirmDialog />
      <AuthExpiredNotice />
    </TooltipProvider>
  )
}

export default App
