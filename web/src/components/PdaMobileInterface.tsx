import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  Keyboard, 
  Camera 
} from 'lucide-react';

export interface PdaQueueItem {
  id: string;
  cycleCountId: string;
  targetId: string;
  locationCode: string;
  scannedCode: string;
  physicalQty: number;
  uom: string;
  inputMode: 'SCAN' | 'MANUAL';
  timestamp: string;
}

export const PdaMobileInterface: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<'SCAN' | 'MANUAL'>('SCAN');
  const [locationCode, setLocationCode] = useState<string>('A01-R03-L02-B04');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [physicalQty, setPhysicalQty] = useState<string>('');
  const [offlineQueue, setOfflineQueue] = useState<PdaQueueItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load offline queue from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rmpm_pda_offline_queue');
    if (saved) {
      try {
        setOfflineQueue(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save offline queue to LocalStorage on update
  useEffect(() => {
    localStorage.setItem('rmpm_pda_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode || !physicalQty) return;

    const newItem: PdaQueueItem = {
      id: `pda-item-${Date.now()}`,
      cycleCountId: 'CC-20260825-00001',
      targetId: 'tgt-994812',
      locationCode,
      scannedCode,
      physicalQty: Number(physicalQty),
      uom: 'KG',
      inputMode,
      timestamp: new Date().toISOString()
    };

    if (isOnline) {
      setNotification(`[ONLINE SYNC] Entry fisik ${physicalQty} KG (MID: ${scannedCode}) dikirim langsung ke REST Server API.`);
    } else {
      setOfflineQueue(prev => [...prev, newItem]);
      setNotification(`[OFFLINE QUEUE] Koneksi terputus. Entry disimpan di Antrean PDA Lokal (${offlineQueue.length + 1} item terpending).`);
    }

    setScannedCode('');
    setPhysicalQty('');
  };

  const handleSyncNow = () => {
    if (offlineQueue.length === 0) return;
    setNotification(`[SYNC SUCCESS] Mengirim ${offlineQueue.length} item antrean offline ke server... Deteksi SYNC_CONFLICT diaktifkan.`);
    setOfflineQueue([]);
  };

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      background: '#0f172a', 
      borderRadius: '16px', 
      border: '2px solid #06b6d4', 
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
      color: '#f8fafc'
    }}>
      {/* PDA Header */}
      <div style={{ 
        padding: '16px', 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={20} color="#06b6d4" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>PDA SCANNER TERMINAL</span>
        </div>

        {/* Network Status Toggle */}
        <button 
          onClick={() => setIsOnline(!isOnline)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            borderRadius: '9999px',
            border: 'none',
            background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isOnline ? '#34d399' : '#f87171',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
        </button>
      </div>

      {/* PDA Body */}
      <div style={{ padding: '20px' }}>
        {notification && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: isOnline ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isOnline ? '#06b6d4' : '#f59e0b'}`,
            color: isOnline ? '#22d3ee' : '#fbbf24',
            fontSize: '0.8125rem',
            marginBottom: '16px'
          }}>
            {notification}
          </div>
        )}

        {/* Input Mode Selector (SCAN vs MANUAL) */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setInputMode('SCAN')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px',
              border: inputMode === 'SCAN' ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'SCAN' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Camera size={16} /> LASER SCAN
          </button>
          <button 
            onClick={() => setInputMode('MANUAL')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px',
              border: inputMode === 'MANUAL' ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
              background: inputMode === 'MANUAL' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Keyboard size={16} /> MANUAL INPUT
          </button>
        </div>

        {/* Blind Count Entry Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              TARGET LOCATION BARCODE
            </label>
            <input 
              type="text" 
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                background: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              {inputMode === 'SCAN' ? 'HARDWARE BARCODE SCANNER' : 'MANUAL MID / MATERIAL INPUT'}
            </label>
            <input 
              type="text" 
              placeholder={inputMode === 'SCAN' ? 'Arahkan laser scanner ke MID...' : 'Ketik MID...'}
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: '8px', 
                background: '#1e293b', 
                border: '2px solid #06b6d4',
                color: '#ffffff',
                fontSize: '1.125rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              PHYSICAL QUANTITY ENTRY (MUTLAK BLIND)
            </label>
            <input 
              type="number" 
              placeholder="Jumlah hitung fisik murni..."
              value={physicalQty}
              onChange={(e) => setPhysicalQty(e.target.value)}
              required
              step="0.01"
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: '8px', 
                background: '#1e293b', 
                border: '2px solid #06b6d4',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            />
          </div>

          {/* Touch-Friendly Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '16px', 
                borderRadius: '10px', 
                border: 'none', 
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
              }}
            >
              <CheckCircle2 size={20} /> CONFIRM COUNT ENTRY
            </button>

            {offlineQueue.length > 0 && isOnline && (
              <button 
                type="button" 
                onClick={handleSyncNow}
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #f59e0b', 
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={16} /> SYNC {offlineQueue.length} ANTREAN OFFLINE KE SERVER
              </button>
            )}
          </div>
        </form>

        {/* Offline Queue Badge List */}
        {offlineQueue.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>LOCAL OFFLINE QUEUE ({offlineQueue.length} ITEMS):</span>
            <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {offlineQueue.map((item) => (
                <div key={item.id} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.locationCode} - {item.scannedCode}</span>
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>{item.physicalQty} {item.uom} ({item.inputMode})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdaMobileInterface;
