import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Save, X, AlertTriangle, TrendingDown, Tag, Award } from 'lucide-react';

const TABS = [
  { id: 'base',       label: '📱 Base Prices',   icon: Tag },
  { id: 'deductions', label: '📉 Deductions',     icon: TrendingDown },
  { id: 'grades',     label: '🏆 Grade Rules',    icon: Award },
  { id: 'alerts',     label: '🚨 Price Alerts',   icon: AlertTriangle },
];

const DEDUCTION_CATEGORIES = ['screen', 'body', 'battery', 'functional', 'locks', 'accessories'];
const GRADES = ['A+', 'A', 'B', 'C'];

// ─── Modal ───────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

// ─── Base Prices Tab ─────────────────────────────────────────────────────────
const BasePricesTab = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ brand: '', model: '', storage: '', basePrice: '', minFloor: '500' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = () => {
    setLoading(true);
    adminAPI.getBasePrices()
      .then(r => setPrices(r.data.data))
      .catch(() => toast.error('Failed to load prices'))
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.upsertBasePrice(form);
      toast.success('Base price saved!');
      setShowModal(false);
      setForm({ brand: '', model: '', storage: '', basePrice: '', minFloor: '500' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this price entry?')) return;
    await adminAPI.deleteBasePrice(id);
    toast.success('Deactivated');
    fetch();
  };

  const filtered = prices.filter(p =>
    !search || p.brand.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" placeholder="Search brand or model..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add / Update Price
        </button>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
        ⚠️ <strong>Important:</strong> Existing sell requests will NOT be affected. Only new inspections use updated prices.
      </div>

      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Brand</th><th>Model</th><th>Storage</th>
              <th>Base Price</th><th>Min Floor</th><th>Updated</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No entries yet. Add your first base price.
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.brand}</td>
                  <td>{p.model}</td>
                  <td><span style={{ background: 'var(--bg-glass)', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.8rem' }}>{p.storage}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--volt-accent)' }}>₹{p.basePrice?.toLocaleString('en-IN')}</td>
                  <td className="text-muted">₹{p.minFloor?.toLocaleString('en-IN')}</td>
                  <td className="text-muted text-sm">{new Date(p.updatedAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ brand: p.brand, model: p.model, storage: p.storage, basePrice: p.basePrice, minFloor: p.minFloor }); setShowModal(true); }}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--volt-danger)' }} onClick={() => handleDelete(p._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add / Update Base Price" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <input className="form-input" placeholder="e.g. Google" value={form.brand}
                  onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input className="form-input" placeholder="e.g. Pixel 7" value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Storage *</label>
                <select className="form-select" value={form.storage}
                  onChange={e => setForm(f => ({ ...f, storage: e.target.value }))} required>
                  <option value="">Select</option>
                  {['64GB','128GB','256GB','512GB','1TB'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Base Price (₹) *</label>
                <input className="form-input" type="number" placeholder="e.g. 25000" value={form.basePrice}
                  onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} required min={0} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Min Floor Price (₹)</label>
              <input className="form-input" type="number" placeholder="500" value={form.minFloor}
                onChange={e => setForm(f => ({ ...f, minFloor: e.target.value }))} min={0} />
              <div className="text-muted text-sm" style={{ marginTop: 4 }}>Price will never go below this amount</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={14} /> Save Price</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ─── Deductions Tab ──────────────────────────────────────────────────────────
const DeductionsTab = () => {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ issueCode: '', description: '', category: '', amount: '', isPercentage: false });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminAPI.getDeductions()
      .then(r => setDeductions(r.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.upsertDeduction(form);
      toast.success('Deduction saved!');
      setShowModal(false);
      setForm({ issueCode: '', description: '', category: '', amount: '', isPercentage: false });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this deduction?')) return;
    await adminAPI.deleteDeduction(id);
    toast.success('Deactivated'); fetch();
  };

  const catColor = { screen: '#ef4444', body: '#f97316', battery: '#eab308', functional: '#3b82f6', locks: '#8b5cf6', accessories: '#6b7280' };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Deduction Rule
        </button>
      </div>

      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Issue Code</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th>
            </tr></thead>
            <tbody>
              {deductions.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No deduction rules. Add issues that reduce device value.
                </td></tr>
              ) : deductions.map(d => (
                <tr key={d._id}>
                  <td><code style={{ fontSize: '0.8rem', background: 'var(--bg-glass)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{d.issueCode}</code></td>
                  <td>{d.description}</td>
                  <td>
                    <span style={{ background: `${catColor[d.category] || '#888'}20`, color: catColor[d.category] || '#888', padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {d.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--volt-danger)' }}>
                    {d.isPercentage ? `${d.amount}%` : `₹${d.amount?.toLocaleString('en-IN')}`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ issueCode: d.issueCode, description: d.description, category: d.category, amount: d.amount, isPercentage: d.isPercentage }); setShowModal(true); }}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--volt-danger)' }} onClick={() => handleDelete(d._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Add / Edit Deduction Rule" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Issue Code * (UPPERCASE_SNAKE)</label>
              <input className="form-input" placeholder="e.g. SCREEN_CRACK" value={form.issueCode}
                onChange={e => setForm(f => ({ ...f, issueCode: e.target.value.toUpperCase() }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <input className="form-input" placeholder="e.g. Screen cracked or broken" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                  <option value="">Select...</option>
                  {DEDUCTION_CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-input" type="number" placeholder={form.isPercentage ? '10 (%)' : '3000 (₹)'} value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min={0} />
              </div>
            </div>
            <label className="checklist-item" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isPercentage}
                onChange={e => setForm(f => ({ ...f, isPercentage: e.target.checked }))} />
              <div>
                <div className="checklist-label">Deduct as percentage of base price</div>
                <div className="checklist-sublabel">If checked, amount is % of base price. Otherwise flat ₹ amount.</div>
              </div>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={14} /> Save</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ─── Grade Rules Tab ─────────────────────────────────────────────────────────
const GradesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ grade: '', label: '', minScore: '', maxScore: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminAPI.getGradeRules()
      .then(r => setRules(r.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.upsertGradeRule(form);
      toast.success('Grade rule saved!');
      setForm({ grade: '', label: '', minScore: '', maxScore: '', description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const gradeColor = { 'A+': '#20bf6b', 'A': '#45aaf2', 'B': '#fd9644', 'C': '#eb3b5a' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Current Grade Rules</h3>
        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rules.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-glass)', borderRadius: 12 }}>
                No grade rules set. Add them →
              </div>
            ) : rules.map(r => (
              <div key={r._id} style={{
                background: 'var(--bg-glass)', borderRadius: 12, padding: '1rem',
                border: `1px solid ${gradeColor[r.grade] || 'var(--border)'}40`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: gradeColor[r.grade] }}>{r.grade}</span>
                  <span style={{ marginLeft: '0.75rem', color: 'var(--text-secondary)' }}>{r.label}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Score: {r.minScore} – {r.maxScore}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setForm({ grade: r.grade, label: r.label || '', minScore: r.minScore, maxScore: r.maxScore, description: r.description || '' })}>
                  <Edit2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Set Grade Rule</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Grade *</label>
            <select className="form-select" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} required>
              <option value="">Select grade</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Label</label>
            <input className="form-input" placeholder="e.g. Excellent" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Min Score *</label>
              <input className="form-input" type="number" placeholder="0" min={0} max={100} value={form.minScore} onChange={e => setForm(f => ({ ...f, minScore: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Max Score *</label>
              <input className="form-input" type="number" placeholder="100" min={0} max={100} value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : <><Save size={14} /> Save Rule</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Alerts Tab ──────────────────────────────────────────────────────────────
const AlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAlerts()
      .then(r => setAlerts(r.data.data))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
        <AlertTriangle size={16} style={{ display: 'inline', marginRight: 6 }} />
        These inspections have a final price more than 30% below the estimated max. Review carefully.
      </div>

      {loading ? <div className="page-loader"><div className="spinner" /></div> : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No price mismatch alerts</h3>
          <p>All inspections are within acceptable range</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Device</th><th>Estimated Max</th><th>Final Price</th><th>Gap</th><th>Agent</th><th>Date</th>
            </tr></thead>
            <tbody>
              {alerts.map(a => {
                const estimated = a.sellRequest?.estimatedMax || a.sellRequest?.offeredPrice || 0;
                const gap = estimated > 0 ? Math.round((1 - a.finalPrice / estimated) * 100) : 0;
                return (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.sellRequest?.model}</td>
                    <td>₹{estimated?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--volt-danger)' }}>₹{a.finalPrice?.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ color: 'var(--volt-danger)', fontWeight: 700 }}>↓ {gap}% lower</span>
                    </td>
                    <td className="text-muted">{a.agent?.name}</td>
                    <td className="text-muted text-sm">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const AdminPriceTables = () => {
  const [activeTab, setActiveTab] = useState('base');

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Price Tables</h1>
        <p>Manage base prices, deductions, grade rules, and price mismatch alerts</p>
      </div>

      <div className="page-body">
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '0.6rem 1.1rem', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem',
              background: activeTab === tab.id ? 'var(--bg-glass)' : 'transparent',
              color: activeTab === tab.id ? 'var(--volt-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--volt-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'base'       && <BasePricesTab />}
        {activeTab === 'deductions' && <DeductionsTab />}
        {activeTab === 'grades'     && <GradesTab />}
        {activeTab === 'alerts'     && <AlertsTab />}
      </div>
    </DashboardLayout>
  );
};

export default AdminPriceTables;
