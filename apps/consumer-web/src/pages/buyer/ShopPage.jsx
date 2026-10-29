import { useState, useEffect } from 'react';
import { shopAPI } from '../../api';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import {
  Search, Filter, Shield, Battery, Star, ShoppingCart,
  ArrowRight, CheckCircle2, ChevronRight, Check, Heart,
  Smartphone, Lock, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
const GRADE_LABELS = {
  'A+': 'Like New',
  'A': 'Like New',
  'B': 'Good',
  'C': 'Fair',
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEdition = searchParams.get('edition') || '';
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    model: '',
    os: '',
    grade: '',
    search: '',
    edition: initialEdition,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    fetchDevices();
  }, [filters, page]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        model: filters.model,
        os: filters.os,
        grade: filters.grade,
        search: filters.search,
        page,
        limit: LIMIT,
      };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await shopAPI.getDevices(params);
      setDevices(data.data);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const setEditionFilter = (editionName) => {
    setFilters(f => ({ ...f, edition: editionName }));
    if (editionName) {
      setSearchParams({ edition: editionName });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--avrel-bg)', color: 'var(--avrel-text)' }}>
      <Navbar />

      {/* Header Banner */}
      <section style={{ padding: '4.5rem 0 3rem', background: 'var(--avrel-bg)', borderBottom: '1px solid var(--avrel-border)' }}>
        <div className="container">
          <div style={{ maxWidth: '780px' }}>
            <span className="avrel-eyebrow">VERIFIED RE-SUPPORTED HARDWARE</span>
            <h1 className="avrel-section-title" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', margin: '0.2rem 0 0.75rem 0' }}>
              Verified Devices Catalog.
            </h1>
            <p style={{ color: 'var(--avrel-text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
              Phones and tablets prepared by our engineers. Every device is wiped, 8-point tested, graded, and covered by the VoltKart 6-month warranty.
            </p>
          </div>

          {/* Edition Quick Pills from Section 9: "Who is it for?" */}
          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '0.75rem', color: 'var(--avrel-text-stone)', fontWeight: 600 }}>
              WHO WILL USE THIS?
            </span>
            {[
              { id: '', label: 'All Editions' },
              { id: 'Kids', label: 'VoltKart Kids (5–12)' },
              { id: 'Teen', label: 'VoltKart Teen (13–17)' },
              { id: 'Adult', label: 'VoltKart Adult' },
              { id: 'Senior', label: 'VoltKart Senior' },
            ].map(ed => {
              const isActive = filters.edition === ed.id;
              return (
                <button
                  key={ed.id}
                  onClick={() => setEditionFilter(ed.id)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    border: isActive ? '1px solid var(--avrel-text)' : '1px solid var(--avrel-border)',
                    background: isActive ? 'var(--avrel-btn-bg)' : 'var(--avrel-card-bg)',
                    color: isActive ? '#ffffff' : 'var(--avrel-text-muted)',
                    fontFamily: 'Inter',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ed.label}
                </button>
              );
            })}
          </div>

          {/* 3D Hardware Teardown Cue */}
          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1.25rem', background: 'var(--avrel-card-bg)', border: '1px solid var(--avrel-border)', borderRadius: '14px', boxShadow: '0 2px 8px rgba(18,20,23,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', background: 'var(--avrel-bg)', border: '1px solid var(--avrel-border)' }}>
                <Cpu size={18} color="var(--avrel-text)" />
              </div>
              <div>
                <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.85rem', color: 'var(--avrel-text)' }}>
                  Interactive 3D Hardware Inspection
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--avrel-text-muted)', marginLeft: '0.5rem' }}>
                  — See how each verified device is disassembled layer-by-layer (OLED, Titan M2 chip, Li-Po battery, aluminium chassis).
                </span>
              </div>
            </div>
            <Link
              to="/#phone-breakdown"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: 'DM Mono',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#b56c00',
                textDecoration: 'none',
                background: 'rgba(240, 161, 44, 0.12)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(240, 161, 44, 0.25)',
              }}
            >
              <span>Inspect in 3D</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
        {/* Multi-Dimensional Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
          background: 'var(--avrel-card-bg)',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--avrel-border)',
          boxShadow: '0 4px 16px rgba(18, 20, 23, 0.03)',
        }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--avrel-text-stone)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '2.6rem' }}
              placeholder="Search model, brand, storage..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          <select
            className="form-select"
            style={{ flex: '0 1 180px' }}
            value={filters.model}
            onChange={e => setFilters(f => ({ ...f, model: e.target.value }))}
          >
            <option value="">All Models</option>
            {['Pixel 6', 'Pixel 6a', 'Pixel 6 Pro', 'Pixel 7', 'Pixel 7a', 'Pixel 7 Pro', 'Pixel 8', 'Pixel 8a', 'Pixel 8 Pro', 'Pixel 9', 'Fairphone 4'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ flex: '0 1 160px' }}
            value={filters.grade}
            onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))}
          >
            <option value="">All Grades</option>
            <option value="A+">Grade: Like New (A+)</option>
            <option value="A">Grade: Like New (A)</option>
            <option value="B">Grade: Good (B)</option>
            <option value="C">Grade: Fair (C)</option>
          </select>

          <select
            className="form-select"
            style={{ flex: '0 1 150px' }}
            value={filters.os}
            onChange={e => setFilters(f => ({ ...f, os: e.target.value }))}
          >
            <option value="">All OS Cores</option>
            <option value="GrapheneOS">GrapheneOS Core</option>
            <option value="/e/OS">/e/OS Core</option>
            <option value="LineageOS">LineageOS Core</option>
            <option value="CalyxOS">CalyxOS Core</option>
          </select>
        </div>

        {/* Inventory Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontFamily: 'DM Mono', fontSize: '0.8rem', color: 'var(--avrel-text-stone)' }}>
          <div>
            SHOWING {devices.length} OF {total} VERIFIED DEVICES
          </div>
          <div>
            100% NIST 800-88 STORAGE SANITIZED
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="page-loader" style={{ padding: '6rem 0' }}>
            <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3, borderTopColor: 'var(--avrel-text)' }} />
            <span style={{ color: 'var(--avrel-text-muted)', marginTop: '1rem' }}>Inspecting available warehouse stock...</span>
          </div>
        ) : devices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--avrel-card-bg)', borderRadius: '20px', border: '1px solid var(--avrel-border)' }}>
            <Smartphone size={48} strokeWidth={1.5} color="var(--avrel-text-stone)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>No matching devices in warehouse</h3>
            <p style={{ color: 'var(--avrel-text-muted)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
              Try adjusting your model, grade, or OS filters to view available inventory.
            </p>
            <button
              onClick={() => setFilters({ model: '', os: '', grade: '', search: '', edition: '' })}
              className="btn btn-outline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid-4 animate-fade">
              {devices.map(device => {
                const gradeLabel = GRADE_LABELS[device.grade] || 'Like New';
                const inWish = isInWishlist(device._id);
                const mrp = Math.round((device.sellingPrice || 24000) * 1.62);
                const discountPercent = Math.round(((mrp - device.sellingPrice) / mrp) * 100);

                return (
                  <div key={device._id} className="product-card">
                    {/* Media Container with Image, Badges, and Hover Actions */}
                    <div className="product-card-media">
                      <Link
                        to={`/devices/${device._id}`}
                        style={{ display: 'block', width: '100%', height: '100%' }}
                      >
                        {device.photos?.[0] ? (
                          <img src={device.photos[0]} alt={device.model} className="product-card-image" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Smartphone size={40} strokeWidth={1.5} color="var(--avrel-text-stone)" />
                          </div>
                        )}
                      </Link>

                      {/* Top Badges: Discount % + Grade */}
                      <div className="product-card-top-badges">
                        <span className="badge-discount">SAVE {discountPercent}%</span>
                        <span className="badge-grade-top">{gradeLabel}</span>
                      </div>

                      {/* Top Right Quick Actions: Wishlist Heart */}
                      <div className="product-card-quick-actions">
                        <button
                          type="button"
                          className={`quick-action-btn ${inWish ? 'active-wishlist' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(device);
                          }}
                          title={inWish ? 'Remove from saved' : 'Save to wishlist'}
                          aria-label="Wishlist"
                        >
                          <Heart size={15} fill={inWish ? '#ffffff' : 'none'} color={inWish ? '#ffffff' : 'currentColor'} />
                        </button>
                      </div>

                      {/* Bottom Slide-up Quick Add to Bag */}
                      <button
                        type="button"
                        className="product-card-quick-add-bar"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(device, filters.edition ? `VoltKart ${filters.edition}` : 'VoltKart Adult');
                        }}
                      >
                        <ShoppingCart size={13} />
                        <span>+ QUICK ADD TO BAG</span>
                      </button>
                    </div>

                    {/* Product Details Body */}
                    <div className="product-card-body">
                      {/* Star Rating */}
                      <div className="product-card-rating">
                        <div className="product-card-rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} fill="#f0a12c" color="#f0a12c" />
                          ))}
                        </div>
                        <span>4.9 (38)</span>
                      </div>

                      {/* Device Title & Grade */}
                      <Link to={`/devices/${device._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="product-card-title" style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: 800 }}>
                          {device.model}
                        </h3>
                      </Link>

                      {/* Specs Row */}
                      <div className="product-card-specs" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: '#b56c00', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Lock size={10} /> {device.os}
                        </span>
                        {device.batteryHealth && (
                          <span style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: '#20bf6b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Battery size={11} /> {device.batteryHealth}%
                          </span>
                        )}
                        <span style={{ fontFamily: 'DM Mono', fontSize: '0.68rem', color: 'var(--avrel-text-stone)' }}>
                          {device.storage || '128GB'}
                        </span>
                      </div>

                      {/* Edition compatibility note */}
                      <div style={{ fontSize: '0.72rem', color: 'var(--avrel-text-stone)', margin: '0.3rem 0 0.75rem', fontFamily: 'DM Mono' }}>
                        Available in: Kids · Teen · Adult · Senior
                      </div>

                      {/* Price Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--avrel-border)' }}>
                        <div className="product-card-price-row">
                          <span className="product-card-price-main">
                            ₹{device.sellingPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="product-card-mrp">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link
                          to={`/devices/${device._id}`}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--avrel-text)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <span>Inspect</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span style={{ padding: '0.4rem 1rem', color: 'var(--avrel-text-muted)', fontSize: '0.875rem', fontFamily: 'DM Mono' }}>
                  Page {page} of {Math.ceil(total / LIMIT)}
                </span>
                <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShopPage;
