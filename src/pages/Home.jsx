import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const FEATURES = [
  {
    icon: '🛍️',
    title: 'Buy & Sell Locally',
    desc: 'Find great deals on products from your neighbors and local community.',
  },
  {
    icon: '🔧',
    title: 'Local Services',
    desc: 'Book trusted, verified service providers right in your neighborhood.',
  },
  {
    icon: '💬',
    title: 'Direct Messaging',
    desc: 'Chat directly with sellers and service providers — no middleman.',
  },
  {
    icon: '⭐',
    title: 'Reviews & Ratings',
    desc: 'Make informed decisions with honest feedback from the community.',
  },
  {
    icon: '🔒',
    title: 'Secure Platform',
    desc: 'Safe, trusted transactions protected by row-level security.',
  },
  {
    icon: '📱',
    title: 'Works Everywhere',
    desc: 'Fully responsive — shop and sell from any device, anytime.',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Local Community
              <br />
              <span className="highlight">Marketplace</span>
            </h1>
            <p className="hero-subtitle">
              Buy, sell, and discover services in your neighborhood.
              Connect with trusted local sellers and service providers.
            </p>
            <div className="hero-buttons">
              <Link to="/marketplace" className="btn-primary btn-large">
                Browse Marketplace
              </Link>
              <Link to="/services" className="btn-secondary btn-large">
                Find Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Community Market?</h2>
          <div className="features-grid">
            {FEATURES.map(({ icon, title, desc }) => (
              <div className="feature-card" key={title}>
                <span className="feature-icon" role="img" aria-hidden="true">
                  {icon}
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip (optional visual flair) ── */}
      <section style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}>
            {[
              { value: '10,000+', label: 'Community Members' },
              { value: '5,000+', label: 'Active Listings' },
              { value: '2,500+', label: 'Services Booked' },
              { value: '4.9 ★', label: 'Average Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 4,
                }}>
                  {value}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of community members already trading locally</p>
            {user ? (
              <Link to="/create-listing" className="btn-primary btn-large">
                Create Your First Listing
              </Link>
            ) : (
              <Link to="/auth" className="btn-primary btn-large">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}