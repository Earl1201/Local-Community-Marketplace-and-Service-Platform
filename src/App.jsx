import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Layout/Header'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Marketplace from './pages/Marketplace'
import Services from './pages/Services'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'
import MyListings from './pages/MyListings'
import Bookings from './pages/Bookings'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/services" element={<Services />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/bookings" element={<Bookings />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App