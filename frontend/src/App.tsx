import { Routes, Route, Outlet } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
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
    </TooltipProvider>
  )
}

export default App
