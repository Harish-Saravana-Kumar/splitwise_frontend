import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <span className="app-footer__logo">Splitwise</span>
          <span className="app-footer__copyright">© {currentYear}</span>
        </div>

        <div className="app-footer__tagline">Split expenses. Stay friends.</div>

        <nav className="app-footer__nav" aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  )
}
