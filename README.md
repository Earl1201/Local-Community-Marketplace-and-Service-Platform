# Local Community Marketplace and Service Platform

A full-stack web application that connects community members for buying, selling products, and booking local services.

## Project Overview

This platform enables users to:
- Browse and search for products and services in their local community
- Create listings for items to sell or services to offer
- Book services directly from service providers
- Communicate through the messaging system
- Manage their listings and bookings
- Rate and review transactions

## Tech Stack

### Frontend
- **React** 19.2.4 - UI library
- **React Router** 6.22.0 - Client-side routing
- **Vite** 8.0.3 - Build tool and dev server
- **date-fns** 3.3.1 - Date formatting utilities

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Database Schema

#### Tables
1. **users** - User profiles with authentication
2. **categories** - Product and service categories
3. **listings** - Marketplace items and service offerings
4. **bookings** - Service booking requests and scheduling
5. **messages** - Direct messaging between users
6. **reviews** - User ratings and feedback
7. **favorites** - Saved listings

## Features

### Authentication System
- User registration with email/password
- Secure login with Supabase Auth
- Protected routes and user sessions
- Profile management

### Marketplace
- Browse products by category
- Search functionality
- Filter by category
- View detailed listing information
- Create and manage listings
- Mark items as sold or inactive

### Services
- Find local service providers
- Browse services by category
- Book services with date/time selection
- Calculate total cost based on duration
- Manage bookings (customer and provider views)
- Accept/decline booking requests
- Mark services as completed

### User Features
- Personal dashboard
- My Listings management
- Booking history
- Direct messaging (infrastructure ready)
- Favorites (infrastructure ready)
- Reviews and ratings (infrastructure ready)

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── Layout/
│   │   │   └── Header.jsx
│   │   └── Marketplace/
│   │       └── ListingCard.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Auth.jsx
│   │   ├── Marketplace.jsx
│   │   ├── Services.jsx
│   │   ├── ListingDetail.jsx
│   │   ├── CreateListing.jsx
│   │   ├── MyListings.jsx
│   │   └── Bookings.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install Dependencies

```bash
npm install
```

### Database Setup

The database schema is automatically created with the following structure:
- Users table with authentication
- Categories for products and services
- Listings with full marketplace features
- Bookings system for services
- Messages, reviews, and favorites

All tables have Row Level Security (RLS) enabled for data protection.

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Security Features

### Row Level Security (RLS)
- All database tables have RLS enabled
- Users can only access their own data
- Public listings are viewable by all authenticated users
- Bookings and messages are private to participants
- Strict policies for create, update, and delete operations

### Authentication
- Secure password-based authentication via Supabase
- Session management with JWT tokens
- Protected routes requiring authentication
- Profile data separation from auth data

## Usage Guide

### For Buyers
1. Create an account or sign in
2. Browse marketplace or services
3. Search for specific items or services
4. View detailed listings
5. Contact sellers or book services
6. Manage bookings

### For Sellers
1. Create an account or sign in
2. Create a new listing (product or service)
3. Set price type (fixed, hourly, negotiable)
4. Add category and location
5. Manage listing status
6. Respond to booking requests (for services)
7. Mark items as sold or services as completed

### For Service Providers
1. Create service listings
2. Set hourly rates or fixed prices
3. Receive booking requests
4. Accept or decline bookings
5. View customer details and notes
6. Mark services as completed

## API Integration

The application uses Supabase client library for all backend operations:
- Authentication: `supabase.auth.*`
- Database queries: `supabase.from(table).select/insert/update/delete()`
- Real-time subscriptions (ready for implementation)

## Future Enhancements

Potential features for expansion:
- Real-time messaging system
- Image upload for listings
- Advanced search with filters
- User ratings and reviews display
- Payment integration
- Email notifications
- Mobile responsive optimization
- Admin dashboard
- Analytics and reporting

## License

This project is created for educational purposes.

## Support

For issues or questions, please open an issue in the project repository.
