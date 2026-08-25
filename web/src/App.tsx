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
  Maximize2
} from 'lucide-react';
import ThreeDigitalTwinCanvas from './components/ThreeDigitalTwinCanvas';
import PdaMobileInterface from './components/PdaMobileInterface';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'3d' | 'blind-so' | 'master' | 'audit'>('3d');
  const [selectedLayer, setSelectedLayer] = useState<string>('Inventory Density');
  const [selectedLocationFrom3D, setSelectedLocationFrom3D] = useState<string | null>(null);

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
                  {selectedLocationFrom3D && (
                    <span className="badge badge-warning">
                      Selected: {selectedLocationFrom3D}
                    </span>
                  )}
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

              {/* Three.js WebGL Interactive Canvas */}
              <div style={{ flex: 1, minHeight: '480px', position: 'relative' }}>
                <ThreeDigitalTwinCanvas 
                  activeLayer={selectedLayer}
                  onObjectSelect={(code) => setSelectedLocationFrom3D(code)}
                />
              </div>
            </>
          )}

          {activeTab === 'blind-so' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <PdaMobileInterface />
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
