import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BarcodeScannerModal = ({ isOpen, onClose, onScan, title = 'Scan Barcode / IMEI' }) => {
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const regionId = 'volt-barcode-scanner-region';

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;

    const startScanner = async () => {
      setCameraError(null);
      setScanning(true);

      try {
        html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 160 }, // Horizontal slot ideal for 1D IMEI barcodes & QR
          aspectRatio: 1.777778,
        };

        await html5QrCode.start(
          { facingMode: 'environment' }, // Back camera
          config,
          (decodedText) => {
            // Success callback
            if (navigator.vibrate) navigator.vibrate(100);
            toast.success(`Scanned: ${decodedText}`);
            if (scannerRef.current) {
              scannerRef.current.stop().catch(() => {});
            }
            onScan(decodedText.trim());
            onClose();
          },
          () => {
            // Frame error - ignore
          }
        );
      } catch (err) {
        console.warn('Camera scanner failed:', err);
        setCameraError(
          err?.message?.includes('Permission')
            ? 'Camera permission denied. Please enable camera access in browser/device settings.'
            : 'No camera detected or camera is currently in use by another app.'
        );
        setScanning(false);
      }
    };

    // Small delay to ensure DOM element exists
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0f172a',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              padding: '0.4rem',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
            }}>
              <Camera size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Point camera at Box or Screen Barcode</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera Viewport */}
        <div style={{ position: 'relative', width: '100%', minHeight: '300px', background: '#000000' }}>
          <div id={regionId} style={{ width: '100%' }} />

          {/* Guide Overlay */}
          {!cameraError && scanning && (
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '80%',
                height: '140px',
                border: '2px solid #f59e0b',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}>
                {/* Red Laser Aim Line Animation */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '2px',
                  background: '#ef4444',
                  boxShadow: '0 0 8px #ef4444',
                  animation: 'pulse 1.5s infinite',
                }} />
              </div>
              <div style={{
                marginTop: '1rem',
                color: '#fbbf24',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
              }}>
                Align barcode inside frame
              </div>
            </div>
          )}

          {/* Error Message */}
          {cameraError && (
            <div style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              color: '#f87171',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={40} style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem' }}>Camera Access Required</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4, maxWidth: '300px' }}>
                {cameraError}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Close / Type Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
