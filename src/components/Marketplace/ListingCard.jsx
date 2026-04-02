import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function ListingCard({ listing }) {
  const { id, title, description, price, price_type, images, location, type, created_at } = listing

  const formatPrice = () => {
    if (price_type === 'negotiable') return 'Negotiable'
    if (price_type === 'hourly') return `$${price}/hr`
    return `$${price}`
  }

  return (
    <Link to={`/listing/${id}`} className="listing-card">
      <div className="listing-image">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} />
        ) : (
          <div className="no-image">
            <span>{type === 'product' ? '📦' : '🛠️'}</span>
          </div>
        )}
        <span className="listing-type-badge">{type}</span>
      </div>

      <div className="listing-content">
        <h3 className="listing-title">{title}</h3>
        <p className="listing-description">
          {description.length > 100 ? `${description.substring(0, 100)}...` : description}
        </p>

        <div className="listing-meta">
          <span className="listing-location">📍 {location}</span>
          <span className="listing-date">{format(new Date(created_at), 'MMM d')}</span>
        </div>

        <div className="listing-price">{formatPrice()}</div>
      </div>
    </Link>
  )
}
