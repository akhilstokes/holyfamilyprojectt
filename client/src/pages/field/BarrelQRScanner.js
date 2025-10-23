import React, { useEffect, useRef, useState } from 'react';
import { BARREL_STATUSES, getBarrels, updateBarrel, markInUse } from '../../services/barrelService';

// Minimal QR/Barcode scanning using native BarcodeDetector when available.
// Fallback to manual input if not supported.
const BarrelQRScanner = () => {
  const videoRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastCode, setLastCode] = useState('');
  const [barrel, setBarrel] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geoStatus, setGeoStatus] = useState('');
  const [lastCoords, setLastCoords] = useState(null);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    setSupported('BarcodeDetector' in window);
  }, []);

  const startScan = async () => {
    if (!supported) {
      // Fallback to html5-qrcode via CDN
      try {
        setError('');
        setScanning(true);
        // Dynamically load html5-qrcode if not present
        if (!window.Html5Qrcode) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://unpkg.com/html5-qrcode@2.3.10/html5-qrcode.min.js';
            s.async = true;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
        }
        const containerId = 'qr-reader-fallback';
        let el = document.getElementById(containerId);
        if (!el) {
          el = document.createElement('div');
          el.id = containerId;
          el.style.maxWidth = '480px';
          el.style.width = '100%';
          videoRef.current?.parentNode?.insertBefore(el, videoRef.current);
        }
        const html5QrCode = new window.Html5Qrcode(containerId);
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await onDetected(decodedText);
            html5QrCode.stop().catch(() => {});
            html5QrCode.clear().catch(() => {});
            setScanning(false);
          },
          () => {}
        );
        return;
      } catch (e) {
        setError(e?.message || 'Fallback scanner failed');
        setScanning(false);
        return;
      }
    }
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
      const scanLoop = async () => {
        if (!scanning) return;
        try {
          const bitmaps = await createImageBitmap(video);
          const codes = await detector.detect(bitmaps);
          if (codes && codes.length > 0) {
            const code = codes[0].rawValue;
            await onDetected(code);
          } else {
            requestAnimationFrame(scanLoop);
          }
        } catch {
          requestAnimationFrame(scanLoop);
        }
      };
      requestAnimationFrame(scanLoop);
    } catch (e) {
      setError(e?.message || 'Camera access failed');
    }
  };

  const stopScan = () => {
    setScanning(false);
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  };

  const onDetected = async (code) => {
    stopScan();
    setLastCode(code);
    setError('');
    setBarrel(null);
    setLoading(true);
    try {
      // Interpret the QR as barrelId directly; adjust if your QR encodes JSON/URL
      const barrelId = code.trim();
      const res = await getBarrels({ id: barrelId });
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const found = list[0] || null;
      setBarrel(found);
      setStatus(found?.status || '');

      // Capture current geolocation and send to backend with meta info of the scan
      if (navigator.geolocation) {
        setGeoStatus('Capturing current location...');
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords || {};
          setLastCoords({ latitude, longitude, accuracy });
          setGeoStatus('Updating manager with your current location...');
          try {
            const r = await fetch(`${API}/api/delivery/location`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                latitude,
                longitude,
                accuracy,
                meta: { event: 'barrel_scan', barrelId }
              })
            });
            if (!r.ok) {
              const t = await r.text();
              setGeoStatus(`Location update failed (${r.status}) ${t.slice(0,60)}`);
            } else {
              setGeoStatus('Location shared with manager.');
            }
          } catch (e) {
            setGeoStatus(e?.message || 'Failed to send location');
          }
        }, (err) => {
          setGeoStatus(`Location error: ${err.message}`);
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
      } else {
        setGeoStatus('Geolocation not supported');
      }
    } catch (e) {
      setError(e?.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const onManualSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const code = form.elements.code.value;
    if (!code) return;
    await onDetected(code);
  };

  const saveStatus = async () => {
    if (!barrel?._id || !status) return;
    setLoading(true); setError('');
    try {
      if (status === 'in_transit') {
        await markInUse(barrel._id);
      } else {
        await updateBarrel(barrel._id, { status });
      }
      // refresh
      const res = await getBarrels({ id: barrel._id });
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setBarrel(list[0] || null);
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Barrel QR Scanner</h2>
      {error && <div style={{ color: 'tomato', marginBottom: 8 }}>{error}</div>}

      {supported ? (
        <div style={{ marginBottom: 12 }}>
          <video ref={videoRef} style={{ width: '100%', maxWidth: 480, background: '#000' }} />
          {!scanning ? (
            <button className="btn" onClick={startScan}>Start Scan</button>
          ) : (
            <button className="btn" onClick={stopScan}>Stop Scan</button>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <div id="qr-reader-fallback" style={{ maxWidth: 480, marginBottom: 8 }} />
          <div style={{ color: '#6b7280', marginBottom: 8 }}>Camera scanning fallback enabled.</div>
          <form onSubmit={onManualSubmit} style={{ display: 'flex', gap: 8 }}>
            <input name="code" placeholder="Enter/scan barrel QR code" />
            <button className="btn" type="submit">Lookup</button>
          </form>
        </div>
      )}

      {lastCode && (
        <div style={{ marginTop: 8, color: '#374151' }}>Last code: <b>{lastCode}</b></div>
      )}

      {loading && <div>Loading...</div>}

      {barrel && (
        <div style={{ marginTop: 16 }}>
          <h3>Barrel Details</h3>
          <div>ID: {barrel._id}</div>
          <div>Status: {barrel.status}</div>
          <div>Location: {barrel.location || '-'}</div>

          {geoStatus && (
            <div style={{ marginTop: 8, color: '#475569' }}>{geoStatus}</div>
          )}
          {lastCoords && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>Lat {lastCoords.latitude?.toFixed?.(6)} • Lng {lastCoords.longitude?.toFixed?.(6)} • ±{lastCoords.accuracy?.toFixed?.(0)} m</div>
              <a
                className="btn btn-sm"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps?q=${lastCoords.latitude},${lastCoords.longitude}`}
                style={{ marginTop: 6 }}
              >Open Location in Google Maps</a>
            </div>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Select status</option>
              {BARREL_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn" onClick={saveStatus} disabled={loading || !status}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarrelQRScanner;
