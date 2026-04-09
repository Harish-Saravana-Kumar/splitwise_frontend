import './contact-page.css'

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-card contact-hero">
        <h1>Contact Us</h1>
        <p>
          You can request account-related support through the product team and review shared group
          data visibility within your groups.
        </p>
      </section>

      <section className="contact-card" aria-labelledby="contact-details-title">
        <h2 id="contact-details-title">Support Details</h2>
        <div className="contact-grid">
          <article className="contact-item">
            <h3>Email</h3>
            <a href="mailto:malarharish007@gmail.com">malarharish007@gmail.com</a>
          </article>

          <article className="contact-item">
            <h3>Contact Person</h3>
            <p>Harish S</p>
          </article>

          <article className="contact-item">
            <h3>Phone</h3>
            <a href="tel:+919345306280">+91 93453 06280</a>
          </article>

          <article className="contact-item">
            <h3>LinkedIn</h3>
            <a
              href="https://www.linkedin.com/in/harishs-developer/"
              target="_blank"
              rel="noreferrer"
            >
              linkedin.com/in/harishs-developer
            </a>
            <p className="contact-note">You can also send a message on LinkedIn.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
