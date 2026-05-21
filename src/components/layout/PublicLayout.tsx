import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Footer from '../Footer'
import './app-layout.css'
import '../footer.css'

export default function PublicLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [mobileMenuOpen])

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? 'is-active' : ''}`

  return (
    <div className="app-layout">
      {mobileMenuOpen ? (
        <button
          type="button"
          className="app-mobile-menu-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <header className="app-top-header">
        <h1 className="app-brand" aria-label="Splitwise">
          <span className="app-brand-mark" aria-hidden="true">
            S
          </span>
          <span className="app-brand-text">Splitwise</span>
        </h1>

        <nav className="app-nav app-nav-header" aria-label="Public navigation">
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

        <div className="app-header-right">
          <button
            type="button"
            className="app-mobile-menu-trigger"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          {isAuthenticated ? (
            <NavLink to="/dashboard" className={navClassName}>
              Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className={navClassName}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClassName}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      {mobileMenuOpen ? (
        <aside className="app-mobile-menu" aria-label="Navigation menu">
          <nav className="app-mobile-menu-nav" aria-label="Mobile navigation">
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

          <div className="app-mobile-menu-footer">
            {isAuthenticated ? (
              <NavLink to="/dashboard" className={navClassName}>
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/login" className={navClassName}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navClassName}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </aside>
      ) : null}

      <main className="app-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
