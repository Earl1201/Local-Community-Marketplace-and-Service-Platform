import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ listings: 0, bookings: 0, services: 0 })
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      })
    }
    loadStats()
  }, [user, profile, navigate])

  const loadStats = async () => {
    if (!user) return
    const [listingsRes, bookingsRes, servicesRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('customer_id', user.id),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('provider_id', user.id),
    ])
    setStats({
      listings: listingsRes.count || 0,
      bookings: bookingsRes.count || 0,
      services: servicesRes.count || 0,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.full_name.trim()) {
      setError('Full name is required')
      return
    }
    setLoading(true)
    const { error: updateError } = await updateProfile(formData)
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3500)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      })
    }
    setError('')
    setEditing(false)
  }

  if (!user || !profile) {
    return <div className="loading">Loading profile…</div>
  }

  const initials = profile.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="profile-page">
      <div className="container">

        {/* ── Top card: avatar + name + stats ── */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">{initials}</div>

          <div className="profile-header-info">
            <h1>{profile.full_name}</h1>
            <p className="profile-email">✉️ {user.email}</p>
            {profile.location && (
              <p className="profile-location">📍 {profile.location}</p>
            )}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.created_at && (
              <p className="profile-joined">
                🗓 Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
              </p>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.listings}</span>
              <span className="stat-label">Active Listings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.bookings}</span>
              <span className="stat-label">Bookings Made</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.services}</span>
              <span className="stat-label">Services Given</span>
            </div>
          </div>
        </div>

        {/* ── Profile details / edit form ── */}
        <div className="profile-edit-card">
          <div className="profile-section-header">
            <h2>Profile Details</h2>
            {!editing && (
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {success && (
            <div className="success-message" role="status">
              ✅ Profile updated successfully!
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} noValidate>
              {error && (
                <div className="error-message" role="alert">⚠ {error}</div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Cebu City, Philippines"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell the community a bit about yourself…"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details-view">
              <div className="profile-detail-row">
                <span className="detail-label">Full Name</span>
                <span>{profile.full_name || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Phone</span>
                <span>{profile.phone || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Location</span>
                <span>{profile.location || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Bio</span>
                <span style={{ maxWidth: '500px', lineHeight: 1.6 }}>{profile.bio || '—'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Member Since</span>
                <span>
                  {profile.created_at
                    ? format(new Date(profile.created_at), 'PPP')
                    : '—'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick links ── */}
        <div className="profile-quick-links">
          <a href="/my-listings" className="quick-link-card">
            <span className="quick-link-icon">🛍️</span>
            <div>
              <strong>My Listings</strong>
              <p>Manage your active listings</p>
            </div>
          </a>
          <a href="/bookings" className="quick-link-card">
            <span className="quick-link-icon">📅</span>
            <div>
              <strong>Bookings</strong>
              <p>View your service bookings</p>
            </div>
          </a>
          <a href="/messages" className="quick-link-card">
            <span className="quick-link-icon">💬</span>
            <div>
              <strong>Messages</strong>
              <p>Chat with buyers and sellers</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  )
}