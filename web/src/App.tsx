import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Eye, 
  QrCode, 
  ShieldCheck, 
  Activity, 
  Database, 
  Cpu, 
  Search,
  Sliders,
  Maximize2,
  Layout,
  CheckCircle2
} from 'lucide-react';
import ThreeDigitalTwinCanvas from './components/ThreeDigitalTwinCanvas';
import PdaMobileInterface from './components/PdaMobileInterface';
import ThreeLayoutDesigner from './components/ThreeLayoutDesigner';

// Mock Master Data Arrays for Interactive Drilling
const MOCK_WAREHOUSES = [
  { code: 'WH-CIBITUNG-01', name: 'Gudang Bahan Baku Utama Cibitung', zoneCount: 4, rackCount: 16, binCount: 256, status: 'ACTIVE' },
  { code: 'WH-KARAWANG-02', name: 'Gudang Transit Material Karawang', zoneCount: 2, rackCount: 8, binCount: 128, status: 'ACTIVE' },
];

const MOCK_MATERIALS = [
  { code: 'RM-RESIN-001', name: 'Polypropylene Resin Grade A', category: 'Raw Material', minStock: 1000, maxStock: 10000, uom: 'KG' },
  { code: 'RM-PIGMENT-002', name: 'White Pigment Masterbatch', category: 'Chemical Additive', minStock: 200, maxStock: 2000, uom: 'KG' },
  { code: 'FG-BOTTLE-003', name: '500ml HDPE Bottle Clear', category: 'Finished Goods', minStock: 5000, maxStock: 50000, uom: 'PCS' },
  { code: 'RM-CAPS-004', name: 'Screw Cap 28mm Blue', category: 'Packaging', minStock: 10000, maxStock: 100000, uom: 'PCS' },
];

