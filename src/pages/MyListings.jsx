import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

export default function MyListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    loadListings()
  }, [user, navigate])

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (!error) {
      setListings(listings.filter(l => l.id !== id))
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setListings(listings.map(l =>
        l.id === id ? { ...l, status: newStatus } : l
      ))
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="my-listings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Listings</h1>
          <Link to="/create-listing" className="btn-primary">
            Create New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any listings yet.</p>
            <Link to="/create-listing" className="btn-primary">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="listings-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(listing => (
                  <tr key={listing.id}>
                    <td>
                      <Link to={`/listing/${listing.id}`} className="listing-link">
                        {listing.title}
                      </Link>
                    </td>
                    <td>
                      <span className="type-badge-small">{listing.type}</span>
                    </td>
                    <td>${listing.price}</td>
                    <td>
                      <select
                        value={listing.status}
                        onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>{format(new Date(listing.created_at), 'MMM d, yyyy')}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="btn-danger-small"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
