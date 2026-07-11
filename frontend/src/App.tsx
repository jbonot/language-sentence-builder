import { Routes, Route } from 'react-router-dom'

import { Sandbox } from '@/pages/sandbox'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sandbox />} />
    </Routes>
  )
}

export default App