const MOCK_LEDGER = [
  { id: 'TXN-20260825-001', type: 'RECEIVING', mid: 'MID-2026-994821', material: 'RM-RESIN-001', qty: 1000, uom: 'KG', source: 'DOCK-IN-01', dest: 'A01-R03-L02-B04', user: 'usr-receiving-01', time: '2026-08-25 09:15:22' },
  { id: 'TXN-20260825-002', type: 'PUTAWAY', mid: 'MID-2026-994821', material: 'RM-RESIN-001', qty: 1000, uom: 'KG', source: 'DOCK-IN-01', dest: 'A01-R03-L02-B04', user: 'usr-putaway-02', time: '2026-08-25 09:30:10' },
  { id: 'TXN-20260825-003', type: 'CYCLE_COUNT', mid: 'MID-2026-994821', material: 'RM-RESIN-001', qty: 980, uom: 'KG', source: 'A01-R03-L02-B04', dest: 'A01-R03-L02-B04', user: 'usr-counter-01', time: '2026-08-25 11:05:40' },
  { id: 'TXN-20260825-004', type: 'PICKING', mid: 'MID-2026-994822', material: 'RM-PIGMENT-002', qty: 150, uom: 'KG', source: 'A01-R03-L01-B02', dest: 'STAGING-OUT-01', user: 'usr-picker-03', time: '2026-08-25 14:20:15' },
  { id: 'TXN-20260825-005', type: 'BIN_TO_BIN', mid: 'MID-2026-994823', material: 'RM-CAPS-004', qty: 5000, uom: 'PCS', source: 'A02-R01-L03-B01', dest: 'A01-R03-L04-B02', user: 'usr-forklift-01', time: '2026-08-25 16:45:00' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'designer' | 'blind-so' | 'master' | 'audit'>('3d');
  const [selectedLayer, setSelectedLayer] = useState<string>('Inventory Density');
  const [selectedLocationFrom3D, setSelectedLocationFrom3D] = useState<string | null>(null);
  
  // Master Data Tab Filtering State
  const [masterSubCategory, setMasterSubCategory] = useState<'warehouses' | 'materials' | 'rules'>('warehouses');
  const [masterSearch, setMasterSearch] = useState<string>('');

  // Ledger Tab Filtering State
  const [ledgerFilterType, setLedgerFilterType] = useState<string>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState<string>('');

  // Notification Banner State
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredLedger = MOCK_LEDGER.filter(item => {
    const matchesType = ledgerFilterType === 'ALL' || item.type === ledgerFilterType;
    const matchesSearch = item.mid.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          item.material.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                          item.user.toLowerCase().includes(ledgerSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0e17', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navigation Header */}
      <header style={{ 
        height: '64px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 24px',
        backgroundColor: 'rgba(18, 24, 36, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc', margin: 0 }}>
              RMPM WAREHOUSE DIGITAL TWIN
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>Enterprise Control Tower & Blind SO Engine</p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${activeTab === '3d' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('3d')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === '3d' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: activeTab === '3d' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', color: activeTab === '3d' ? '#22d3ee' : '#94a3b8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Box size={16} /> 3D Digital Twin
          </button>
          <button 
            className={`btn ${activeTab === 'designer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('designer')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === 'designer' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: activeTab === 'designer' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', color: activeTab === 'designer' ? '#22d3ee' : '#94a3b8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layout size={16} /> 3D Designer
          </button>
          <button 
            className={`btn ${activeTab === 'blind-so' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('blind-so')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === 'blind-so' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: activeTab === 'blind-so' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', color: activeTab === 'blind-so' ? '#22d3ee' : '#94a3b8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <QrCode size={16} /> Blind SO (PDA)
          </button>
          <button 
            className={`btn ${activeTab === 'master' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('master')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === 'master' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: activeTab === 'master' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', color: activeTab === 'master' ? '#22d3ee' : '#94a3b8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Database size={16} /> Master Data
          </button>
          <button 
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('audit')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: activeTab === 'audit' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: activeTab === 'audit' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)', color: activeTab === 'audit' ? '#22d3ee' : '#94a3b8', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} /> Ledger & Audit
          </button>
        </nav>

        {/* System Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} />
            LEDGER LIVE
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#22d3ee', fontSize: '0.72rem', fontWeight: 700 }}>
            <Cpu size={12} /> 60 FPS (WebGL)
          </span>
        </div>
      </header>

      {/* Global Toast Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: '74px', right: '24px', zIndex: 1000, padding: '12px 20px', background: 'rgba(6, 182, 212, 0.95)', border: '1px solid #22d3ee', color: '#ffffff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {notification}
        </div>
      )}

      {/* Main Workspace Layout */}
      <main style={{ flex: 1, padding: '20px 24px', display: 'grid', gridTemplateColumns: activeTab === 'designer' || activeTab === 'blind-so' ? '1fr' : '1fr 320px', gap: '20px' }}>
        
        {/* Main Content Area */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'rgba(18, 24, 36, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
          
          {/* TAB 1: 3D DIGITAL TWIN */}
          {activeTab === '3d' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>ACTIVE HEATMAP LAYER:</span>
                  <span style={{ padding: '4px 12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#22d3ee', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> {selectedLayer}
                  </span>
                  {selectedLocationFrom3D && (
                    <span style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700 }}>
                      Selected: {selectedLocationFrom3D}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => triggerNotif('Fitur 3D Search aktif! Ketik nama MID di input kanan canvas.')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={14} /> 3D Search MID
                  </button>
                  <button onClick={() => triggerNotif('Preset kamera di-reset ke standar ISO 3D View')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={14} /> Reset View
                  </button>
                  <button onClick={() => triggerNotif('Tampilan Fullscreen WebGL 3D Canvas diaktifkan')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Maximize2 size={14} /> Fullscreen
                  </button>
                </div>
              </div>

              {/* Three.js Interactive Canvas Component */}
              <div style={{ flex: 1, minHeight: '520px', position: 'relative' }}>
                <ThreeDigitalTwinCanvas 
                  activeLayer={selectedLayer}
                  onObjectSelect={(code) => setSelectedLocationFrom3D(code)}
                />
              </div>
            </>
          )}

          {/* TAB 2: PARAMETRIC 3D LAYOUT DESIGNER */}
          {activeTab === 'designer' && (
            <ThreeLayoutDesigner />
          )}

          {/* TAB 3: BLIND SO MOBILE PDA TERMINAL */}
          {activeTab === 'blind-so' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
              <PdaMobileInterface />
            </div>
          )}

          {/* TAB 4: MASTER DATA CATALOG */}
          {activeTab === 'master' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>MASTER DATA CATALOG (5 KELOMPOK)</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Single Source of Truth untuk seluruh entitas fisik dan operasional gudang</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setMasterSubCategory('warehouses')} style={{ padding: '8px 14px', borderRadius: '6px', border: masterSubCategory === 'warehouses' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: masterSubCategory === 'warehouses' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', color: masterSubCategory === 'warehouses' ? '#22d3ee' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                    Physical Warehouses
                  </button>
                  <button onClick={() => setMasterSubCategory('materials')} style={{ padding: '8px 14px', borderRadius: '6px', border: masterSubCategory === 'materials' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: masterSubCategory === 'materials' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', color: masterSubCategory === 'materials' ? '#22d3ee' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                    Inventory Master
                  </button>
                  <button onClick={() => setMasterSubCategory('rules')} style={{ padding: '8px 14px', borderRadius: '6px', border: masterSubCategory === 'rules' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', background: masterSubCategory === 'rules' ? 'rgba(6, 182, 212, 0.2)' : 'transparent', color: masterSubCategory === 'rules' ? '#22d3ee' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                    Operation Rules
                  </button>
                </div>
              </div>

              {/* Master Search Input */}
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input 
                  type="text" 
                  placeholder="Cari master data..." 
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem' }}
                />
              </div>

              {/* Master Tables */}
              {masterSubCategory === 'warehouses' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px' }}>WAREHOUSE CODE</th>
                        <th style={{ padding: '12px' }}>WAREHOUSE NAME</th>
                        <th style={{ padding: '12px' }}>ZONES</th>
                        <th style={{ padding: '12px' }}>RACKS</th>
                        <th style={{ padding: '12px' }}>BINS</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_WAREHOUSES.filter(w => w.name.toLowerCase().includes(masterSearch.toLowerCase()) || w.code.toLowerCase().includes(masterSearch.toLowerCase())).map((w) => (
                        <tr key={w.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>{w.code}</td>
                          <td style={{ padding: '12px', color: '#f8fafc' }}>{w.name}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{w.zoneCount} Zones</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{w.rackCount} Racks</td>
                          <td style={{ padding: '12px', color: '#34d399', fontWeight: 700 }}>{w.binCount} Bins</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700 }}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {masterSubCategory === 'materials' && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                        <th style={{ padding: '12px' }}>MATERIAL CODE</th>
                        <th style={{ padding: '12px' }}>MATERIAL NAME</th>
                        <th style={{ padding: '12px' }}>CATEGORY</th>
                        <th style={{ padding: '12px' }}>MIN / MAX STOCK</th>
                        <th style={{ padding: '12px' }}>UOM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_MATERIALS.filter(m => m.name.toLowerCase().includes(masterSearch.toLowerCase()) || m.code.toLowerCase().includes(masterSearch.toLowerCase())).map((m) => (
                        <tr key={m.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#06b6d4' }}>{m.code}</td>
                          <td style={{ padding: '12px', color: '#f8fafc' }}>{m.name}</td>
                          <td style={{ padding: '12px', color: '#fbbf24' }}>{m.category}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{m.minStock.toLocaleString()} - {m.maxStock.toLocaleString()}</td>
                          <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>{m.uom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {masterSubCategory === 'rules' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ fontSize: '0.9375rem', color: '#38bdf8', marginBottom: '8px' }}>Strategy Rules</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Picking strategy: <strong>FEFO (First Expired First Out)</strong> dengan fallback <strong>FIFO</strong>.</p>
                  </div>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ fontSize: '0.9375rem', color: '#34d399', marginBottom: '8px' }}>Tolerance Rules</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Batas toleransi variance Blind SO: <strong>±0.5%</strong>. Selisih di atas ini butuh supervisor recount.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IMMUTABLE LEDGER & AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>IMMUTABLE LEDGER & AUDIT TRAIL</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Append-only ledger riwayat mutasi stok tanpa operasi DELETE/UPDATE</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Ledger Type Filter */}
                  <select 
                    value={ledgerFilterType} 
                    onChange={(e) => setLedgerFilterType(e.target.value)}
                    style={{ padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem' }}
                  >
                    <option value="ALL">Semua Jenis Transaksi</option>
                    <option value="RECEIVING">RECEIVING</option>
                    <option value="PUTAWAY">PUTAWAY</option>
                    <option value="CYCLE_COUNT">CYCLE_COUNT</option>
                    <option value="PICKING">PICKING</option>
                    <option value="BIN_TO_BIN">BIN_TO_BIN</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Search MID / Material / User..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    style={{ padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem', width: '220px' }}
                  />
                </div>
              </div>

              {/* Audit Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>TRANSACTION ID</th>
                      <th style={{ padding: '12px' }}>TYPE</th>
                      <th style={{ padding: '12px' }}>MID CODE</th>
                      <th style={{ padding: '12px' }}>MATERIAL</th>
                      <th style={{ padding: '12px' }}>QTY</th>
                      <th style={{ padding: '12px' }}>FROM $\rightarrow$ TO</th>
                      <th style={{ padding: '12px' }}>OPERATOR</th>
                      <th style={{ padding: '12px' }}>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedger.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#94a3b8' }}>{row.id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            background: row.type === 'RECEIVING' ? 'rgba(16,185,129,0.15)' : row.type === 'PUTAWAY' ? 'rgba(56,189,248,0.15)' : row.type === 'CYCLE_COUNT' ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)',
                            color: row.type === 'RECEIVING' ? '#34d399' : row.type === 'PUTAWAY' ? '#38bdf8' : row.type === 'CYCLE_COUNT' ? '#fbbf24' : '#d8b4fe'
                          }}>
                            {row.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>{row.mid}</td>
                        <td style={{ padding: '12px', color: '#f8fafc' }}>{row.material}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>{row.qty} {row.uom}</td>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{row.source} $\rightarrow$ {row.dest}</td>
                        <td style={{ padding: '12px', color: '#cbd5e1' }}>{row.user}</td>
                        <td style={{ padding: '12px', color: '#64748b', fontSize: '0.75rem' }}>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls (Hidden in Designer & Blind SO tabs for max canvas space) */}
        {activeTab !== 'designer' && activeTab !== 'blind-so' && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Real-time Control Tower KPI Widget */}
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(18, 24, 36, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f8fafc' }}>
                <Activity size={18} color="#06b6d4" /> CONTROL TOWER KPIS
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
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

            {/* 10 Heatmap Visualization Layer Switcher */}
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(18, 24, 36, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#f8fafc' }}>
                <Layers size={18} color="#3b82f6" /> 3D VIZ LAYERS (10 LAYERS)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
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
                    onClick={() => {
                      setSelectedLayer(layer);
                      triggerNotif(`Layer visualisasi diubah ke '${layer}'`);
                    }}
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
        )}
      </main>
    </div>
  );
};

export default App;
