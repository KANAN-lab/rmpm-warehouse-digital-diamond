import React, { useState } from 'react';
import {
  Wifi, WifiOff, Send, CheckCircle2, Smartphone, Keyboard, Camera,
  AlertTriangle, Clock, Hash, RefreshCw, Layers
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

type PdaScreen = 'MENU' | 'COUNT_ENTRY' | 'RECEIVING' | 'PICKING' | 'BIN_MOVE';

const MOCK_ACTIVE_SO = [
  { id: 'CC-20260825-001', zone: 'ZONE-A (Rak R01-R04)', targets: 32, counted: 17 },
  { id: 'CC-20260825-002', zone: 'ZONE-B (Rak R05-R08)', targets: 24, counted: 0 },
];

const MOCK_PICKING_LIST = [
  { mid: 'MID-2026-001', material: 'RM-RESIN-001', qty: 250, uom: 'KG', loc: 'A01-R03-L02-B04', done: false },
  { mid: 'MID-2026-002', material: 'RM-PIGMENT-002', qty: 50, uom: 'KG', loc: 'A01-R03-L01-B02', done: false },
];

export const PdaMobileInterface: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [screen, setScreen] = useState<PdaScreen>('MENU');
  const [inputMode, setInputMode] = useState<'SCAN' | 'MANUAL'>('SCAN');
  const [locationCode, setLocationCode] = useState('A01-R03-L02-B04');
  const [scannedCode, setScannedCode] = useState('');
  const [physicalQty, setPhysicalQty] = useState('');
  const [selectedSO, setSelectedSO] = useState<string | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<PdaQueueItem[]>([]);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [pickingList, setPickingList] = useState(MOCK_PICKING_LIST);
  const [fromBin, setFromBin] = useState('A01-R03-L02-B04');
  const [toBin, setToBin] = useState('');
  const [moveMid, setMoveMid] = useState('');
  const [moveQty, setMoveQty] = useState('');

  const showNotif = (msg: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode || !physicalQty || !selectedSO) return;
    const item: PdaQueueItem = {
      id: `pda-${Date.now()}`,
      cycleCountId: selectedSO,
      targetId: `tgt-${Date.now()}`,
      locationCode,
      scannedCode,
      physicalQty: Number(physicalQty),
      uom: 'KG',
      inputMode,
      timestamp: new Date().toISOString()
    };
    if (isOnline) {
      showNotif(`[ONLINE SYNC] Entry ${physicalQty} KG (MID: ${scannedCode}) dikirim ke Server API.`, 'success');
    } else {
      setOfflineQueue(prev => [...prev, item]);
      showNotif(`[OFFLINE QUEUE] Entry disimpan di antrean lokal. Total pending: ${offlineQueue.length + 1} item.`, 'warn');
    }
    setScannedCode('');
    setPhysicalQty('');
  };

  const handleSyncNow = () => {
    if (offlineQueue.length === 0) return;
    showNotif(`[SYNC SUCCESS] ${offlineQueue.length} item antrean offline dikirim ke server. SYNC_CONFLICT Detection aktif.`, 'success');
    setOfflineQueue([]);
  };

  const handleConfirmPick = (idx: number) => {
    setPickingList(prev => prev.map((p, i) => i === idx ? { ...p, done: true } : p));
    showNotif(`[PICK CONFIRMED] ${pickingList[idx].material} (${pickingList[idx].qty} ${pickingList[idx].uom}) dari ${pickingList[idx].loc} — Confirmed.`, 'success');
  };

  const handleBinMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromBin || !toBin || !moveMid || !moveQty) return;
    showNotif(`[BIN-TO-BIN] MID ${moveMid} (${moveQty} unit) dipindahkan dari ${fromBin} → ${toBin}. Dicatat ke Immutable Ledger.`, 'success');
    setToBin('');
    setMoveMid('');
    setMoveQty('');
  };

  const notifColor = notification?.type === 'success' ? { bg: 'rgba(16,185,129,0.15)', border: '#10b981', text: '#34d399' }
    : notification?.type === 'warn' ? { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#fbbf24' }
    : { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#f87171' };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px', borderRadius: '8px',
    background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff', fontSize: '0.9375rem', boxSizing: 'border-box'
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: '0.06em', display: 'block', marginBottom: '4px'
  };
  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    color: '#fff', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer'
  };

  return (
    <div style={{ maxWidth: '420px', width: '100%', background: '#0f172a', borderRadius: '16px', border: '2px solid #06b6d4', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {screen !== 'MENU' && (
            <button onClick={() => setScreen('MENU')} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>← Back</button>
          )}
          <Smartphone size={18} color="#06b6d4" />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            {screen === 'MENU' && 'PDA TERMINAL'}
            {screen === 'COUNT_ENTRY' && 'BLIND COUNT ENTRY'}
            {screen === 'RECEIVING' && 'INBOUND RECEIVING'}
            {screen === 'PICKING' && 'PICK LIST'}
            {screen === 'BIN_MOVE' && 'BIN-TO-BIN MOVE'}
          </span>
        </div>
        <button onClick={() => setIsOnline(!isOnline)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '9999px', border: 'none', background: isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isOnline ? '#34d399' : '#f87171', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{ padding: '10px 16px', background: notifColor.bg, borderBottom: `1px solid ${notifColor.border}`, color: notifColor.text, fontSize: '0.78rem' }}>
          {notification.msg}
        </div>
      )}

      {/* Offline Queue Sync Banner */}
      {offlineQueue.length > 0 && isOnline && (
        <div style={{ padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}><AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />{offlineQueue.length} item pending sync</span>
          <button onClick={handleSyncNow} style={{ padding: '5px 10px', background: '#f59e0b', border: 'none', borderRadius: '4px', color: '#000', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Send size={12} /> SYNC SEKARANG
          </button>
        </div>
      )}

      <div style={{ padding: '16px', maxHeight: '620px', overflowY: 'auto' }}>
        {/* === MENU SCREEN === */}
        {screen === 'MENU' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Pilih operasi pergudangan:</p>
            {[
              { id: 'COUNT_ENTRY', icon: <Hash size={20} color="#06b6d4" />, label: 'Blind Cycle Count', desc: 'Input hitung fisik stok (BLIND mode)', color: '#06b6d4' },
              { id: 'RECEIVING', icon: <Layers size={20} color="#10b981" />, label: 'Inbound Receiving', desc: 'Terima PO / ASN di Dock', color: '#10b981' },
              { id: 'PICKING', icon: <CheckCircle2 size={20} color="#a855f7" />, label: 'Pick List (FEFO/FIFO)', desc: `${MOCK_PICKING_LIST.length} item dalam antrian`, color: '#a855f7' },
              { id: 'BIN_MOVE', icon: <RefreshCw size={20} color="#f59e0b" />, label: 'Bin-to-Bin Movement', desc: 'Pindahkan MID antar lokasi bin', color: '#f59e0b' },
            ].map(item => (
              <button key={item.id} onClick={() => setScreen(item.id as PdaScreen)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = item.color; (e.currentTarget as HTMLButtonElement).style.background = `rgba(255,255,255,0.06)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `rgba(0,0,0,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${item.color}22`, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* === COUNT ENTRY SCREEN === */}
        {screen === 'COUNT_ENTRY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* SO Selector */}
            <div>
              <label style={labelStyle}>PILIH STOCK OPNAME SESSION</label>
              {MOCK_ACTIVE_SO.map(so => (
                <button key={so.id} onClick={() => setSelectedSO(so.id)} style={{ display: 'block', width: '100%', padding: '10px 12px', marginBottom: '6px', borderRadius: '6px', border: selectedSO === so.id ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)', background: selectedSO === so.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)', color: '#f8fafc', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{so.id}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{so.zone} — {so.counted}/{so.targets} lokasi terhitung</div>
                  <div style={{ marginTop: '5px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ width: `${(so.counted / so.targets) * 100}%`, height: '100%', background: '#06b6d4', borderRadius: '2px' }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Input Mode */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['SCAN', 'MANUAL'] as const).map(m => (
                <button key={m} onClick={() => setInputMode(m)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: inputMode === m ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: inputMode === m ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}>
                  {m === 'SCAN' ? <Camera size={15} /> : <Keyboard size={15} />}
                  {m === 'SCAN' ? 'LASER SCAN' : 'MANUAL INPUT'}
                </button>
              ))}
            </div>

            <form onSubmit={handleCountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>TARGET LOKASI BIN</label>
                <input type="text" value={locationCode} onChange={e => setLocationCode(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{inputMode === 'SCAN' ? 'SCAN BARCODE MID' : 'MANUAL ENTRY MID'}</label>
                <input type="text" value={scannedCode} onChange={e => setScannedCode(e.target.value)} placeholder={inputMode === 'SCAN' ? 'Arahkan scanner ke MID label...' : 'Ketik MID code...'} required style={{ ...inputStyle, border: '2px solid #06b6d4', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={labelStyle}>JUMLAH FISIK HITUNG (MUTLAK BLIND ⚠)</label>
                <input type="number" value={physicalQty} onChange={e => setPhysicalQty(e.target.value)} placeholder="0.00" required step="0.01" style={{ ...inputStyle, border: '2px solid #06b6d4', fontSize: '1.5rem', fontWeight: 800, color: '#22d3ee' }} />
                <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '4px' }}>⚠ System quantity & variance TERSEMBUNYI sesuai Blind SO Protocol</div>
              </div>
              <button type="submit" disabled={!selectedSO} style={{ ...btnPrimary, opacity: selectedSO ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={19} /> CONFIRM COUNT ENTRY
              </button>
            </form>

            {offlineQueue.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ANTREAN OFFLINE LOKAL ({offlineQueue.length} item)</span>
                <div style={{ maxHeight: '110px', overflowY: 'auto', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {offlineQueue.map(q => (
                    <div key={q.id} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '5px', fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>{q.locationCode} — {q.scannedCode}</span>
                      <span style={{ color: '#06b6d4', fontWeight: 700 }}>{q.physicalQty} KG ({q.inputMode})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === RECEIVING SCREEN === */}
        {screen === 'RECEIVING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>PO AKTIF: PO-2026-00881</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Supplier: PT Bahan Baku Nusantara | ETA: 2026-08-25</div>
            </div>
            {[
              { item: 'RM-RESIN-001', ordered: 5000, uom: 'KG', received: 0 },
              { item: 'RM-PIGMENT-002', ordered: 250, uom: 'KG', received: 0 },
            ].map((line, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{line.item}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{line.ordered.toLocaleString()} {line.uom} ordered</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" placeholder="Qty diterima..." defaultValue={line.ordered} style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: '0.875rem' }} />
                  <button onClick={() => showNotif(`[RECEIVED] ${line.item} (${line.ordered} ${line.uom}) diterima di DOCK-IN-01. Menunggu QC Inspection.`, 'success')} style={{ padding: '8px 12px', background: '#10b981', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    CONFIRM
                  </button>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', borderRadius: '8px', fontSize: '0.75rem', color: '#93c5fd' }}>
              <Clock size={13} style={{ display: 'inline', marginRight: '5px' }} />
              Setelah konfirmasi penerimaan, material akan masuk ke QC Inspection Pool (PASSED / REJECTED) sebelum Putaway.
            </div>
          </div>
        )}

        {/* === PICKING SCREEN === */}
        {screen === 'PICKING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Strategi: <strong style={{ color: '#a855f7' }}>FEFO/FIFO Auto-Alokasi</strong> | SO: SO-2026-0031</div>
            {pickingList.map((p, i) => (
              <div key={i} style={{ padding: '14px', background: p.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${p.done ? '#10b981' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', opacity: p.done ? 0.65 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.material}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>MID: {p.mid}</div>
                  </div>
                  <span style={{ padding: '3px 8px', background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', borderRadius: '4px', fontSize: '0.7rem', color: '#d8b4fe', fontWeight: 700 }}>
                    {p.qty} {p.uom}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '10px' }}>📍 {p.loc}</div>
                {!p.done ? (
                  <button onClick={() => handleConfirmPick(i)} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> CONFIRM PICK
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>✓ PICKED & CONFIRMED</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === BIN-TO-BIN SCREEN === */}
        {screen === 'BIN_MOVE' && (
          <form onSubmit={handleBinMove} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            <div style={{ padding: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', borderRadius: '7px', fontSize: '0.72rem', color: '#fbbf24' }}>
              ⚠ Setiap pemindahan dicatat ke Immutable Transaction Ledger (BIN_TO_BIN). Tidak dapat dibatalkan.
            </div>
            <div>
              <label style={labelStyle}>MID / MATERIAL CODE</label>
              <input type="text" value={moveMid} onChange={e => setMoveMid(e.target.value)} placeholder="Scan atau ketik MID..." required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>QUANTITY</label>
              <input type="number" value={moveQty} onChange={e => setMoveQty(e.target.value)} placeholder="0" required step="0.01" style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }} />
            </div>
            <div>
              <label style={labelStyle}>FROM BIN (ASAL)</label>
              <input type="text" value={fromBin} onChange={e => setFromBin(e.target.value)} required style={{ ...inputStyle, color: '#38bdf8' }} />
            </div>
            <div>
              <label style={labelStyle}>TO BIN (TUJUAN)</label>
              <input type="text" value={toBin} onChange={e => setToBin(e.target.value)} placeholder="Scan atau ketik kode bin tujuan..." required style={{ ...inputStyle, color: '#34d399' }} />
            </div>
            <button type="submit" style={{ ...btnPrimary, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RefreshCw size={18} /> EXECUTE BIN-TO-BIN TRANSFER
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PdaMobileInterface;
