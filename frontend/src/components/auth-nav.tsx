import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'

export function AuthNav() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link to="/login" className="text-muted-foreground hover:text-foreground">
          Log in
        </Link>
        <Link to="/register" className="text-muted-foreground hover:text-foreground">
          Sign up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  )
}
