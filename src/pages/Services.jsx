import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListingCard from '../components/Marketplace/ListingCard'

export default function Services() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadServices()
  }, [selectedCategory])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'service')
      .order('name')

    if (data) setCategories(data)
  }

  const loadServices = async () => {
    setLoading(true)
    let query = supabase
      .from('listings')
      .select('*, users(full_name, avatar_url)')
      .eq('type', 'service')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory)
    }

    const { data, error } = await query

    if (!error && data) {
      setServices(data)
    }
    setLoading(false)
  }

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="services-page">
      <div className="container">
        <div className="page-header">
          <h1>Local Services</h1>
          <p>Find trusted service providers in your community</p>
        </div>

        <div className="marketplace-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search services..."
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
              All Services
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
          <div className="loading">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <p>No services found. Be the first to offer your services!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filteredServices.map(service => (
              <ListingCard key={service.id} listing={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
