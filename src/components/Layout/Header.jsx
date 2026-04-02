import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Click-based dropdown — no CSS hover
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close when clicking anywhere outside the menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    await signOut()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">🏘️</span>
            <span className="logo-text">Community Market</span>
          </Link>

          <nav className="nav" aria-label="Main navigation">
            <Link to="/marketplace" className="nav-link" onClick={closeMenu}>Marketplace</Link>
            <Link to="/services" className="nav-link" onClick={closeMenu}>Services</Link>

            {user && (
              <>
                <Link to="/my-listings" className="nav-link" onClick={closeMenu}>My Listings</Link>
                <Link to="/bookings" className="nav-link" onClick={closeMenu}>Bookings</Link>
              </>
            )}

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="user-menu" ref={menuRef}>
                {/* Avatar button — click toggles dropdown */}
                <button
                  className="avatar-btn"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  aria-label="Open user menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </button>

                {/* Dropdown only exists in DOM when open — no hover leak */}
                {menuOpen && (
                  <div className="dropdown" role="menu">
                    <Link to="/profile" className="dropdown-item" role="menuitem" onClick={closeMenu}>
                      👤 Profile
                    </Link>
                    <Link to="/create-listing" className="dropdown-item" role="menuitem" onClick={closeMenu}>
                      ➕ Create Listing
                    </Link>
                    <Link to="/messages" className="dropdown-item" role="menuitem" onClick={closeMenu}>
                      💬 Messages
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="dropdown-item"
                      role="menuitem"
                      style={{ color: '#ef4444' }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn-primary" onClick={closeMenu}>Sign In</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}