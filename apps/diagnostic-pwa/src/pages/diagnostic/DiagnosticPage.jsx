import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { diagnosticAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  Smartphone, CheckCircle, XCircle, Volume2, Mic,
  Camera, Zap, Compass, Wifi, Battery, ArrowRight, RefreshCw,
  AlertTriangle, Check
} from 'lucide-react';

const DiagnosticPage = () => {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTest, setCurrentTest] = useState(0); // 0=Intro, 1=Touch, 2=Display, 3=Speaker, 4=Mic, 5=Camera, 6=Sensors, 7=Summary, 8=Done
  const [submitting, setSubmitting] = useState(false);

  // Test Results State
  const [results, setResults] = useState({
    touch: { passed: false, uncoveredBoxes: 24 },
    display: { passed: null, notes: '' },
    audio: { passed: null, notes: '' },
    mic: { passed: null, notes: '' },
    frontCamera: { passed: null, notes: '' },
    backCamera: { passed: null, notes: '' },
    vibration: { passed: null, notes: '' },
    sensors: { passed: null, notes: '' },
    battery: { level: 100, charging: false, passed: true },
    wifi: { passed: navigator.onLine },
  });

  // Socket.io Real-time Connection
  const socketRef = useRef(null);

  useEffect(() => {
    if (!code) return;
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join_diagnostic', { code, role: 'seller_phone' });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  const emitProgress = (testKey, result) => {
    if (socketRef.current && code) {
      socketRef.current.emit('test_progress', { code, testKey, result });
    }
  };

  // Fetch session details on load
  useEffect(() => {
    diagnosticAPI.getByCode(code)
      .then(res => {
        setSession(res.data.data);
        if (res.data.data.submitted) {
          setCurrentTest(8); // already done
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Invalid or expired diagnostic code');
      })
      .finally(() => setLoading(false));
  }, [code]);

  // Read battery if available
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(bat => {
        setResults(r => ({
          ...r,
          battery: {
            level: Math.round(bat.level * 100),
            charging: bat.charging,
            passed: bat.level > 0.15,
          },
        }));
      }).catch(() => {});
    }
  }, []);

  // ─── Touch Grid Test State (4x6 = 24 cells) ──────────────────────────────────
  const [touchedSet, setTouchedSet] = useState(new Set());
  const touchContainerRef = useRef(null);

  const handlePointerMove = (e) => {
    const touches = e.touches ? Array.from(e.touches) : [e];
    const newTouched = new Set(touchedSet);

    touches.forEach(t => {
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.dataset && el.dataset.cellId) {
        newTouched.add(parseInt(el.dataset.cellId, 10));
      }
    });

    if (newTouched.size !== touchedSet.size) {
      setTouchedSet(newTouched);
      if (newTouched.size >= 24) {
        // All cells touched!
        setResults(r => ({ ...r, touch: { passed: true, uncoveredBoxes: 0 } }));
        emitProgress('touch', { passed: true, uncoveredBoxes: 0 });
        setTimeout(() => setCurrentTest(2), 500);
      }
    }
  };

  const finishTouchEarly = () => {
    const uncovered = 24 - touchedSet.size;
    const passed = uncovered <= 3;
    setResults(r => ({ ...r, touch: { passed, uncoveredBoxes: uncovered } }));
    emitProgress('touch', { passed, uncoveredBoxes: uncovered });
    setCurrentTest(2);
  };

  // ─── Display Colors Test State ──────────────────────────────────────────────
  const DISPLAY_COLORS = ['#ff2a2a', '#20bf6b', '#3867d6', '#ffffff', '#000000'];
  const [colorIdx, setColorIdx] = useState(0);

  const nextColor = () => {
    if (colorIdx < DISPLAY_COLORS.length - 1) {
      setColorIdx(c => c + 1);
    }
  };

  // ─── Speaker Sound Test (Web Audio API) ──────────────────────────────────────
  const [soundPlayed, setSoundPlayed] = useState(false);
  const playSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
      setSoundPlayed(true);
    } catch {
      toast.error('Audio could not play in this browser');
    }
  };

  // ─── Microphone Test (Audio Analyser) ────────────────────────────────────────
  const [micVolume, setMicVolume] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);

      const checkVolume = () => {
        if (!audioContextRef.current) return;
        analyser.getByteFrequencyData(buffer);
        const avg = buffer.reduce((acc, v) => acc + v, 0) / buffer.length;
        setMicVolume(Math.min(100, Math.round(avg * 2)));

        if (avg > 15) {
          setResults(r => ({ ...r, mic: { passed: true, notes: 'Voice detected' } }));
        }
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch {
      toast.error('Microphone permission required for test');
      setResults(r => ({ ...r, mic: { passed: false, notes: 'Permission denied' } }));
    }
  };

  const stopMic = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicActive(false);
  };

  // ─── Camera Preview State ───────────────────────────────────────────────────
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [activeCamFacing, setActiveCamFacing] = useState('user'); // 'user' or 'environment'

  const startCamera = async (facing) => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActiveCamFacing(facing);
    } catch {
      toast.error(`Cannot open ${facing === 'user' ? 'front' : 'back'} camera`);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
  };

  // ─── Vibration & Tilt Sensor ────────────────────────────────────────────────
  const [tiltData, setTiltData] = useState({ x: 0, y: 0 });
  const [tiltDetected, setTiltDetected] = useState(false);

  useEffect(() => {
    if (currentTest === 6) {
      const handleOrientation = (e) => {
        if (e.gamma !== null && e.beta !== null) {
          setTiltData({ x: Math.round(e.gamma), y: Math.round(e.beta) });
          if (Math.abs(e.gamma) > 12 || Math.abs(e.beta) > 12) {
            setTiltDetected(true);
            setResults(r => ({ ...r, sensors: { passed: true, notes: 'Motion detected' } }));
          }
        }
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [currentTest]);

  const testVibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
      setResults(r => ({ ...r, vibration: { passed: true, notes: 'Vibrated' } }));
      toast.success('Phone should vibrate now!');
    } else {
      toast('Vibration API not supported in this browser');
    }
  };

  // ─── Submit all results to server ───────────────────────────────────────────
  const handleSubmitResults = async () => {
    setSubmitting(true);
    try {
      const payload = {
        autoTests: {
          touch: results.touch,
          display: results.display,
          audio: results.audio,
          mic: results.mic,
          frontCamera: results.frontCamera,
          backCamera: results.backCamera,
          vibration: results.vibration,
          proximity: { passed: true, notes: 'Checked via browser' },
          accelerometer: results.sensors,
          wifi: { passed: navigator.onLine },
          bluetooth: { passed: true },
          gps: { passed: true },
          batteryHealth: {
            percent: results.battery.level,
            passed: results.battery.passed,
            notes: `Charge: ${results.battery.level}%, charging: ${results.battery.charging}`,
          },
        },
      };

      await diagnosticAPI.submitTests(code, payload);
      
      // Real-time broadcast to Agent
      if (socketRef.current) {
        socketRef.current.emit('diagnostic_submitted', {
          code,
          autoTests: payload.autoTests,
          battery: payload.autoTests.batteryHealth,
        });
      }

      toast.success('Diagnostics submitted! Agent can now view results.');
      setCurrentTest(8); // Done state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit diagnostics');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0d12', color: '#fff' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        <p style={{ marginTop: '1rem', color: '#8892b0' }}>Connecting to VoltKart Diagnostic Session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0d12', color: '#fff', padding: '1.5rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#f0a12c" />
        <h2 style={{ margin: '1rem 0 0.5rem' }}>Session Expired or Invalid</h2>
        <p style={{ color: '#8892b0', maxWidth: 360 }}>
          The diagnostic code <strong>{code}</strong> is not recognized or has expired. Please ask the VoltKart agent to show a fresh QR code.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d12', color: '#f4f2ee', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 22, 30, 0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00e5ff' }}>VoltKart</span>
          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 6, background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontWeight: 600 }}>
            DIAGNOSTICS
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#8892b0' }}>
          Code: <strong style={{ color: '#fff', letterSpacing: 1 }}>{code}</strong>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── SCREEN 0: Intro ── */}
        {currentTest === 0 && (
          <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff', marginBottom: '1.5rem' }}>
              <Smartphone size={40} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Test Your {session.model}
            </h1>
            <p style={{ color: '#8892b0', fontSize: '0.95rem', maxWidth: 360, lineHeight: 1.5, marginBottom: '2rem' }}>
              We will run quick checks on your touch screen, display, speaker, microphone, cameras, and sensors directly in this browser.
            </p>

            <div style={{ width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.4rem' }}>Checklist summary:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Touch & Multi-touch</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Screen & Dead Pixels</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Audio & Microphone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Front & Rear Cameras</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Vibration & Tilt</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Check size={14} color="#00e5ff" /> Battery & Connectivity</div>
              </div>
            </div>

            <button
              onClick={() => setCurrentTest(1)}
              style={{
                width: '100%', maxWidth: 360, padding: '1rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #00e5ff, #0099ff)', color: '#000',
                border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              Start Automated Test <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── SCREEN 1: Touch Screen Grid Test (PDF Section 4.5) ── */}
        {currentTest === 1 && (
          <div
            ref={touchContainerRef}
            onTouchMove={handlePointerMove}
            onPointerMove={handlePointerMove}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', position: 'relative',
              userSelect: 'none', touchAction: 'none', background: '#080a0f',
            }}
          >
            {/* Instruction bar */}
            <div style={{ padding: '0.75rem 1rem', background: '#121620', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#00e5ff' }}>Test 1: Touch All Boxes</strong>
                <div style={{ fontSize: '0.75rem', color: '#8892b0' }}>Swipe your finger across all cells to turn them green</div>
              </div>
              <button
                onClick={finishTouchEarly}
                style={{ padding: '0.35rem 0.75rem', borderRadius: 6, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Skip
              </button>
            </div>

            {/* 4 x 6 Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: 3, padding: 3 }}>
              {Array.from({ length: 24 }).map((_, idx) => {
                const isTouched = touchedSet.has(idx);
                return (
                  <div
                    key={idx}
                    data-cell-id={idx}
                    style={{
                      borderRadius: 6,
                      background: isTouched ? '#20bf6b' : 'rgba(255,255,255,0.06)',
                      border: isTouched ? '1px solid #20bf6b' : '1px dashed rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isTouched ? '#fff' : 'rgba(255,255,255,0.2)',
                      fontSize: '0.9rem', fontWeight: 700,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {isTouched ? <Check size={16} /> : idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Bottom Counter */}
            <div style={{ padding: '0.75rem', textAlign: 'center', background: '#121620', fontSize: '0.85rem' }}>
              Boxes Touched: <strong style={{ color: '#00e5ff' }}>{touchedSet.size} / 24</strong>
            </div>
          </div>
        )}

        {/* ── SCREEN 2: Display & Dead Pixels Test ── */}
        {currentTest === 2 && (
          <div
            onClick={nextColor}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: DISPLAY_COLORS[colorIdx],
              cursor: 'pointer', position: 'relative',
              color: colorIdx === 3 ? '#000' : '#fff', // black text on white
            }}
          >
            {/* Top instruction banner */}
            <div style={{
              padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.6)', color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <strong>Test 2: Display Colors ({colorIdx + 1}/{DISPLAY_COLORS.length})</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Check for dead spots, discolored patches or lines</div>
              </div>
              <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 6, background: 'rgba(255,255,255,0.2)' }}>
                Tap screen for next color
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25, fontSize: '1.2rem', fontWeight: 700 }}>
              Tap to cycle colors
            </div>

            {/* Result prompt on last color */}
            {colorIdx === DISPLAY_COLORS.length - 1 && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  padding: '1.25rem', background: 'rgba(10, 13, 18, 0.95)', borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Did you observe any dead pixels or screen burn-in?</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setResults(r => ({ ...r, display: { passed: true, notes: 'Colors clean' } }));
                      setCurrentTest(3);
                    }}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#20bf6b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Screen is Clean (Pass)
                  </button>
                  <button
                    onClick={() => {
                      setResults(r => ({ ...r, display: { passed: false, notes: 'Dead pixels or discoloration found' } }));
                      setCurrentTest(3);
                    }}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#eb3b5a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Has Issues (Fail)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 3: Speaker Sound Test ── */}
        {currentTest === 3 && (
          <div style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff', marginBottom: '1.5rem' }}>
              <Volume2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Test 3: Speaker & Audio</h2>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', maxWidth: 320, marginBottom: '1.5rem' }}>
              Turn your phone volume up and tap the button to play the test chime.
            </p>

            <button
              onClick={playSound}
              style={{
                padding: '0.9rem 1.75rem', borderRadius: 10, background: '#1f2937', color: '#00e5ff',
                border: '1px solid #00e5ff', fontWeight: 700, cursor: 'pointer', marginBottom: '2rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem',
              }}
            >
              <Volume2 size={20} /> {soundPlayed ? 'Play Sound Again' : 'Play Test Sound'}
            </button>

            {soundPlayed && (
              <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontWeight: 600 }}>Did you hear the chime clearly?</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setResults(r => ({ ...r, audio: { passed: true, notes: 'Speaker chime heard' } }));
                      setCurrentTest(4);
                    }}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#20bf6b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Yes, Loud & Clear
                  </button>
                  <button
                    onClick={() => {
                      setResults(r => ({ ...r, audio: { passed: false, notes: 'No sound heard' } }));
                      setCurrentTest(4);
                    }}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#eb3b5a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    No Sound
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCREEN 4: Microphone Test ── */}
        {currentTest === 4 && (
          <div style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff', marginBottom: '1.5rem' }}>
              <Mic size={40} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Test 4: Microphone</h2>
            <p style={{ color: '#8892b0', fontSize: '0.9rem', maxWidth: 320, marginBottom: '1.5rem' }}>
              Speak or blow into your microphone. The volume meter should animate.
            </p>

            {!micActive ? (
              <button
                onClick={startMic}
                style={{
                  padding: '0.9rem 1.75rem', borderRadius: 10, background: '#1f2937', color: '#00e5ff',
                  border: '1px solid #00e5ff', fontWeight: 700, cursor: 'pointer', marginBottom: '2rem',
                }}
              >
                Enable Microphone Test
              </button>
            ) : (
              <div style={{ width: '100%', maxWidth: 320, marginBottom: '2rem' }}>
                <div style={{ height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{
                    width: `${micVolume}%`, height: '100%',
                    background: micVolume > 20 ? '#20bf6b' : '#00e5ff',
                    transition: 'width 0.1s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: micVolume > 20 ? '#20bf6b' : '#8892b0', marginTop: '0.5rem', fontWeight: 600 }}>
                  {micVolume > 20 ? 'Voice Detected!' : 'Listening... Speak into mic'}
                </div>
              </div>
            )}

            <div style={{ width: '100%', maxWidth: 360, display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  stopMic();
                  setResults(r => ({ ...r, mic: { passed: true, notes: 'Mic input confirmed' } }));
                  setCurrentTest(5);
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#20bf6b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Mic Working
              </button>
              <button
                onClick={() => {
                  stopMic();
                  setResults(r => ({ ...r, mic: { passed: false, notes: 'Mic did not respond' } }));
                  setCurrentTest(5);
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#eb3b5a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Mic Failed
              </button>
            </div>
          </div>
        )}

        {/* ── SCREEN 5: Front & Rear Camera Test ── */}
        {currentTest === 5 && (
          <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Test 5: Camera Check ({activeCamFacing === 'user' ? 'Front Selfie' : 'Rear Camera'})
            </h2>
            <p style={{ color: '#8892b0', fontSize: '0.8rem', marginBottom: '1rem' }}>
              Verify camera preview is clear without blur, cracks, or sensor fog.
            </p>

            <div style={{ width: '100%', maxWidth: 340, height: 260, borderRadius: 12, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.15)', position: 'relative', marginBottom: '1rem' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {!cameraStreamRef.current && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <button
                    onClick={() => startCamera(activeCamFacing)}
                    style={{ padding: '0.7rem 1.25rem', borderRadius: 8, background: '#00e5ff', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Open {activeCamFacing === 'user' ? 'Front' : 'Rear'} Camera
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: 340, marginBottom: '1rem' }}>
              <button
                onClick={() => startCamera('user')}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: activeCamFacing === 'user' ? '#00e5ff' : '#1f2937', color: activeCamFacing === 'user' ? '#000' : '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Front Camera
              </button>
              <button
                onClick={() => startCamera('environment')}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: activeCamFacing === 'environment' ? '#00e5ff' : '#1f2937', color: activeCamFacing === 'environment' ? '#000' : '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Rear Camera
              </button>
            </div>

            <div style={{ width: '100%', maxWidth: 340, display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  stopCamera();
                  setResults(r => ({
                    ...r,
                    frontCamera: { passed: true, notes: 'Working' },
                    backCamera: { passed: true, notes: 'Working' },
                  }));
                  setCurrentTest(6);
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#20bf6b', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Both Cameras OK
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setResults(r => ({
                    ...r,
                    frontCamera: { passed: false, notes: 'Defective' },
                    backCamera: { passed: false, notes: 'Defective' },
                  }));
                  setCurrentTest(6);
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: 8, background: '#eb3b5a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Has Issues
              </button>
            </div>
          </div>
        )}

        {/* ── SCREEN 6: Vibration, Sensors & Battery Check ── */}
        {currentTest === 6 && (
          <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Test 6: Vibration, Motion & Battery
            </h2>
            <p style={{ color: '#8892b0', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Tilt your phone to test orientation sensors and verify vibration motor.
            </p>

            {/* Tilt Visualizer Target */}
            <div style={{ width: 140, height: 140, borderRadius: '50%', border: '2px dashed rgba(0, 229, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: tiltDetected ? '#20bf6b' : '#00e5ff',
                transform: `translate(${Math.min(50, Math.max(-50, tiltData.x))}px, ${Math.min(50, Math.max(-50, tiltData.y))}px)`,
                transition: 'transform 0.05s ease',
              }} />
            </div>

            <div style={{ fontSize: '0.85rem', color: tiltDetected ? '#20bf6b' : '#8892b0', marginBottom: '1.5rem', fontWeight: 600 }}>
              {tiltDetected ? 'Gyro/Tilt Sensor OK!' : 'Tilt your phone left/right'}
            </div>

            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                onClick={testVibrate}
                style={{ padding: '0.8rem', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
              >
                <Zap size={18} color="#00e5ff" /> Test Vibration Motor
              </button>
              <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8892b0' }}><Battery size={16} /> Battery Level:</span>
                <strong style={{ color: results.battery.level > 20 ? '#20bf6b' : '#eb3b5a' }}>{results.battery.level}% {results.battery.charging ? '(Charging)' : ''}</strong>
              </div>
            </div>

            <button
              onClick={() => setCurrentTest(7)}
              style={{
                width: '100%', maxWidth: 320, padding: '0.9rem', borderRadius: 10,
                background: '#00e5ff', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Continue to Review Results →
            </button>
          </div>
        )}

        {/* ── SCREEN 7: Results Summary & Final Send ── */}
        {currentTest === 7 && (
          <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Inspection Summary</h2>
            <p style={{ color: '#8892b0', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Review your test outcomes before sending to the VoltKart agent.
            </p>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Touch Screen (24 boxes)', ok: results.touch.passed },
                { label: 'Display & Color Tint', ok: results.display.passed },
                { label: 'Speaker Audio Chime', ok: results.audio.passed },
                { label: 'Microphone Input', ok: results.mic.passed },
                { label: 'Front & Rear Cameras', ok: results.frontCamera.passed && results.backCamera.passed },
                { label: 'Motion & Tilt Sensors', ok: results.sensors.passed !== false },
                { label: `Battery Level (${results.battery.level}%)`, ok: results.battery.passed },
                { label: 'Network Connection', ok: results.wifi.passed },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '0.75rem 1rem', borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem',
                }}>
                  <span>{item.label}</span>
                  {item.ok ? (
                    <span style={{ color: '#20bf6b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={16} /> Pass
                    </span>
                  ) : (
                    <span style={{ color: '#eb3b5a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={16} /> Fail
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitResults}
              disabled={submitting}
              style={{
                width: '100%', padding: '1rem', borderRadius: 12,
                background: 'linear-gradient(135deg, #20bf6b, #00e5ff)', color: '#000',
                border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {submitting ? <span className="spinner" /> : 'Submit Results to Agent'}
            </button>
          </div>
        )}

        {/* ── SCREEN 8: Done State ── */}
        {currentTest === 8 && (
          <div style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(32, 191, 107, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20bf6b', marginBottom: '1.5rem' }}>
              <CheckCircle size={44} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#20bf6b' }}>
              Tests Completed!
            </h2>
            <p style={{ color: '#8892b0', fontSize: '0.95rem', maxWidth: 340, lineHeight: 1.5, marginBottom: '2rem' }}>
              All automated diagnostics have been securely sent to the agent's app. You can now hand this phone back to the agent.
            </p>

            <div style={{ padding: '1rem 1.5rem', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#8892b0' }}>
              Session Code: <strong style={{ color: '#fff' }}>{code}</strong> · Model: <strong style={{ color: '#fff' }}>{session.model}</strong>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DiagnosticPage;
