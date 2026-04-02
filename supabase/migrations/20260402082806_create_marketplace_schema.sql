/*
  # Local Community Marketplace and Service Platform - Initial Schema

  ## Overview
  This migration creates the database schema for a community marketplace where users can:
  - List items for sale
  - Offer services
  - Book services from other providers
  - Manage their listings and bookings
  - Rate and review transactions

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact phone number
  - `avatar_url` (text) - Profile picture URL
  - `location` (text) - User's location/city
  - `bio` (text) - User bio/description
  - `is_service_provider` (boolean) - Whether user offers services
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. categories
  - `id` (uuid, primary key) - Category identifier
  - `name` (text) - Category name
  - `type` (text) - 'product' or 'service'
  - `description` (text) - Category description
  - `icon` (text) - Icon name or URL
  - `created_at` (timestamptz)

  ### 3. listings
  - `id` (uuid, primary key) - Listing identifier
  - `user_id` (uuid, foreign key) - Owner of the listing
  - `category_id` (uuid, foreign key) - Category reference
  - `title` (text) - Listing title
  - `description` (text) - Detailed description
  - `type` (text) - 'product' or 'service'
  - `price` (numeric) - Price or rate
  - `price_type` (text) - 'fixed', 'hourly', 'negotiable'
  - `images` (text[]) - Array of image URLs
  - `location` (text) - Item/service location
  - `status` (text) - 'active', 'sold', 'inactive'
  - `views_count` (integer) - Number of views
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. bookings
  - `id` (uuid, primary key) - Booking identifier
  - `listing_id` (uuid, foreign key) - Service listing
  - `customer_id` (uuid, foreign key) - Customer booking the service
  - `provider_id` (uuid, foreign key) - Service provider
  - `booking_date` (date) - Scheduled date
  - `booking_time` (time) - Scheduled time
  - `duration_hours` (numeric) - Service duration
  - `total_price` (numeric) - Total booking cost
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `notes` (text) - Additional booking notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. messages
  - `id` (uuid, primary key) - Message identifier
  - `listing_id` (uuid, foreign key) - Related listing
  - `sender_id` (uuid, foreign key) - Message sender
  - `receiver_id` (uuid, foreign key) - Message receiver
  - `content` (text) - Message content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)

  ### 6. reviews
  - `id` (uuid, primary key) - Review identifier
  - `listing_id` (uuid, foreign key) - Reviewed listing
  - `booking_id` (uuid, foreign key, optional) - Related booking
  - `reviewer_id` (uuid, foreign key) - User writing review
  - `reviewee_id` (uuid, foreign key) - User being reviewed
  - `rating` (integer) - Rating 1-5
  - `comment` (text) - Review text
  - `created_at` (timestamptz)

  ### 7. favorites
  - `id` (uuid, primary key) - Favorite identifier
  - `user_id` (uuid, foreign key) - User who favorited
  - `listing_id` (uuid, foreign key) - Favorited listing
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Users can create/update/delete their own listings
  - Public can view active listings
  - Only participants can view messages and bookings
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  location text,
  bio text,
  is_service_provider boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('product', 'service')),
  price numeric(10,2) NOT NULL DEFAULT 0,
  price_type text NOT NULL DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'negotiable')),
  images text[] DEFAULT '{}',
  location text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  duration_hours numeric(4,2) NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for listings
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id OR auth.uid() = customer_id)
  WITH CHECK (auth.uid() = provider_id OR auth.uid() = customer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);

-- Insert default categories
INSERT INTO categories (name, type, description, icon) VALUES
  ('Electronics', 'product', 'Electronic devices and gadgets', 'laptop'),
  ('Furniture', 'product', 'Home and office furniture', 'chair'),
  ('Clothing', 'product', 'Apparel and accessories', 'shirt'),
  ('Books', 'product', 'Books and educational materials', 'book'),
  ('Home Repair', 'service', 'Plumbing, electrical, carpentry', 'tools'),
  ('Tutoring', 'service', 'Educational tutoring services', 'graduation-cap'),
  ('Cleaning', 'service', 'Home and office cleaning', 'broom'),
  ('Pet Care', 'service', 'Pet sitting and grooming', 'paw')
ON CONFLICT (name) DO NOTHING;