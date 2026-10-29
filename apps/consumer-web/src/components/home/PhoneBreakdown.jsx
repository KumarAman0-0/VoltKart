import { useState, useEffect, useRef } from 'react';
import {
  Layers, Shield, Cpu, Battery, Eye, Lock,
  ChevronRight, Sparkles, Box, CheckCircle2, RotateCcw
} from 'lucide-react';

const LAYERS = [
  {
    num: '01',
    shortName: 'OLED',
    name: 'OLED Display & Touch Digitizer',
    role: 'Visual & Touch Grid Subsystem',
    spec: 'Zero Dead Pixels · 90/120Hz Fluid OLED',
    desc: 'Point 1 & 2 QA passed: Full-screen touch response grid mapped, zero dead pixels, discoloration-free, and oleophobic optical clarity certified.',
    color: '#00d4aa',
    accent: '#00d4aa',
    thickness: '0.8mm',
    temp: '28°C',
    status: 'POINT 1 & 2: QA PASSED',
  },
  {
    num: '02',
    shortName: 'Thermal',
    name: 'Copper Vapor Chamber & Heat Shield',
    role: 'Thermal Dissipation Subsystem',
    spec: '385 W/m·K Copper Conduction · Zero Throttling',
    desc: 'Laser-etched micro-mesh copper chamber dissipating heat directly away from the Tensor SoC and battery during continuous cryptographic processing.',
    color: '#e59866',
    accent: '#d35400',
    thickness: '0.4mm',
    temp: '31°C',
    status: 'THERMAL QA VERIFIED',
  },
  {
    num: '03',
    shortName: 'Titan M2',
    name: 'Titan M2 & Tensor Motherboard',
    role: 'Cryptographic Root of Trust',
    spec: 'Hardware HSM · Relocked Bootloader',
    desc: 'Point 7 QA passed: Dedicated Hardware Security Module isolates encryption keys, verifies OS boot integrity, and guarantees NIST 800-88 storage sanitization.',
    color: '#6c63ff',
    accent: '#8b84ff',
    thickness: '1.2mm',
    temp: '34°C',
    status: 'POINT 7: HARDWARE ROOT VERIFIED',
  },
  {
    num: '04',
    shortName: 'Battery',
    name: '5050mAh Certified Li-Po Battery Pack',
    role: 'Power & Energy Subsystem',
    spec: '≥ 90% Health (Guaranteed ≥80%)',
    desc: 'Point 3 QA passed: 50-point battery benchmark. Capacity tested against original spec; low internal impedance guarantees all-day privacy without throttling.',
    color: '#2ed573',
    accent: '#20bf6b',
    thickness: '3.6mm',
    temp: '29°C',
    status: 'POINT 3: BATTERY HEALTH CERTIFIED',
  },
  {
    num: '05',
    shortName: 'Cameras',
    name: 'Dual Camera Optics & Mic Array',
    role: 'Optics & Hardware Cutoffs',
    spec: '50MP Primary + 12MP Ultrawide',
    desc: 'Point 4 & 5 QA passed: Cleanroom micro-inspected lenses and VoltKart OS software kill switches that eliminate background audio or video eavesdropping.',
    color: '#ffa502',
    accent: '#e67e22',
    thickness: '2.1mm',
    temp: '27°C',
    status: 'POINT 4 & 5: SENSOR QA PASSED',
  },
  {
    num: '06',
    shortName: 'Chassis',
    name: 'Recycled Aluminium Unibody Chassis',
    role: 'Aerospace Structural Enclosure',
    spec: 'Grade A / A+ Finish · Sealed Gaskets',
    desc: 'Point 8 QA passed: Re-sealed with fresh factory water-resistant adhesive, inspected for cosmetic alignment, and graded as Like New (A+) or Light Wear (A).',
    color: '#a55eea',
    accent: '#8854d0',
    thickness: '4.8mm',
    temp: '26°C',
    status: 'POINT 8: PHYSICAL GRADE A+',
  },
];

