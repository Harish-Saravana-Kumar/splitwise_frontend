import { Link } from 'react-router-dom'
import '../privacy/privacy-page.css'

export default function TermsPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero legal-card">
        <h1>Terms of Service</h1>
        <p>
          These terms describe acceptable use of Splitwise, responsibilities for shared group data,
          and general limitations for the service.
        </p>
      </section>

      <section className="legal-card" aria-labelledby="terms-use-title">
        <h2 id="terms-use-title">Use of the App</h2>
        <ul>
          <li>Use the app for lawful and respectful collaboration.</li>
          <li>Do not attempt unauthorized access to other users or groups.</li>
          <li>Provide accurate expense records for fair settlements.</li>
        </ul>
      </section>

      <section className="legal-card" aria-labelledby="terms-content-title">
        <h2 id="terms-content-title">Account and Content Responsibility</h2>
        <ul>
          <li>You are responsible for actions taken through your account.</li>
          <li>Group members share responsibility for entered expense data.</li>
          <li>Report suspicious activity to the product team promptly.</li>
        </ul>
      </section>

      <section className="legal-card" aria-labelledby="terms-liability-title">
        <h2 id="terms-liability-title">Service Limitations</h2>
        <p>
          Splitwise is provided as-is for managing group expense workflows. Availability and features
          may evolve as the product improves.
        </p>
      </section>

      <section className="legal-links" aria-label="Legal quick links">
        <Link className="legal-link" to="/about">
          About
        </Link>
        <Link className="legal-link" to="/privacy">
          Privacy
        </Link>
      </section>
    </main>
  )
}
