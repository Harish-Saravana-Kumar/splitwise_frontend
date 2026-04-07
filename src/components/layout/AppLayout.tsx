import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './app-layout.css'

export default function AppLayout() {
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const profileRef = useRef<HTMLDivElement | null>(null)
  const name = useAuthStore((state) => state.name)
  const userId = useAuthStore((state) => state.userId)
  const email = useAuthStore((state) => state.email)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!profileOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      const insideProfile = profileRef.current?.contains(target) ?? false
      if (!insideProfile) {
        setProfileOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [profileOpen])

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? 'is-active' : ''}`

  return (
    <div className="app-layout">
      <header className="app-top-header">
        <h1 className="app-brand">Splitwise</h1>
        <nav className="app-nav app-nav-header" aria-label="Primary navigation">
          <NavLink to="/dashboard" className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/" end className={navClassName}>
            Groups
          </NavLink>
        </nav>
        <div className="app-header-right">
          <div className="app-profile-anchor" ref={profileRef}>
            <button
              type="button"
              className="app-profile-trigger"
              aria-label="Open profile"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((current) => !current)}
            >
              <span className="app-profile-trigger-glyph" aria-hidden="true">
                👤
              </span>
            </button>

            {profileOpen ? (
              <section className="app-profile-popover" aria-label="Profile details">
                <div className="app-profile-popover-header">
                  <h2 className="app-profile-popover-title">My Profile</h2>
                  <button
                    type="button"
                    className="app-profile-close"
                    aria-label="Close profile"
                    onClick={() => setProfileOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="app-profile-popover-body">
                  <p className="app-profile-line">
                    <span className="app-profile-label">Username</span>
                    <span className="app-profile-value">{name ?? 'User'}</span>
                  </p>
                  <p className="app-profile-line">
                    <span className="app-profile-label">User ID</span>
                    <span className="app-profile-value">{userId ?? '-'}</span>
                  </p>
                  <p className="app-profile-line">
                    <span className="app-profile-label">Email</span>
                    <span className="app-profile-value">{email ?? '-'}</span>
                  </p>
                  <button
                    type="button"
                    className="groups-secondary-btn"
                    onClick={() => {
                      setProfileOpen(false)
                      logout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
