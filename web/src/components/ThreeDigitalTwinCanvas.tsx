import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass, Search, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export interface ThreeDigitalTwinCanvasProps {
  activeLayer?: string;
  onObjectSelect?: (code: string) => void;
}

// Simulated bin database metadata (1-to-1 mapping)
const BIN_DATABASE: Record<string, { material: string; qty: number; uom: string; status: string; age: number; accuracy: number }> = {};
const BIN_CODES: string[] = [];

// Pre-generate bin metadata
for (let r = 0; r < 4; r++) {
  for (let l = 0; l < 4; l++) {
    for (let b = 0; b < 4; b++) {
      const code = `A0${r+1}-R03-L0${l+1}-B0${b+1}`;
      BIN_CODES.push(code);
      BIN_DATABASE[code] = {
        material: ['RM-RESIN-001','RM-PIGMENT-002','FG-BOTTLE-003','RM-CAPS-004'][Math.floor(Math.random()*4)],
        qty: Math.floor(Math.random() * 900 + 100),
        uom: ['KG','PCS','LTR'][Math.floor(Math.random()*3)],
        status: ['AVAILABLE','ALLOCATED','BLOCKED','HOLD'][Math.floor(Math.random()*4)],
        age: Math.floor(Math.random() * 200),
        accuracy: Math.floor(Math.random() * 20 + 80),
      };
    }
  }
}

const getLayerColor = (idx: number, layer: string): THREE.Color => {
  const code = BIN_CODES[idx] || '';
  const meta = BIN_DATABASE[code];
  const c = new THREE.Color();

  if (layer === 'Inventory Density') {
    const fill = meta ? meta.qty / 1000 : 0.5;
    c.setRGB(1 - fill, fill * 0.8, 0.2);
  } else if (layer === 'Aging & Expiry') {
    const age = meta ? meta.age : 0;
    if (age > 180) c.setHex(0xef4444);
    else if (age > 90) c.setHex(0xf97316);
    else if (age > 60) c.setHex(0xeab308);
    else if (age > 30) c.setHex(0x38bdf8);
    else c.setHex(0x10b981);
  } else if (layer === 'Location Accuracy / Wrong Loc') {
    if (idx === 5) c.setHex(0xef4444);    // Wrong location
    else if (idx === 12) c.setHex(0xf59e0b); // Variance
    else c.setHex(0x10b981);
  } else if (layer === 'Exception & Discrepancy') {
    if (idx % 13 === 0) c.setHex(0xef4444);
    else if (idx % 7 === 0) c.setHex(0xf59e0b);
    else c.setHex(0x22d3ee);
  } else if (layer === 'Cycle Count Progress') {
    if (idx < 20) c.setHex(0x10b981);     // Counted
    else if (idx < 35) c.setHex(0xf59e0b); // In Progress
    else c.setHex(0x475569);              // Not Started
  } else if (layer === 'Capacity & Space Utilization') {
    const fill = meta ? meta.qty / 1000 : 0.5;
    if (fill > 0.85) c.setHex(0xef4444);
    else if (fill > 0.65) c.setHex(0xf59e0b);
    else c.setHex(0x10b981);
  } else if (layer === 'Active Picking Activity') {
    if (idx % 5 === 0) c.setHex(0xa855f7);
    else c.setHex(0x1e293b);
  } else if (layer === 'Replenishment Activity') {
    if (idx % 8 === 0) c.setHex(0xf97316);
    else c.setHex(0x10b981);
  } else if (layer === 'Traffic & Movement') {
    const hue = (idx / 64) * 0.4;
    c.setHSL(hue, 0.9, 0.55);
  } else if (layer === 'Floor Weight Load') {
    const weight = (idx % 10) / 10;
    c.setRGB(weight, 0.3, 1 - weight);
  } else {
    c.setHex(0x38bdf8);
  }
  return c;
};

