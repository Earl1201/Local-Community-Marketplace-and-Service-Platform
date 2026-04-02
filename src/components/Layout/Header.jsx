import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🏘️</span>
            <span className="logo-text">Community Market</span>
          </Link>

          <nav className="nav">
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            <Link to="/services" className="nav-link">Services</Link>

            {user ? (
              <>
                <Link to="/my-listings" className="nav-link">My Listings</Link>
                <Link to="/bookings" className="nav-link">Bookings</Link>
                <Link to="/messages" className="nav-link">Messages</Link>
                <div className="user-menu">
                  <button className="avatar-btn">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </button>
                  <div className="dropdown">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/create-listing" className="dropdown-item">Create Listing</Link>
                    <button onClick={handleSignOut} className="dropdown-item">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/auth" className="btn-primary">Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
