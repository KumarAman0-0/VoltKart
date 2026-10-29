import { useState, useEffect, useRef } from 'react';
import {
  Shield, Lock, Sparkles, Layers, RotateCw,
  Eye, Check, ArrowDown, ChevronRight, Zap, Smartphone,
  Phone, BookOpen, Palette, Camera, Target, MessageSquare,
  Music, Radio, Briefcase, Key, Send, Globe, Users,
  AlertOctagon, Image, HeartPulse
} from 'lucide-react';

const EDITIONS_PREVIEW = {
  kids: {
    name: 'VoltKart Kids',
    tag: 'Ages 5–12',
    color: '#00d4aa',
    clock: '10:30',
    apps: [
      { name: 'Parents', Icon: Phone, bg: '#00d4aa' },
      { name: 'Learning', Icon: BookOpen, bg: '#ffa502' },
      { name: 'Drawing', Icon: Palette, bg: '#ff4757' },
      { name: 'Camera', Icon: Camera, bg: '#2ed573' },
    ],
    badge: 'Approved Apps Only · Bedtime Lock',
  },
  teen: {
    name: 'VoltKart Teen',
    tag: 'Ages 13–17',
    color: '#6c63ff',
    clock: '16:45',
    apps: [
      { name: 'Study Focus', Icon: Target, bg: '#6c63ff' },
      { name: 'Chat', Icon: MessageSquare, bg: '#0094f7' },
      { name: 'Music', Icon: Music, bg: '#2ed573' },
      { name: 'Podcasts', Icon: Radio, bg: '#ffa502' },
    ],
    badge: 'Study Focus Active · Shared Wellbeing',
  },
};

