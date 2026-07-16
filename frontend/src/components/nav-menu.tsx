import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { LogOutIcon, MenuIcon, OfflineIcon } from '@/components/icons'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/auth-context'
import { setOfflineMode, useOfflineMode } from '@/lib/offline-mode'
import { cn } from '@/lib/utils'

const menuItemClass =
  'block rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none'

export function NavMenu() {
  const { user, logout } = useAuth()
  const offlineMode = useOfflineMode()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstItemRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!isOpen) return

    firstItemRef.current?.focus()

    const closeAndRefocusTrigger = () => {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeAndRefocusTrigger()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAndRefocusTrigger()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const close = () => setIsOpen(false)

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          'relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
          offlineMode && 'text-primary',
        )}
      >
        <MenuIcon className="size-5" />
        {offlineMode && <OfflineIcon className="absolute -bottom-0.5 -right-0.5 size-3" />}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="animate-menu-in absolute left-0 top-full z-50 mt-2 min-w-48 rounded-md border border-border bg-background p-1 shadow-md"
        >
          <Link ref={firstItemRef} to="/about" role="menuitem" onClick={close} className={menuItemClass}>
            About
          </Link>
          <div className="-mx-1 my-1 h-px bg-border" />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground opacity-70">
            Settings
          </div>
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <label htmlFor="offline-mode-switch" className="flex items-center gap-2 text-sm text-foreground">
              <OfflineIcon className="size-4 text-muted-foreground" />
              Offline mode
            </label>
            <Switch id="offline-mode-switch" checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>
          {user ? (
            <>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="px-2 py-1.5 text-xs text-muted-foreground opacity-70">{user.email}</div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close()
                  logout()
                }}
                className={cn(menuItemClass, 'flex w-full items-center gap-2')}
              >
                <LogOutIcon className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" role="menuitem" onClick={close} className={menuItemClass}>
                Log in
              </Link>
              <Link to="/register" role="menuitem" onClick={close} className={menuItemClass}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
