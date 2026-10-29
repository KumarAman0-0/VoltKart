import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AnnouncementBar from './AnnouncementBar';
import {
  User as UserIcon, LogOut, Shield, ShoppingBag,
  Heart, Search, X, ArrowRight, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const POPULAR_SEARCHES = [
  { model: 'Pixel 7', sub: 'Flagship Grade A+ · GrapheneOS', link: '/shop?model=Pixel+7' },
  { model: 'Pixel 6a', sub: 'Best for Kids & Teen Edition', link: '/shop?model=Pixel+6a' },
  { model: 'VoltKart Kids', sub: 'Ages 5–12 · Safe Launcher', link: '/editions#kids' },
  { model: 'VoltKart Senior', sub: 'High Contrast · SOS Button', link: '/editions#senior' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount, setIsCartOpen, setIsWishlistOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const ROLE_DASHBOARDS = {
    admin: '/admin',
    seller: '/seller',
    agent: '/agent',
    engineer: '/engineer',
    buyer: '/buyer/orders',
  };

  const navLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Editions', path: '/editions' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Sell Device', path: '/seller/new' },
    { label: 'Guardian', path: '/guardian' },
    { label: 'About', path: '/about' },
    { label: 'FAQ', path: '/faq' },
  ];

  return (
    <>
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Sticky Navigation */}
      <nav className="navbar avrel-nav">
        <div className="container navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to="/" className="avrel-nav-brand" style={{ textDecoration: 'none', border: 'none', outline: 'none' }}>
              <span className="avrel-logo-text">VoltKart</span>
              <span className="avrel-nav-pill">OUR SOFTWARE</span>
            </Link>

            <div className="avrel-nav-links">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`avrel-nav-link-item ${isActive ? 'active' : ''}`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="avrel-nav-active-bar" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center / Right: Live Search + Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Live Pill Search Box */}
            <div ref={searchRef} className="avrel-nav-search-wrap">
              <form onSubmit={handleSearchSubmit} className="avrel-nav-search-form">
                <Search size={15} color="#cbd5e1" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search phones, editions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="avrel-nav-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="avrel-search-clear-btn"
                    aria-label="Clear search"
                  >
                    <X size={12} color="#cbd5e1" />
                  </button>
                )}
              </form>

              {/* Floating Instant Search Dropdown */}
              {searchOpen && (
                <div className="avrel-search-dropdown-menu">
                  <div className="dropdown-label">
                    {searchQuery ? `SEARCH RESULTS FOR "${searchQuery}"` : 'POPULAR EXPLORATIONS'}
                  </div>
                  <div className="dropdown-items-list">
                    {POPULAR_SEARCHES.filter(s =>
                      !searchQuery || s.model.toLowerCase().includes(searchQuery.toLowerCase()) || s.sub.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.link}
                        className="dropdown-item"
                        onClick={() => setSearchOpen(false)}
                      >
                        <Smartphone size={15} color="#f0a12c" />
                        <div className="dropdown-item-texts">
                          <span className="dropdown-item-title">{item.model}</span>
                          <span className="dropdown-item-sub">{item.sub}</span>
                        </div>
                        <ArrowRight size={12} color="#94a3b8" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Wishlist & Bag */}
            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Wishlist Drawer Trigger */}
              <button
                type="button"
                className="avrel-nav-icon-btn"
                onClick={() => setIsWishlistOpen(true)}
                title="Wishlist (Saved Devices)"
                aria-label="Wishlist"
              >
                <Heart size={18} color="#ffffff" strokeWidth={2} fill={wishlistCount > 0 ? '#ff4757' : 'none'} />
                {wishlistCount > 0 && (
                  <span className="avrel-icon-badge badge-wishlist">{wishlistCount}</span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                className="avrel-nav-icon-btn"
                onClick={() => setIsCartOpen(true)}
                title="Your Bag"
                aria-label="Cart"
              >
                <ShoppingBag size={18} color="#ffffff" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="avrel-icon-badge badge-cart">{cartCount}</span>
                )}
              </button>

              {/* User Authentication state */}
              {user ? (
                <>
                  <Link to={ROLE_DASHBOARDS[user.role] || '/buyer/orders'} className="nav-auth-user-btn">
                    <UserIcon size={14} />
                    <span>{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="nav-auth-logout-btn" title="Log out">
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="avrel-sign-in-btn">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
