import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import {
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight,
  Shield, Truck, Check, Smartphone
} from 'lucide-react';

const CartDrawer = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isCartOpen) setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (cart.length > 0) {
      const target = cart[0];
      const targetId = target._id || target.id;
      navigate(`/devices/${targetId}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="avrel-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="avrel-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="avrel-drawer-header">
          <div className="avrel-drawer-title-box">
            <ShoppingBag size={20} color="var(--avrel-text)" />
            <h2 className="avrel-drawer-title">Your Bag</h2>
            <span className="avrel-drawer-badge">{cartCount} {cartCount === 1 ? 'device' : 'devices'}</span>
          </div>
          <button
            className="avrel-drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping & Assurance Banner */}
        <div className="avrel-drawer-perk-bar">
          <Truck size={14} color="#20bf6b" />
          <span>Free Insured Express Delivery across India included</span>
        </div>

        {/* Cart Items List */}
        <div className="avrel-drawer-body">
          {cart.length === 0 ? (
            <div className="avrel-drawer-empty">
              <div className="avrel-empty-icon"><ShoppingBag size={48} strokeWidth={1.5} /></div>
              <h3 className="avrel-empty-title">Your bag is empty</h3>
              <p className="avrel-empty-sub">
                Explore our catalog of verified phones flashed with custom VoltKart OS editions.
              </p>
              <button
                className="btn btn-primary btn-md"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
              >
                <span>Browse Verified Phones</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="avrel-drawer-items-list">
              {cart.map((item) => (
                <div key={item.cartId} className="avrel-cart-item-card">
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
                        onClick={() => removeFromCart(item.cartId)}
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="avrel-cart-item-meta">
                      <span>{item.storage || '128GB'}</span>
                      <span>·</span>
                      <span className="avrel-cart-grade-badge">Grade {item.grade || 'A+'}</span>
                    </div>

                    {/* Chosen OS Edition Pill */}
                    <div className="avrel-cart-edition-tag">
                      <span className="edition-dot" />
                      <span>{item.chosenEdition || 'VoltKart Adult'}</span>
                    </div>

                    <div className="avrel-cart-item-bottom">
                      <div className="avrel-cart-price">
                        ₹{(item.sellingPrice || 0).toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="avrel-cart-qty-stepper">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cartId, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cartId, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="avrel-drawer-footer">
            <div className="avrel-drawer-summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-val">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="avrel-drawer-summary-row">
              <span className="summary-label">Shipping & Insurance</span>
              <span className="summary-val" style={{ color: '#20bf6b', fontWeight: 600 }}>FREE</span>
            </div>

            <div className="avrel-drawer-warranty-notice">
              <Shield size={13} color="#b56c00" />
              <span>Includes VoltKart 6-Month Replacement Warranty</span>
            </div>

            <div className="avrel-drawer-total-row">
              <span className="total-label">Estimated Total</span>
              <span className="total-val">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              className="btn btn-primary btn-xl avrel-checkout-btn"
              onClick={handleCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="avrel-clear-cart-link"
              onClick={clearCart}
            >
              Clear bag
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
