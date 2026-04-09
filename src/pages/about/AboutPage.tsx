import { Link } from 'react-router-dom'
import './about-page.css'

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero card-surface">
        <h1>About Splitwise Project</h1>
        <p>
          Splitwise is a collaborative expense-sharing app built to track group spending, simplify dues,
          and guide settlements with a clear, user-friendly workflow.
        </p>
      </section>

      <section className="about-section card-surface" aria-labelledby="about-working-title">
        <h2 id="about-working-title">How The Project Works</h2>
        <ol>
          <li>Create or join groups to manage shared expenses.</li>
          <li>Add expenses with payer, amount, description, and split style.</li>
          <li>Track net balances to see who owes whom in real time.</li>
          <li>Use guided settle-up actions to close dues safely with confirmation.</li>
        </ol>
      </section>

      <section className="about-section card-surface" aria-labelledby="about-usage-title">
        <h2 id="about-usage-title">How To Use</h2>
        <ul>
          <li>Register or sign in, then open your groups dashboard.</li>
          <li>Create a group and add members.</li>
          <li>Add expenses regularly to keep balances accurate.</li>
          <li>Use the Assistant popup for balance checks, recent expenses, and guided actions.</li>
        </ul>
      </section>

      <section className="about-quick-links" aria-label="Quick links">
        <Link className="about-link" to="/register">
          Create Account
        </Link>
        <Link className="about-link" to="/login">
          Sign In
        </Link>
        <Link className="about-link" to="/dashboard">
          Open Dashboard
        </Link>
      </section>
    </main>
  )
}
