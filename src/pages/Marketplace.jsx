import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/Marketplace/ListingCard'

export default function Marketplace() {
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadListings()
  }, [selectedCategory])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'product')
      .order('name')

    if (data) setCategories(data)
  }

  const loadListings = async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, users(full_name, avatar_url)')
      .eq('type', 'product')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory)
    }

    const { data, error } = await query

    if (!error && data) {
      setListings(data)
    }
    setLoading(false)
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="marketplace-page">
      <div className="container">
        <div className="page-header">
          <h1>Marketplace</h1>
          <p>Discover products from your local community</p>
        </div>

        <div className="marketplace-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading listings...</div>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <p>No listings found. Be the first to post!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
