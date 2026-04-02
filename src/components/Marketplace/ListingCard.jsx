import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function ListingCard({ listing }) {
  const { id, title, description, price, price_type, images, location, type, created_at } = listing

  const formatPrice = () => {
    if (price_type === 'negotiable') return 'Negotiable'
    if (price_type === 'hourly') return `$${price}/hr`
    return `$${Number(price).toLocaleString()}`
  }

  const truncate = (text, maxLen) =>
    text && text.length > maxLen ? `${text.substring(0, maxLen)}…` : text

  const typeEmoji = type === 'product' ? '📦' : '🛠️'
  const typeLabel = type === 'product' ? '🛍 Product' : '⚙ Service'

  return (
    <Link to={`/listing/${id}`} className="listing-card">
      {/* Image area */}
      <div className="listing-image">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} loading="lazy" />
        ) : (
          <div className="no-image">
            <span role="img" aria-label={type}>{typeEmoji}</span>
          </div>
        )}
        <span className="listing-type-badge">{typeLabel}</span>
      </div>

      {/* Content */}
      <div className="listing-content">
        <h3 className="listing-title">{title}</h3>

        <p className="listing-description">
          {truncate(description, 100)}
        </p>

        <div className="listing-meta">
          <span>📍 {location}</span>
          <span>{format(new Date(created_at), 'MMM d')}</span>
        </div>

        <div className="listing-price">{formatPrice()}</div>
      </div>
    </Link>
  )
}