export const ThreeDigitalTwinCanvas: React.FC<ThreeDigitalTwinCanvasProps> = ({
  activeLayer = 'Inventory Density',
  onObjectSelect
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const frameRef = useRef<number>(0);

  // Orbit state
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 50 });

  const [selectedBin, setSelectedBin] = useState<{ code: string; meta: typeof BIN_DATABASE[string] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const [currentPreset, setCurrentPreset] = useState<'TOP' | 'FRONT' | 'SIDE' | 'ISO'>('ISO');

  // Update camera from spherical coords
  const applySpherical = useCallback(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const { theta, phi, radius } = spherical.current;
    cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cam.position.y = radius * Math.cos(phi);
    cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cam.lookAt(0, 3, 0);
  }, []);

  // Update heatmap colors when layer changes
  useEffect(() => {
    const mesh = instancedMeshRef.current;
    if (!mesh) return;
    for (let i = 0; i < 64; i++) {
      let color = getLayerColor(i, activeLayer);
      if (highlightedIdx !== null && i === highlightedIdx) {
        color = new THREE.Color(0xffffff);
      }
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [activeLayer, highlightedIdx]);

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.008);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    cameraRef.current = camera;
    applySpherical();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dir.position.set(30, 50, 20);
    dir.castShadow = true;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x3b82f6, 0.4);
    fill.position.set(-20, 10, -20);
    scene.add(fill);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(80, 40, 0x06b6d4, 0x1e293b);
    (grid.material as THREE.Material & { opacity: number; transparent: boolean }).opacity = 0.4;
    (grid.material as THREE.Material & { transparent: boolean }).transparent = true;
    scene.add(grid);

    // Rack frame pillars
    for (let r = 0; r < 4; r++) {
      const rx = (r - 1.5) * 12;
      const pillarGeo = new THREE.BoxGeometry(0.15, 6, 0.15);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      [-2.2, 2.2].forEach(bx => {
        const p = new THREE.Mesh(pillarGeo, pillarMat);
        p.position.set(rx + bx, 3, 0);
        p.castShadow = true;
        scene.add(p);
      });
      // Crossbars
      for (let lv = 0; lv <= 4; lv++) {
        const barGeo = new THREE.BoxGeometry(4.5, 0.1, 0.1);
        const bar = new THREE.Mesh(barGeo, pillarMat);
        bar.position.set(rx, lv * 1.2, 0);
        scene.add(bar);
      }
    }

    // InstancedMesh Bins
    const binGeo = new THREE.BoxGeometry(1.1, 0.75, 0.9);
    const binMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.15 });
    const instancedMesh = new THREE.InstancedMesh(binGeo, binMat, 64);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMeshRef.current = instancedMesh;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let r = 0; r < 4; r++) {
      for (let l = 0; l < 4; l++) {
        for (let b = 0; b < 4; b++) {
          const x = (r - 1.5) * 12 + (b - 1.5) * 1.4;
          const y = l * 1.2 + 0.6;
          dummy.position.set(x, y, 0);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(idx, dummy.matrix);
          instancedMesh.setColorAt(idx, getLayerColor(idx, activeLayer));
          idx++;
        }
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    scene.add(instancedMesh);

    // Raycaster click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(instancedMesh);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const id = hits[0].instanceId;
        const code = BIN_CODES[id] || `BIN-${id}`;
        const meta = BIN_DATABASE[code];
        setSelectedBin({ code, meta });
        setHighlightedIdx(id);
        if (onObjectSelect) onObjectSelect(code);
      }
    };

    // Orbit controls (manual)
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      spherical.current.theta -= dx * 0.008;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI * 0.85, spherical.current.phi + dy * 0.008));
      lastMouse.current = { x: e.clientX, y: e.clientY };
      applySpherical();
    };
    const handleMouseUp = () => { isDragging.current = false; };
    const handleWheel = (e: WheelEvent) => {
      spherical.current.radius = Math.max(10, Math.min(120, spherical.current.radius + e.deltaY * 0.05));
      applySpherical();
    };

    const dom = renderer.domElement;
    dom.addEventListener('click', handleClick);
    dom.addEventListener('mousedown', handleMouseDown);
    dom.addEventListener('mousemove', handleMouseMove);
    dom.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: true });
    dom.style.cursor = 'grab';

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight || 500;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('mousemove', handleMouseMove);
      dom.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const setCameraPreset = (preset: 'TOP' | 'FRONT' | 'SIDE' | 'ISO') => {
    setCurrentPreset(preset);
    if (preset === 'TOP') {
      spherical.current = { theta: 0, phi: 0.05, radius: 60 };
    } else if (preset === 'FRONT') {
      spherical.current = { theta: 0, phi: Math.PI / 2, radius: 50 };
    } else if (preset === 'SIDE') {
      spherical.current = { theta: Math.PI / 2, phi: Math.PI / 2.5, radius: 50 };
    } else {
      spherical.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 50 };
    }
    applySpherical();
  };

  const handleSearch = () => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;
    const idx = BIN_CODES.findIndex(c => c.toUpperCase().includes(q));
    if (idx !== -1) {
      setHighlightedIdx(idx);
      setSearchResult(BIN_CODES[idx]);
      const meta = BIN_DATABASE[BIN_CODES[idx]];
      setSelectedBin({ code: BIN_CODES[idx], meta });
      // Fly to bin
      spherical.current = { theta: Math.PI / 6, phi: Math.PI / 3.5, radius: 35 };
      applySpherical();
    } else {
      setSearchResult('NOT_FOUND');
    }
  };

  const statusColor: Record<string, string> = {
    AVAILABLE: '#10b981', ALLOCATED: '#38bdf8', BLOCKED: '#ef4444', HOLD: '#f59e0b'
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}>
      {/* Three.js Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '480px', borderRadius: '8px', overflow: 'hidden' }} />

      {/* Camera Presets Bar */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', background: 'rgba(10,14,23,0.85)', padding: '8px', borderRadius: '8px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {(['TOP','FRONT','SIDE','ISO'] as const).map(p => (
          <button key={p} onClick={() => setCameraPreset(p)} style={{ padding: '5px 11px', background: currentPreset === p ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)', border: currentPreset === p ? '1px solid #06b6d4' : 'none', color: currentPreset === p ? '#22d3ee' : '#f8fafc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {p === 'TOP' && <Compass size={12} />} {p === 'ISO' ? '3D ISO' : p}
          </button>
        ))}
        <span style={{ padding: '5px 8px', fontSize: '0.65rem', color: '#475569', alignSelf: 'center' }}>Drag to orbit | Scroll to zoom</span>
      </div>

      {/* Search Panel */}
      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
        {!showSearch ? (
          <button onClick={() => setShowSearch(true)} style={{ padding: '7px 12px', background: 'rgba(10,14,23,0.85)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(8px)' }}>
            <Search size={14} /> 3D Search MID
          </button>
        ) : (
          <div style={{ background: 'rgba(10,14,23,0.92)', border: '1px solid #06b6d4', borderRadius: '8px', padding: '10px', width: '240px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Ketik MID / Bin code..." style={{ flex: 1, padding: '7px 10px', background: '#1e293b', border: '1px solid #06b6d4', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} />
              <button onClick={handleSearch} style={{ padding: '7px 10px', background: '#06b6d4', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}><Search size={14} /></button>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResult(null); }} style={{ padding: '7px 8px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', color: '#94a3b8', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            {searchResult && searchResult !== 'NOT_FOUND' && (
              <div style={{ fontSize: '0.75rem', color: '#34d399', padding: '4px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Camera flew to: <strong>{searchResult}</strong>
              </div>
            )}
            {searchResult === 'NOT_FOUND' && (
              <div style={{ fontSize: '0.75rem', color: '#f87171', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> Bin tidak ditemukan di ledger.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Bin Info Panel */}
      {selectedBin && (
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(10,14,23,0.92)', border: '1px solid #06b6d4', padding: '14px 16px', borderRadius: '10px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', minWidth: '260px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>1-TO-1 DATABASE ENTITY</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{selectedBin.code}</div>
            </div>
            <button onClick={() => { setSelectedBin(null); setHighlightedIdx(null); }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
          </div>
          {selectedBin.meta && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Material</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedBin.meta.material}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Quantity</span>
                <span style={{ color: '#22d3ee', fontWeight: 700 }}>{selectedBin.meta.qty.toLocaleString()} {selectedBin.meta.uom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Status</span>
                <span style={{ color: statusColor[selectedBin.meta.status] || '#f8fafc', fontWeight: 700 }}>{selectedBin.meta.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Umur Material</span>
                <span style={{ color: selectedBin.meta.age > 90 ? '#f87171' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={11} /> {selectedBin.meta.age} hari
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Inventory Accuracy</span>
                <span style={{ color: selectedBin.meta.accuracy >= 95 ? '#34d399' : '#f59e0b', fontWeight: 700 }}>{selectedBin.meta.accuracy}%</span>
              </div>
              <div style={{ marginTop: '6px', padding: '5px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> Live Synchronized with Immutable Ledger
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreeDigitalTwinCanvas;
