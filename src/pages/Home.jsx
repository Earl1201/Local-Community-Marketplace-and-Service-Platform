import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Local Community
              <span className="highlight"> Marketplace</span>
            </h1>
            <p className="hero-subtitle">
              Buy, sell, and discover services in your neighborhood.
              Connect with local sellers and service providers.
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

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Community Market?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3>Buy & Sell Locally</h3>
              <p>Find great deals on products from your neighbors</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Local Services</h3>
              <p>Book trusted service providers in your area</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Direct Messaging</h3>
              <p>Chat directly with sellers and service providers</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Reviews & Ratings</h3>
              <p>Make informed decisions with community feedback</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Safe and trusted transactions in your community</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>Simple interface for quick buying and selling</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of community members already trading locally</p>
            {!user ? (
              <Link to="/auth" className="btn-primary btn-large">
                Create Free Account
              </Link>
            ) : (
              <Link to="/create-listing" className="btn-primary btn-large">
                Create Your First Listing
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
