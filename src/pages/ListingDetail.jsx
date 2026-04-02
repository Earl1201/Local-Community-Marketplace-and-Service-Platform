import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [duration, setDuration] = useState('1')
  const [notes, setNotes] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    loadListing()
  }, [id])

  const loadListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*, users(id, full_name, email, phone, location, avatar_url)')
      .eq('id', id)
      .maybeSingle()

    if (!error && data) {
      setListing(data)
    }
    setLoading(false)
  }

  const handleBookService = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate('/auth')
      return
    }

    setBookingLoading(true)

    try {
      const totalPrice = listing.price * parseFloat(duration)

      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            listing_id: listing.id,
            customer_id: user.id,
            provider_id: listing.user_id,
            booking_date: bookingDate,
            booking_time: bookingTime,
            duration_hours: parseFloat(duration),
            total_price: totalPrice,
            notes: notes,
            status: 'pending'
          }
        ])

      if (error) throw error

      alert('Booking request sent successfully!')
      navigate('/bookings')
    } catch (error) {
      alert('Error creating booking: ' + error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleContact = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    navigate(`/messages?user=${listing.user_id}&listing=${listing.id}`)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!listing) {
    return <div className="container">Listing not found</div>
  }

  const isOwner = user?.id === listing.user_id

  return (
    <div className="listing-detail-page">
      <div className="container">
        <div className="listing-detail">
          <div className="listing-images">
            {listing.images && listing.images.length > 0 ? (
              <img src={listing.images[0]} alt={listing.title} className="main-image" />
            ) : (
              <div className="no-image-large">
                <span>{listing.type === 'product' ? '📦' : '🛠️'}</span>
              </div>
            )}
          </div>

          <div className="listing-info">
            <div className="listing-header">
              <span className="type-badge">{listing.type}</span>
              <h1>{listing.title}</h1>
              <div className="price-display">
                {listing.price_type === 'negotiable'
                  ? 'Negotiable'
                  : `$${listing.price}${listing.price_type === 'hourly' ? '/hr' : ''}`}
              </div>
            </div>

            <div className="listing-description">
              <h2>Description</h2>
              <p>{listing.description}</p>
            </div>

            <div className="listing-details">
              <div className="detail-item">
                <strong>Location:</strong> {listing.location}
              </div>
              <div className="detail-item">
                <strong>Posted:</strong> {format(new Date(listing.created_at), 'PPP')}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> {listing.status}
              </div>
            </div>

            <div className="seller-info">
              <h3>Posted by</h3>
              <div className="seller-card">
                <div className="seller-avatar">
                  {listing.users.full_name.charAt(0)}
                </div>
                <div>
                  <div className="seller-name">{listing.users.full_name}</div>
                  <div className="seller-location">{listing.users.location || 'Location not set'}</div>
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="listing-actions">
                <button onClick={handleContact} className="btn-secondary btn-block">
                  Contact Seller
                </button>

                {listing.type === 'service' && (
                  <details className="booking-form">
                    <summary className="btn-primary btn-block">Book This Service</summary>
                    <form onSubmit={handleBookService}>
                      <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                          id="date"
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                          id="time"
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="duration">Duration (hours)</label>
                        <input
                          id="duration"
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="notes">Notes (optional)</label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="total-price">
                        Total: ${(listing.price * parseFloat(duration || 0)).toFixed(2)}
                      </div>

                      <button type="submit" className="btn-primary btn-block" disabled={bookingLoading}>
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                      </button>
                    </form>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
