import { Routes, Route } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Sandbox } from '@/pages/sandbox'

function App() {
  return (
    <TooltipProvider delayDuration={1000}>
      <Routes>
        <Route path="/" element={<Sandbox />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
