import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  X, Heart, Trash2, ShoppingBag, ArrowRight, Smartphone
} from 'lucide-react';

const WishlistDrawer = () => {
  const {
    wishlist,
    wishlistCount,
    toggleWishlist,
    moveToCart,
    isWishlistOpen,
    setIsWishlistOpen,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isWishlistOpen) setIsWishlistOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isWishlistOpen, setIsWishlistOpen]);

  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  if (!isWishlistOpen) return null;

  return (
    <div className="avrel-drawer-overlay" onClick={() => setIsWishlistOpen(false)}>
      <div
        className="avrel-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="avrel-drawer-header">
          <div className="avrel-drawer-title-box">
            <Heart size={20} color="#eb3b5a" fill="#eb3b5a" />
            <h2 className="avrel-drawer-title">Wishlist</h2>
            <span className="avrel-drawer-badge">{wishlistCount} {wishlistCount === 1 ? 'saved' : 'saved'}</span>
          </div>
          <button
            className="avrel-drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="avrel-drawer-body">
          {wishlist.length === 0 ? (
            <div className="avrel-drawer-empty">
              <div className="avrel-empty-icon"><Heart size={48} strokeWidth={1.5} /></div>
              <h3 className="avrel-empty-title">Your wishlist is empty</h3>
              <p className="avrel-empty-sub">
                Click the heart icon on any phone card to save devices for easy comparison.
              </p>
              <button
                className="btn btn-primary btn-md"
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigate('/shop');
                }}
              >
                <span>Browse Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="avrel-drawer-items-list">
              {wishlist.map((item) => (
                <div key={item._id || item.id} className="avrel-cart-item-card">
                  <div className="avrel-cart-item-img-wrap">
                    {item.photos && item.photos[0] ? (
                      <img src={item.photos[0]} alt={item.model} className="avrel-cart-img" />
                    ) : (
                      <div className="avrel-cart-placeholder">
                        <Smartphone size={24} color="var(--avrel-text-stone)" />
                      </div>
                    )}
                  </div>

                  <div className="avrel-cart-item-details">
                    <div className="avrel-cart-item-top">
                      <h4 className="avrel-cart-item-title">
                        {item.model}
                      </h4>
                      <button
                        className="avrel-cart-remove-btn"
                        onClick={() => toggleWishlist(item)}
                        title="Remove from saved"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="avrel-cart-item-meta">
                      <span>{item.storage || '128GB'}</span>
                      <span>·</span>
                      <span className="avrel-cart-grade-badge">Grade {item.grade || 'A+'}</span>
                      <span>·</span>
                      <span style={{ color: '#20bf6b' }}>{item.batteryHealth || 90}% Battery</span>
                    </div>

                    <div className="avrel-cart-item-bottom" style={{ marginTop: '0.75rem' }}>
                      <div className="avrel-cart-price">
                        ₹{(item.sellingPrice || 0).toLocaleString('en-IN')}
                      </div>

                      <button
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', gap: '0.35rem' }}
                        onClick={() => moveToCart(item)}
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
