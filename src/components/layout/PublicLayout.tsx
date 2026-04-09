import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Footer from '../Footer'
import './app-layout.css'
import '../footer.css'

export default function PublicLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link ${isActive ? 'is-active' : ''}`

  return (
    <div className="app-layout">
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

      <main className="app-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
