import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Eye, 
  QrCode, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Database, 
  Cpu, 
  Search,
  Sliders,
  Maximize2
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'blind-so' | 'master' | 'audit'>('3d');
  const [selectedLayer, setSelectedLayer] = useState<string>('Inventory Density');
  
  // Blind SO Demo Form State (MUTLAK: Hiding System Qty)
  const [physicalQty, setPhysicalQty] = useState<string>('');
  const [scannedMid, setScannedMid] = useState<string>('');
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const handleBlindCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicalQty || !scannedMid) return;
    
    setSubmittedStatus(`BERHASIL: Entry Blind SO disimpan secara imutabel! (Physical Qty: ${physicalQty} KG, MID: ${scannedMid}). System Qty & Selisih tetap tersembunyi untuk counter.`);
    setPhysicalQty('');
    setScannedMid('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0e17' }}>
      {/* Top Navigation Bar */}
      <header style={{ 
        height: '64px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 24px',
        backgroundColor: 'rgba(18, 24, 36, 0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
          }}>
            <Box size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              RMPM WAREHOUSE DIGITAL TWIN
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Enterprise Control Tower & Blind SO Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === '3d' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('3d')}
          >
            <Box size={16} /> 3D Digital Twin
          </button>
          <button 
            className={`btn ${activeTab === 'blind-so' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('blind-so')}
          >
            <QrCode size={16} /> Blind SO (PDA)
          </button>
          <button 
            className={`btn ${activeTab === 'master' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('master')}
          >
            <Database size={16} /> Master Data
          </button>
          <button 
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldCheck size={16} /> Ledger & Audit
          </button>
        </nav>

        {/* System Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="badge badge-success">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
            SYSTEM LIVE
          </span>
          <span className="badge badge-cyan">
            <Cpu size={12} /> 60 FPS (WebGL)
          </span>
        </div>
      </header>

      {/* Main Operational Container */}
      <main style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Primary Display (3D View / Interactive View) */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {activeTab === '3d' && (
            <>
              {/* 3D Toolbar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>ACTIVE LAYER:</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.8125rem' }}>
                    <Layers size={14} /> {selectedLayer}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                    <Search size={14} /> 3D Search MID
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                    <Sliders size={14} /> Presets
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                    <Maximize2 size={14} /> Fullscreen
                  </button>
                </div>
              </div>

              {/* 3D Canvas Container Placeholder */}
              <div style={{ 
                flex: 1, 
                minHeight: '480px', 
                borderRadius: '8px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Simulated 3D Warehouse Rack Objects */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '24px', 
                  width: '80%', 
                  padding: '32px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(6, 182, 212, 0.3)'
                }}>
                  {['RACK-A01', 'RACK-A02', 'RACK-B01', 'RACK-B02'].map((rack) => (
                    <div 
                      key={rack} 
                      style={{ 
                        height: '180px', 
                        borderRadius: '8px', 
                        background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{rack}</span>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>LIVE</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        <div style={{ background: '#10b981', height: '24px', borderRadius: '4px', opacity: 0.8 }} title="Bin 01: Available" />
                        <div style={{ background: '#3b82f6', height: '24px', borderRadius: '4px', opacity: 0.8 }} title="Bin 02: Allocated" />
                        <div style={{ background: '#f59e0b', height: '24px', borderRadius: '4px', opacity: 0.8 }} title="Bin 03: Variance" />
                        <div style={{ background: '#ef4444', height: '24px', borderRadius: '4px', opacity: 0.8 }} title="Bin 04: Wrong Location" />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>4 Levels / 16 Bins</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '0.875rem' }}>
                  Three.js WebGL Interactive Canvas Instance (Single Source of Truth: Database Ledger)
                </p>
              </div>
            </>
          )}

          {activeTab === 'blind-so' && (
            <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>PDA MOBILE INTERFACE</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>BLIND CYCLE COUNT ENTRY</h2>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  Petugas Counter **TIDAK DAPAT SEE** System Qty, Expected Qty, atau Selisih.
                </p>
              </div>

              {submittedStatus && (
                <div style={{ 
                  padding: '14px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '0.875rem',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{submittedStatus}</div>
                </div>
              )}

              <form onSubmit={handleBlindCountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                    TARGET LOCATION BARCODE
                  </label>
                  <input 
                    type="text" 
                    value="A01-R03-L02-B04" 
                    disabled 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      color: '#f8fafc',
                      fontSize: '1rem',
                      fontWeight: 600
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                    SCAN MID / BARCODE MATERIAL *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: MID-2026-994821" 
                    value={scannedMid}
                    onChange={(e) => setScannedMid(e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(6, 182, 212, 0.4)', 
                      backgroundColor: 'rgba(18, 24, 36, 0.9)',
                      color: '#f8fafc',
                      fontSize: '1rem'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '6px' }}>
                    PHYSICAL QUANTITY ENTRY * (KG)
                  </label>
                  <input 
                    type="number" 
                    placeholder="Masukkan jumlah hasil hitung fisik murni..." 
                    value={physicalQty}
                    onChange={(e) => setPhysicalQty(e.target.value)}
                    required
                    step="0.01"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid rgba(6, 182, 212, 0.4)', 
                      backgroundColor: 'rgba(18, 24, 36, 0.9)',
                      color: '#f8fafc',
                      fontSize: '1.25rem',
                      fontWeight: 700
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
                    <CheckCircle2 size={18} /> CONFIRM ENTRY (BLIND)
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '14px' }}>
                    LOCATION EMPTY
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'master' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>MASTER DATA CATALOG (5 KELOMPOK)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '8px' }}>A. Physical Warehouse</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Warehouses, Zones, Areas, Lanes, Lines, Racks, Levels, Bins, Docks, Doors</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#34d399', marginBottom: '8px' }}>B. Inventory Master</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Materials, Categories, Batches, MIDs, Pallets, Containers, UOM Conversions</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#fbbf24', marginBottom: '8px' }}>C. Operation Rules</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Putaway, Picking (FIFO/FEFO), Replenishment, Tolerance Rules, Approval Rules</p>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '1rem', color: '#a78bfa', marginBottom: '8px' }}>D. Security & 3D Master</h3>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Users, RBAC Permissions, PDA Registry, 3D Object Templates, Layout Versions</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>IMMUTABLE LEDGER & AUDIT TRAIL</h2>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                <p style={{ color: '#34d399' }}>[2026-08-25T16:13:05Z] TXN_RECEIVING | MID-001 | Qty: 1,000 KG | Location: DOCK-IN-01 | User: usr-admin-001</p>
                <p style={{ color: '#38bdf8' }}>[2026-08-25T16:20:10Z] TXN_PUTAWAY   | MID-001 | Qty: 1,000 KG | Location: A01-R03-L02-B04 | User: usr-putaway-01</p>
                <p style={{ color: '#fbbf24' }}>[2026-08-25T16:30:00Z] TXN_CYCLE_COUNT | Target: A01-R03-L02-B04 | Physical: 980 KG | User: usr-counter-01</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Control Panel Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Real-time KPI Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#06b6d4" /> CONTROL TOWER KPIS
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Inventory Quantity Accuracy</span>
                  <span style={{ fontWeight: 700, color: '#34d399' }}>99.2%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '99.2%', height: '100%', background: '#34d399' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Location Accuracy</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>98.5%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '98.5%', height: '100%', background: '#38bdf8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>SO Completion Rate</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24' }}>85.0%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '85.0%', height: '100%', background: '#fbbf24' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 3D Visualization Layer Select */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#3b82f6" /> 3D VIZ LAYERS (10 LAYERS)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Inventory Density',
                'Cycle Count Progress',
                'Aging & Expiry',
                'Capacity & Space Utilization',
                'Location Accuracy / Wrong Loc',
                'Active Picking Activity',
                'Replenishment Activity',
                'Exception & Discrepancy',
                'Traffic & Movement',
                'Floor Weight Load'
              ].map((layer) => (
                <button 
                  key={layer}
                  onClick={() => setSelectedLayer(layer)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    border: '1px solid',
                    borderColor: selectedLayer === layer ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                    background: selectedLayer === layer ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    color: selectedLayer === layer ? '#22d3ee' : '#94a3b8',
                    fontSize: '0.8125rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {layer}
                  {selectedLayer === layer && <Eye size={14} color="#22d3ee" />}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
