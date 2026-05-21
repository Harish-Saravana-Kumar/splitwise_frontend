import { useEffect, useRef, useState } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Footer from '../Footer'
import './app-layout.css'
import '../footer.css'

export default function AppLayout() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const profileRef = useRef<HTMLDivElement | null>(null)
  const name = useAuthStore((state) => state.name)
  const userId = useAuthStore((state) => state.userId)
  const email = useAuthStore((state) => state.email)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    setProfileOpen(false)
    setMobileMenuOpen(false)
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

  const getPageTitle = (): string => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path === '/' || path === '') return 'Groups'
    if (path.startsWith('/groups')) return 'Groups'
    return 'Splitwise'
  }

  return (
    <div className="app-layout">
      <header className="app-top-header">
        <h1 className="app-brand" aria-label="Splitwise">
          <span className="app-brand-mark" aria-hidden="true">
            S
          </span>
          <span className="app-brand-text">Splitwise</span>
        </h1>
        <div className="app-top-title" aria-hidden="true">
          {getPageTitle()}
        </div>
        <nav className="app-nav app-nav-header" aria-label="Primary navigation">
          <NavLink to="/dashboard" className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/" end className={navClassName}>
            Groups
          </NavLink>
          <NavLink to="/about" className={navClassName}>
            About
          </NavLink>
        </nav>
        <div className="app-header-right">
          <button
            type="button"
            className="app-mobile-menu-trigger"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((c) => !c)}
          >
            <span aria-hidden>☰</span>
          </button>
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

      {mobileMenuOpen ? (
        <button
          type="button"
          className="app-mobile-menu-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      {mobileMenuOpen ? (
        <aside className="app-mobile-menu" aria-label="Navigation menu">
          <nav className="app-mobile-menu-nav" aria-label="Mobile navigation">
            <NavLink to="/dashboard" className={navClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/" className={navClassName}>
              Groups
            </NavLink>
            <NavLink to="/about" className={navClassName}>
              About
            </NavLink>
            <NavLink to="/contact" className={navClassName}>
              Contact
            </NavLink>
            <NavLink to="/privacy" className={navClassName}>
              Privacy
            </NavLink>
            <NavLink to="/terms" className={navClassName}>
              Terms
            </NavLink>
          </nav>
        </aside>
      ) : null}

      <main className="app-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
