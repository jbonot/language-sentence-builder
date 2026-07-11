import { NavLink, Route, Routes } from 'react-router-dom'

import { Home } from '@/pages/home'
import { Sandbox } from '@/pages/sandbox'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm rounded-md transition-colors ${
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground'
  }`

function App() {
  return (
    <>
      <nav className="flex items-center gap-2 border-b border-border px-6 py-3">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/sandbox" className={navLinkClass}>
          Sandbox
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sandbox" element={<Sandbox />} />
      </Routes>
    </>
  )
}

export default App
