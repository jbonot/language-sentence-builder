import { Routes, Route } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { AboutPage } from '@/pages/about'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { Sandbox } from '@/pages/sandbox'

function App() {
  return (
    <TooltipProvider delayDuration={1000}>
      <Routes>
        <Route path="/" element={<Sandbox />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  )
}

export default App