const PhoneBreakdown = () => {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeLayerIdx, setActiveLayerIdx] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const [mouseRot, setMouseRot] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId;

    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const totalScroll = trackRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const current = -rect.top;
      const p = Math.min(Math.max(current / totalScroll, 0), 1);
      setProgress(p);

      if (!isManual) {
        const layerIdx = Math.min(Math.floor(p * 6), 5);
        setActiveLayerIdx(layerIdx);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [isManual]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseRot({ x: y * -15, y: x * 20 });
  };

  const handleMouseLeave = () => {
    setMouseRot({ x: 0, y: 0 });
  };

  // Separation factor calculation
  // Progress 0.0 -> 0.1 (assembled phone)
  // Progress 0.1 -> 0.9 (exploded view)
  // Progress 0.9 -> 1.0 (re-aligned view)
  const sepFactor = Math.min(Math.max((progress - 0.08) / 0.84, 0), 1) * 1.35;
  const currentLayer = LAYERS[activeLayerIdx];

  return (
    <div ref={trackRef} className="avrel-breakdown-track" id="phone-breakdown">
      <div className="avrel-breakdown-sticky">
        {/* Subtle Architectural Grid Lines */}
        <div className="avrel-blueprint-grid" />

        {/* Section Header */}
        <div className="avrel-section-header-compact">
          <div className="avrel-tag">
            <span className="avrel-tag-dot" /> 01 · Inside
          </div>
          <h2 className="avrel-main-h2">
            Six layers.
          </h2>
          <p className="avrel-main-p">
            Turn it, then take it apart. Every part has its own place and verification seal.
          </p>
        </div>

        {/* Main Interactive Teardown Stage */}
        <div className="avrel-stage-layout">
          {/* Left Column: Dynamic Layer Telemetry Inspector */}
          <div className="avrel-inspector-card">
            <div className="avrel-inspector-header">
              <span className="avrel-inspector-badge">
                LAYER {currentLayer.num} OF 06
              </span>
              <span className="avrel-inspector-status">
                <span className="avrel-pulse-dot" style={{ background: currentLayer.color }} />
                {currentLayer.status}
              </span>
            </div>

            <h3 className="avrel-inspector-title">
              {currentLayer.name}
            </h3>

            <div className="avrel-inspector-role">
              {currentLayer.role}
            </div>

            <div className="avrel-inspector-spec-box" style={{ borderColor: `${currentLayer.color}40` }}>
              <div style={{ color: currentLayer.color, fontWeight: 700, fontSize: '0.85rem' }}>
                {currentLayer.spec}
              </div>
              <p className="avrel-inspector-desc">
                {currentLayer.desc}
              </p>
            </div>

            {/* 6 High-Tech Telemetry Metric Data Points */}
            <div className="avrel-telemetry-grid">
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">STORAGE WIPE</span>
                <span className="avrel-tel-val" style={{ color: '#20bf6b' }}>NIST 800-88</span>
              </div>
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">BATTERY QA</span>
                <span className="avrel-tel-val">≥ 90% HEALTH</span>
              </div>
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">TELEMETRY</span>
                <span className="avrel-tel-val" style={{ color: '#00d4aa' }}>0 PACKETS</span>
              </div>
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">WARRANTY</span>
                <span className="avrel-tel-val">6 MONTHS</span>
              </div>
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">DIAGNOSTIC</span>
                <span className="avrel-tel-val">8-POINT QA</span>
              </div>
              <div className="avrel-telemetry-item">
                <span className="avrel-tel-key">E-WASTE</span>
                <span className="avrel-tel-val" style={{ color: '#f0a12c' }}>SECOND LIFE</span>
              </div>
            </div>

            {/* Quick Layer Scrubbing Pills (6 Equal Columns - No Overlap) */}
            <div className="avrel-layer-scrubber-container">
              <div className="avrel-layer-scrubber">
                {LAYERS.map((l, i) => (
                  <button
                    key={l.num}
                    className={`avrel-scrub-btn ${activeLayerIdx === i ? 'active' : ''}`}
                    onClick={() => {
                      setActiveLayerIdx(i);
                      setIsManual(true);
                    }}
                    style={{
                      borderColor: activeLayerIdx === i ? l.color : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span className="avrel-scrub-num">{l.num}</span>
                    <span className="avrel-scrub-name">{l.shortName}</span>
                  </button>
                ))}
              </div>

              {isManual && (
                <button
                  className="avrel-scrub-btn avrel-auto-btn"
                  onClick={() => setIsManual(false)}
                  title="Return to scroll tracking"
                  style={{ marginTop: '0.4rem', width: '100%', justifyContent: 'center' }}
                >
                  <RotateCcw size={11} /> Return to Scroll Auto-Track
                </button>
              )}
            </div>
          </div>

          {/* Right Column: 3D Exploded Realistic Phone Stack */}
          <div
            className="avrel-viewport-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="avrel-phone-3d-stack"
              style={{
                transform: `rotateX(${52 + mouseRot.x}deg) rotateZ(${-32 + mouseRot.y}deg) rotateY(12deg)`,
              }}
            >
              {LAYERS.map((layer, idx) => {
                const isSelected = activeLayerIdx === idx;
                // Realistic separation offset formula along Z axis
                const zOffset = (2.5 - idx) * 78 * sepFactor;
                const yOffset = (idx - 2.5) * 16 * sepFactor;

                return (
                  <div
                    key={layer.num}
                    className={`avrel-physical-slab slab-layer-${idx} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      setActiveLayerIdx(idx);
                      setIsManual(true);
                    }}
                    style={{
                      transform: `translateZ(${zOffset}px) translateY(${yOffset + (isSelected ? -20 : 0)}px)`,
                      zIndex: 10 - idx,
                    }}
                  >
                    {/* Realistic Layer Internal Graphic Renderings */}
                    {idx === 0 && (
                      /* LAYER 01: OLED Display Panel */
                      <div className="slab-content oled-layer">
                        <div className="oled-glass-reflection" />
                        <div className="oled-camera-punchhole" />
                        <div className="oled-screen-body">
                          <div className="oled-boot-badge">
                            <Lock size={12} /> VoltKart OS
                          </div>
                          <div className="oled-time">11:04</div>
                          <div className="oled-secure-boot">NIST 800-88 Verified // Storage Sealed</div>
                        </div>
                        <div className="oled-bezel-border" />
                      </div>
                    )}

                    {idx === 1 && (
                      /* LAYER 02: Copper Vapor Chamber */
                      <div className="slab-content copper-layer">
                        <div className="copper-etched-lines" />
                        <div className="copper-center-chamber">
                          <span className="copper-label">COPPER VAPOR MATRIX</span>
                          <span className="copper-spec">385 W/m·K THERMAL CONDUCTIVITY</span>
                        </div>
                        <div className="copper-pipe-left" />
                        <div className="copper-pipe-right" />
                      </div>
                    )}

                    {idx === 2 && (
                      /* LAYER 03: Titan M2 & Tensor Motherboard */
                      <div className="slab-content pcb-layer">
                        <div className="pcb-gold-traces" />
                        <div className="pcb-tensor-chip">
                          <span className="tensor-brand">GOOGLE TENSOR G2</span>
                          <span className="tensor-sub">5nm OCTA-CORE SECURE SoC</span>
                        </div>
                        <div className="pcb-titan-chip">
                          <Shield size={12} color="#00d4aa" />
                          <span className="titan-name">TITAN M2</span>
                          <span className="titan-sub">HSM CRYPTO ROOT</span>
                        </div>
                        <div className="pcb-gold-fingers" />
                      </div>
                    )}

                    {idx === 3 && (
                      /* LAYER 04: Li-Po Battery Pack */
                      <div className="slab-content battery-layer">
                        <div className="battery-spec-block">
                          <div className="battery-title">RECHARGEABLE Li-ion BATTERY</div>
                          <div className="battery-capacity">4355 mAh / 16.79 Wh · 3.87V</div>
                          <div className="battery-model">MODEL: G1AZG · NIST 800-88 SANITIZED</div>
                          <div className="battery-cert">GrapheneOS Low-Impedance QA Verified</div>
                        </div>
                        <div className="battery-qr-mock" />
                        <div className="battery-contact-pins" />
                      </div>
                    )}

                    {idx === 4 && (
                      /* LAYER 05: Camera Array Module */
                      <div className="slab-content camera-layer">
                        <div className="camera-visor-strip">
                          <div className="camera-lens-50mp">
                            <div className="lens-glass-reflection" />
                            <div className="lens-iris" />
                            <span className="lens-text">50MP</span>
                          </div>
                          <div className="camera-lens-ultrawide">
                            <div className="lens-glass-reflection" />
                            <div className="lens-iris" />
                            <span className="lens-text">12MP</span>
                          </div>
                          <div className="camera-laser-tof" />
                          <div className="camera-led-flash" />
                        </div>
                      </div>
                    )}

                    {idx === 5 && (
                      /* LAYER 06: Aluminium Unibody Chassis */
                      <div className="slab-content chassis-layer">
                        <div className="chassis-antenna-top" />
                        <div className="chassis-visor-cutout" />
                        <div className="chassis-g-logo">G</div>
                        <div className="chassis-usbc-cutout" />
                        <div className="chassis-antenna-bottom" />
                      </div>
                    )}

                    {/* Layer ID Stamp Overlay */}
                    <div className="slab-id-overlay">
                      <span className="slab-id-num">{layer.num}</span>
                      <span className="slab-id-name">{layer.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Pointer Callout Line for Selected Layer */}
            <div className="avrel-hud-pointer">
              <div className="hud-callout-line" />
              <div className="hud-callout-box">
                <span className="hud-layer-tag">{currentLayer.num} // ACTIVE INSPECTION</span>
                <span className="hud-layer-title">{currentLayer.name}</span>
                <span className="hud-layer-sub">{currentLayer.spec}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Progress Bar at Bottom */}
        <div className="avrel-breakdown-footer-bar">
          <div className="avrel-scroll-hint">
            <span>SCROLL TO EXPLODE HARDWARE</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>CLICK ANY LAYER TO PIN DETAILS</span>
          </div>
          <div className="avrel-progress-track">
            <div className="avrel-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="avrel-progress-percent">
            {Math.round(progress * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneBreakdown;
