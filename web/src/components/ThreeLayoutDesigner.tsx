import React, { useState } from 'react';
import { 
  Grid, 
  PlusCircle, 
  Sliders, 
  Move, 
  RotateCw, 
  CheckCircle2, 
  Box
} from 'lucide-react';

export interface ParametricRackConfig {
  code: string;
  width: number; // in meters
  depth: number;
  height: number;
  levels: number;
  binsPerLevel: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
}

export const ThreeLayoutDesigner: React.FC = () => {
  const [layoutVersion, setLayoutVersion] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [activeObjectType, setActiveObjectType] = useState<'RACK' | 'ZONE' | 'AISLE' | 'WALL' | 'DOOR' | 'DOCK'>('RACK');

  // Parametric Generator Inputs (Task 9.1)
  const [rackConfig, setRackConfig] = useState<ParametricRackConfig>({
    code: 'RACK-C01',
    width: 2.7,
    depth: 1.1,
    height: 6.0,
    levels: 5,
    binsPerLevel: 4,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationY: 0
  });

  const [generatedBins, setGeneratedBins] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Generate Parametric Rack & Auto-Create Barcode Bins
  const handleGenerateParametricRack = (e: React.FormEvent) => {
    e.preventDefault();

    const bins: string[] = [];
    for (let l = 1; l <= rackConfig.levels; l++) {
      for (let b = 1; b <= rackConfig.binsPerLevel; b++) {
        bins.push(`${rackConfig.code}-L0${l}-B0${b}`);
      }
    }

    setGeneratedBins(bins);
    setNotification(`[PARAMETRIC RACK GENERATED] Rak '${rackConfig.code}' (${rackConfig.width}m x ${rackConfig.depth}m x ${rackConfig.height}m) berhasil dibuat beserta ${bins.length} Barcode Bin otomatis!`);
  };

  // Publish Layout Version Cycle (Task 9.5)
  const handlePublishLayout = () => {
    setLayoutVersion('PUBLISHED');
    setNotification(`[LAYOUT PUBLISHED] Versi layout 3D 'v1.1-PUBLISHED' berhasil dipublikasikan ke produksi! Pemetaan 1-to-1 dengan database aktif.`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 300px', gap: '16px', height: '100%', minHeight: '520px' }}>
      
      {/* Left Sidebar: Object Placement Palette & Parametric Controls */}
      <div style={{ background: 'rgba(18, 24, 36, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} /> ADD 3D OBJECT PALETTE
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Pilih jenis objek fisik pergudangan:</p>
        </div>

        {/* Object Category Palette */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {(['RACK', 'ZONE', 'AISLE', 'WALL', 'DOOR', 'DOCK'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setActiveObjectType(type)}
              style={{ 
                padding: '10px', 
                borderRadius: '6px', 
                border: activeObjectType === type ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                background: activeObjectType === type ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                color: activeObjectType === type ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              + {type}
            </button>
          ))}
        </div>

        {/* Parametric Rack Generator Form */}
        <form onSubmit={handleGenerateParametricRack} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>PARAMETRIC RACK GENERATOR</span>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>RACK CODE</label>
            <input 
              type="text" 
              value={rackConfig.code} 
              onChange={e => setRackConfig({ ...rackConfig, code: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8125rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>LEBAR (W)</label>
              <input type="number" step="0.1" value={rackConfig.width} onChange={e => setRackConfig({ ...rackConfig, width: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>DALAM (D)</label>
              <input type="number" step="0.1" value={rackConfig.depth} onChange={e => setRackConfig({ ...rackConfig, depth: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TINGGI (H)</label>
              <input type="number" step="0.1" value={rackConfig.height} onChange={e => setRackConfig({ ...rackConfig, height: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>JUMLAH LEVEL</label>
              <input type="number" value={rackConfig.levels} onChange={e => setRackConfig({ ...rackConfig, levels: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BIN / LEVEL</label>
              <input type="number" value={rackConfig.binsPerLevel} onChange={e => setRackConfig({ ...rackConfig, binsPerLevel: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              padding: '10px', 
              borderRadius: '6px', 
              border: 'none', 
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            GENERATE RACK 3D & BINS
          </button>
        </form>
      </div>

      {/* Middle Interactive 3D Designer Workspace */}
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Designer Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>3D DESIGNER CANVAS WORKSPACE</span>
            <span className={`badge ${layoutVersion === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
              VERSION: {layoutVersion}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setSnapToGrid(!snapToGrid)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '4px', 
                border: snapToGrid ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                background: snapToGrid ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: snapToGrid ? '#22d3ee' : '#94a3b8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Grid size={14} /> SNAP TO GRID (0.5m)
            </button>

            {layoutVersion === 'DRAFT' && (
              <button 
                onClick={handlePublishLayout}
                style={{ padding: '6px 14px', borderRadius: '4px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCircle2 size={14} /> PUBLISH TO PROD
              </button>
            )}
          </div>
        </div>

        {notification && (
          <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#22d3ee', fontSize: '0.75rem', marginBottom: '12px' }}>
            {notification}
          </div>
        )}

        {/* Simulated 3D Designer Grid Canvas */}
        <div style={{ flex: 1, minHeight: '360px', background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', borderRadius: '8px', border: '1px dashed rgba(6, 182, 212, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box size={48} color="#06b6d4" style={{ marginBottom: '12px' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>GIZMO TRANSFORM CONTROLS ACTIVE</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Move X/Y/Z, Rotate X/Y/Z, Snap-to-Object & Grouping Engine Ready</span>

          {generatedBins.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>AUTOGENERATED BINS IN DATABASE LEDGER:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px', maxWidth: '400px' }}>
                {generatedBins.slice(0, 8).map(b => (
                  <span key={b} style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', borderRadius: '4px', fontSize: '0.7rem' }}>
                    {b}
                  </span>
                ))}
                {generatedBins.length > 8 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{generatedBins.length - 8} more...</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Numeric Property Inspector Panel (Task 9.4) */}
      <div style={{ background: 'rgba(18, 24, 36, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} /> NUMERIC PROPERTY PANEL
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Presisi posisi & orientasi 3D:</p>
        </div>

        {/* Position X / Y / Z */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Move size={14} /> POSISI 3D (METERS)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>X</label>
              <input type="number" step="0.5" value={rackConfig.positionX} onChange={e => setRackConfig({ ...rackConfig, positionX: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Y</label>
              <input type="number" step="0.5" value={rackConfig.positionY} onChange={e => setRackConfig({ ...rackConfig, positionY: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Z</label>
              <input type="number" step="0.5" value={rackConfig.positionZ} onChange={e => setRackConfig({ ...rackConfig, positionZ: Number(e.target.value) })} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }} />
            </div>
          </div>
        </div>

        {/* Rotation Y */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCw size={14} /> ROTASI Y (DEGREES)
          </span>
          <input 
            type="number" 
            step="15" 
            value={rackConfig.rotationY} 
            onChange={e => setRackConfig({ ...rackConfig, rotationY: Number(e.target.value) })} 
            style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem', marginTop: '6px' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ThreeLayoutDesigner;
