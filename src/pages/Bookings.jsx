import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

export default function Bookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('customer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    loadBookings()
  }, [user, activeTab, navigate])

  const loadBookings = async () => {
    setLoading(true)

    const column = activeTab === 'customer' ? 'customer_id' : 'provider_id'

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        listings(title, type, price),
        customer:customer_id(full_name, email),
        provider:provider_id(full_name, email)
      `)
      .eq(column, user.id)
      .order('booking_date', { ascending: false })

    if (!error && data) {
      setBookings(data)
    }
    setLoading(false)
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (!error) {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1>My Bookings</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            My Bookings
          </button>
          <button
            className={`tab ${activeTab === 'provider' ? 'active' : ''}`}
            onClick={() => setActiveTab('provider')}
          >
            Service Requests
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>
              {activeTab === 'customer'
                ? "You haven't booked any services yet."
                : "You haven't received any booking requests yet."}
            </p>
            <Link to="/services" className="btn-primary">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.listings.title}</h3>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span>{format(new Date(booking.booking_date), 'PPP')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span>{booking.booking_time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span>{booking.duration_hours} hours</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total:</span>
                    <span className="price">${booking.total_price}</span>
                  </div>

                  {activeTab === 'customer' ? (
                    <div className="detail-row">
                      <span className="label">Provider:</span>
                      <span>{booking.provider.full_name}</span>
                    </div>
                  ) : (
                    <div className="detail-row">
                      <span className="label">Customer:</span>
                      <span>{booking.customer.full_name}</span>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>

                {activeTab === 'provider' && booking.status === 'pending' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      className="btn-success"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      className="btn-danger"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {activeTab === 'provider' && booking.status === 'confirmed' && (
                  <div className="booking-actions">
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="btn-primary"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