const Hero3DPhone = () => {
  const [activeEdition, setActiveEdition] = useState('kids');
  const [viewMode, setViewMode] = useState('assembled'); // 'assembled' | 'exploded'
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [mouseRot, setMouseRot] = useState({ x: 8, y: -16 });
  const [spinDeg, setSpinDeg] = useState(0);
  const containerRef = useRef(null);

  // Auto-spin animation
  useEffect(() => {
    let animId;
    if (isAutoSpinning) {
      const animate = () => {
        setSpinDeg(prev => (prev + 0.8) % 360);
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoSpinning]);

  const handleMouseMove = (e) => {
    if (isAutoSpinning) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseRot({
      x: y * -24,
      y: x * 32,
    });
  };

  const handleMouseLeave = () => {
    if (!isAutoSpinning) {
      setMouseRot({ x: 8, y: -16 });
    }
  };

  const ed = EDITIONS_PREVIEW[activeEdition];
  const rotX = isAutoSpinning ? 12 : mouseRot.x;
  const rotY = isAutoSpinning ? spinDeg : mouseRot.y;

  return (
    <div
      ref={containerRef}
      className="hero-3d-interactive-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Floating Controls Bar */}
      <div className="hero-3d-controls-top">
        <div className="hero-3d-mode-toggles">
          <button
            type="button"
            className={`hero-3d-mode-btn ${viewMode === 'assembled' ? 'active' : ''}`}
            onClick={() => setViewMode('assembled')}
          >
            <Smartphone size={13} /> Assembled
          </button>
          <button
            type="button"
            className={`hero-3d-mode-btn ${viewMode === 'exploded' ? 'active' : ''}`}
            onClick={() => setViewMode('exploded')}
          >
            <Layers size={13} /> Exploded (3D)
          </button>
          <button
            type="button"
            className={`hero-3d-mode-btn ${isAutoSpinning ? 'active' : ''}`}
            onClick={() => setIsAutoSpinning(p => !p)}
            title="Auto spin 360°"
          >
            <RotateCw size={13} className={isAutoSpinning ? 'spin-anim' : ''} /> 360°
          </button>
        </div>

        {/* Live Status Badge */}
        <div className="hero-3d-status-pill">
          <span className="hero-3d-live-dot" />
          <span>INTERACTIVE 3D</span>
        </div>
      </div>

      {/* Main 3D Viewport Stage */}
      <div className="hero-3d-viewport">
        <div
          className="hero-3d-phone-rig"
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(-3deg)`,
          }}
        >
          {/* =========================================================
              LAYER 1: BACK CHASSIS & ALUMINIUM UNIBODY (Z = -60px)
              ========================================================= */}
          <div
            className="hero-phone-slab slab-back"
            style={{
              transform: viewMode === 'exploded' ? 'translateZ(-75px) translateY(35px)' : 'translateZ(-10px)',
              opacity: viewMode === 'exploded' ? 0.95 : 1,
            }}
          >
            <div className="slab-back-chassis">
              <div className="slab-back-visor">
                <div className="slab-visor-lens lens-primary">
                  <div className="visor-reflection" />
                  <span className="visor-lens-text">50MP</span>
                </div>
                <div className="slab-visor-lens lens-wide">
                  <div className="visor-reflection" />
                  <span className="visor-lens-text">12MP</span>
                </div>
                <div className="slab-visor-flash" />
              </div>
              <div className="slab-back-logo">
                <span>VoltKart</span>
                <span className="slab-back-sub">PIXEL 7 · RECYCLED AL</span>
              </div>
              <div className="slab-back-antenna-top" />
              <div className="slab-back-antenna-bottom" />
            </div>
            {viewMode === 'exploded' && (
              <span className="slab-floating-tag tag-chassis">06 · Aerospace Aluminium</span>
            )}
          </div>

          {/* =========================================================
              LAYER 2: CERTIFIED LI-PO BATTERY PACK (Z = -30px)
              ========================================================= */}
          {viewMode === 'exploded' && (
            <div
              className="hero-phone-slab slab-battery"
              style={{
                transform: 'translateZ(-35px) translateY(18px)',
              }}
            >
              <div className="slab-battery-inner">
                <div className="battery-badge">4355 mAh · 94% HEALTH</div>
                <div className="battery-desc">50-Point Benchmark Verified · Safe Thermal Cycles</div>
              </div>
              <span className="slab-floating-tag tag-battery">04 · Battery Pack</span>
            </div>
          )}

          {/* =========================================================
              LAYER 3: TITAN M2 & TENSOR MOTHERBOARD (Z = 0px)
              ========================================================= */}
          {viewMode === 'exploded' && (
            <div
              className="hero-phone-slab slab-pcb"
              style={{
                transform: 'translateZ(10px) translateY(0px)',
              }}
            >
              <div className="slab-pcb-inner">
                <div className="pcb-soc-chip">
                  <span>TENSOR G2</span>
                  <span className="pcb-soc-sub">5nm OCTA-CORE</span>
                </div>
                <div className="pcb-titan-chip">
                  <Shield size={10} color="#00d4aa" />
                  <span>TITAN M2 HSM</span>
                </div>
              </div>
              <span className="slab-floating-tag tag-pcb">03 · Titan M2 Root of Trust</span>
            </div>
          )}

          {/* =========================================================
              LAYER 4: COPPER VAPOR CHAMBER (Z = 40px)
              ========================================================= */}
          {viewMode === 'exploded' && (
            <div
              className="hero-phone-slab slab-copper"
              style={{
                transform: 'translateZ(45px) translateY(-18px)',
              }}
            >
              <div className="slab-copper-inner">
                <span>COPPER VAPOR MATRIX</span>
                <span className="copper-sub">385 W/m·K THERMAL DISSIPATION</span>
              </div>
              <span className="slab-floating-tag tag-copper">02 · Thermal Shield</span>
            </div>
          )}

          {/* =========================================================
              LAYER 5: FRONT OLED SCREEN & OLEOPHOBIC GLASS (Z = +80px)
              ========================================================= */}
          <div
            className="hero-phone-slab slab-front"
            style={{
              transform: viewMode === 'exploded' ? 'translateZ(85px) translateY(-35px)' : 'translateZ(12px)',
            }}
          >
            {/* Phone Front Glass Frame */}
            <div className="phone-screen-frame">
              {/* Camera punch-hole */}
              <div className="phone-punchhole" />

              {/* Dynamic Glass Specular Light Reflection */}
              <div className="phone-glass-specular" />

              {/* OLED Display Header */}
              <div className="phone-oled-header">
                <span className="phone-carrier">VoltKart Net</span>
                <span className="phone-time">{ed.clock}</span>
                <div className="phone-icons">
                  <Shield size={10} color={ed.color} />
                  <span className="phone-battery-lvl">94%</span>
                </div>
              </div>

              {/* Phone Active Edition Display UI */}
              <div className="phone-oled-content">
                <div className="phone-edition-hero-pill" style={{ borderColor: `${ed.color}50` }}>
                  <span className="phone-ed-dot" style={{ background: ed.color }} />
                  <span className="phone-ed-name" style={{ color: ed.color }}>{ed.name}</span>
                </div>

                <div className="phone-ed-target-tag">{ed.tag}</div>

                {/* 2x2 Interactive Launcher App Grid */}
                <div className="phone-launcher-grid">
                  {ed.apps.map((app, i) => {
                    const AppIcon = app.Icon;
                    return (
                      <div key={i} className="phone-app-tile">
                        <div className="phone-app-icon-wrap" style={{ background: `${app.bg}22`, border: `1px solid ${app.bg}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AppIcon size={18} color={app.bg} />
                        </div>
                        <span className="phone-app-label">{app.name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Launcher Security Badge */}
                <div className="phone-bottom-notice" style={{ background: `${ed.color}15`, borderColor: `${ed.color}35` }}>
                  <Lock size={10} color={ed.color} />
                  <span>{ed.badge}</span>
                </div>
              </div>

              {/* Bezel accent */}
              <div className="phone-bezel-rim" />
            </div>

            {viewMode === 'exploded' && (
              <span className="slab-floating-tag tag-oled">01 · OLED Surface Glass</span>
            )}
          </div>
        </div>

        {/* Floating Interactive Callout Badges */}
        <div className="hero-3d-floating-chip chip-left">
          <Shield size={13} color="#20bf6b" />
          <div>
            <div className="chip-title">Zero Telemetry</div>
            <div className="chip-sub">Kernel-Level Blocking</div>
          </div>
        </div>

        <div className="hero-3d-floating-chip chip-right">
          <Zap size={13} color="#ffa502" />
          <div>
            <div className="chip-title">Titan M2 HSM</div>
            <div className="chip-sub">Cryptographic Root</div>
          </div>
        </div>
      </div>

      {/* Bottom Edition Switcher Bar */}
      <div className="hero-3d-edition-bar">
        <span className="hero-3d-switch-label">TEST OS EDITIONS ON PHONE:</span>
        <div className="hero-3d-edition-pills">
          {Object.keys(EDITIONS_PREVIEW).map(key => {
            const item = EDITIONS_PREVIEW[key];
            const isSel = activeEdition === key;
            return (
              <button
                key={key}
                type="button"
                className={`hero-3d-ed-btn ${isSel ? 'active' : ''}`}
                onClick={() => setActiveEdition(key)}
                style={{
                  borderColor: isSel ? item.color : 'rgba(255, 255, 255, 0.1)',
                  color: isSel ? '#ffffff' : 'var(--avrel-text-muted)',
                  background: isSel ? item.color : 'transparent',
                }}
              >
                <span>{item.name.replace('VoltKart ', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Deep Dive Scroll Anchor */}
      <div className="hero-3d-footer-cta">
        <a href="#phone-breakdown" className="hero-3d-deepdive-link">
          <span>Scroll to take it apart layer-by-layer (6 layers)</span>
          <ArrowDown size={13} className="avrel-bounce" />
        </a>
      </div>
    </div>
  );
};

export default Hero3DPhone;
