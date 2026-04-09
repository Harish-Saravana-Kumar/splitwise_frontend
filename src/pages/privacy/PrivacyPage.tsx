import { Link } from 'react-router-dom'
import './privacy-page.css'

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero legal-card">
        <h1>Privacy Policy</h1>
        <p>
          This page explains how Splitwise handles account information, shared expense data, and
          security-related processing.
        </p>
      </section>

      <section className="legal-card" aria-labelledby="privacy-collect-title">
        <h2 id="privacy-collect-title">What We Collect</h2>
        <ul>
          <li>Basic account details: name, email, and profile identifiers.</li>
          <li>Group and expense records required to calculate balances.</li>
          <li>Operational logs used to improve reliability and security.</li>
        </ul>
      </section>

      <section className="legal-card" aria-labelledby="privacy-use-title">
        <h2 id="privacy-use-title">How Data Is Used</h2>
        <ul>
          <li>To show dashboards, dues, and settlement history.</li>
          <li>To support authenticated access and account safety.</li>
          <li>To diagnose issues and improve app performance.</li>
        </ul>
      </section>

      <section className="legal-card" aria-labelledby="privacy-rights-title">
        <h2 id="privacy-rights-title">Your Choices</h2>
        <p>
          You can request account-related support through the product team and review shared group
          data visibility within your groups.
        </p>
      </section>

      <section className="legal-links" aria-label="Legal quick links">
        <Link className="legal-link" to="/about">
          About
        </Link>
        <Link className="legal-link" to="/terms">
          Terms
        </Link>
      </section>
    </main>
  )
}
