import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { sellerAPI } from '../../api';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const MODELS = [
  'Pixel 6', 'Pixel 6a', 'Pixel 6 Pro',
  'Pixel 7', 'Pixel 7a', 'Pixel 7 Pro',
  'Pixel 8', 'Pixel 8a', 'Pixel 8 Pro',
  'Pixel 9', 'Pixel 9 Pro',
  'Other (eOS/LineageOS)',
];

const NewSellRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [upToPrice, setUpToPrice] = useState(null);
  const [form, setForm] = useState({
    model: '', storage: '', color: '', condition: '', expectedPrice: '', description: '',
    street: '', city: '', state: '', pincode: '',
    pickupDate: '', pickupSlot: '',
    consentGiven: false,
  });

  useEffect(() => {
    if (!form.model) {
      setUpToPrice(null);
      return;
    }
    sellerAPI.getEstimate({ model: form.model, storage: form.storage || '128GB' })
      .then(res => {
        if (res.data?.estimatedMax) setUpToPrice(res.data.estimatedMax);
        else setUpToPrice(null);
      })
      .catch(() => setUpToPrice(null));
  }, [form.model, form.storage]);

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (i) => {
    setPhotos(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consentGiven) { toast.error('Please give consent to proceed'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (!['street','city','state','pincode','consentGiven','pickupDate','pickupSlot'].includes(k)) fd.append(k, v);
      });
      fd.append('address[street]', form.street);
      fd.append('address[city]', form.city);
      fd.append('address[state]', form.state);
      fd.append('address[pincode]', form.pincode);
      if (form.pickupDate) fd.append('pickupDate', form.pickupDate);
      if (form.pickupSlot) fd.append('pickupSlot', form.pickupSlot);
      photos.forEach(p => fd.append('photos', p));

      await sellerAPI.createRequest(fd);
      toast.success('Sell request submitted! We will review and make an offer.');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Sell Your Device</h1>
        <p>Fill in the details and we'll make you an offer within 24 hours</p>
      </div>
      <div className="page-body" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Device Information</h2>

            <div className="form-group">
              <label className="form-label">Model *</label>
              <select className="form-select" value={form.model} onChange={set('model')} required>
                <option value="">Select Model</option>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Storage</label>
                <select className="form-select" value={form.storage} onChange={set('storage')}>
                  <option value="">Select Storage</option>
                  {['64GB','128GB','256GB','512GB'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-input" placeholder="e.g. Obsidian" value={form.color} onChange={set('color')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Condition *</label>
              <select className="form-select" value={form.condition} onChange={set('condition')} required>
                <option value="">Select Condition</option>
                <option value="like_new">Like New — minimal use, no scratches</option>
                <option value="good">Good — light scratches, fully working</option>
                <option value="fair">Fair — visible wear, working fine</option>
                <option value="poor">Poor — heavy wear or minor issues</option>
              </select>
            </div>

            {upToPrice && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(32, 191, 107, 0.1)',
                border: '1px solid rgba(32, 191, 107, 0.3)',
                marginBottom: '1rem',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--volt-success)', fontSize: '0.95rem' }}>
                  💡 Is model ke liye ₹{upToPrice.toLocaleString('en-IN')} tak mil sakta hai
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  * Asli price phone check karne ke baad pakka hota hai.
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mera Rate / Expected Price (₹) *</label>
              <input className="form-input" type="number" placeholder="e.g. 18000" min="1000"
                value={form.expectedPrice} onChange={set('expectedPrice')} required />
              <span className="text-muted text-xs" style={{ display: 'block', marginTop: '0.35rem' }}>
                Aap kitna lena chahte hain. Final price kabhi isse zyada nahi hoga.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-textarea" placeholder="Any accessories included, original box, etc."
                value={form.description} onChange={set('description')} />
            </div>
          </div>

          {/* Photos */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Device Photos</h2>
            <p className="text-muted text-sm" style={{ marginBottom: '1rem' }}>Upload 1-3 photos (front, back, screen)</p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 100, height: 100 }}>
                  <img src={src} alt={`preview-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => removePhoto(i)} style={{
                    position: 'absolute', top: -6, right: -6, width: 22, height: 22,
                    background: 'var(--volt-danger)', color: '#fff', border: 'none', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}><X size={12} /></button>
                </div>
              ))}
              {photos.length < 3 && (
                <label style={{
                  width: 100, height: 100, border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', gap: '0.25rem',
                  transition: 'var(--transition-fast)',
                }}>
                  <Upload size={20} />
                  Add Photo
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhoto} />
                </label>
              )}
            </div>
          </div>

          {/* Pickup Address */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Pickup Address</h2>
            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input className="form-input" placeholder="House No, Street, Area" value={form.street} onChange={set('street')} required />
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="Mumbai" value={form.city} onChange={set('city')} required />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input className="form-input" placeholder="Maharashtra" value={form.state} onChange={set('state')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input className="form-input" placeholder="400001" value={form.pincode} onChange={set('pincode')} required />
              </div>
            </div>
          </div>

          {/* Pickup Schedule */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Pickup Schedule</h2>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Preferred Pickup Date</label>
                <input className="form-input" type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.pickupDate} onChange={set('pickupDate')} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot</label>
                <select className="form-select" value={form.pickupSlot} onChange={set('pickupSlot')}>
                  <option value="">Select slot</option>
                  <option value="morning">🌅 Morning (9 AM – 12 PM)</option>
                  <option value="afternoon">☀️ Afternoon (12 PM – 3 PM)</option>
                  <option value="evening">🌆 Evening (3 PM – 6 PM)</option>
                </select>
              </div>
            </div>
            <div className="alert alert-info" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              ℹ️ Condition, battery, IMEI, and locks — our agent will check everything on-spot. No need to describe them.
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <label className="checklist-item" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={form.consentGiven} onChange={e => setForm(f => ({ ...f, consentGiven: e.target.checked }))} />
              <div>
                <div className="checklist-label">I confirm this device belongs to me</div>
                <div className="checklist-sublabel">I consent that this device is not stolen/blacklisted and I have the legal right to sell it.</div>
              </div>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : '📦 Submit Sell Request'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewSellRequest;
