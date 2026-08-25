# DOKUMEN SPESIFIKASI & INSTRUKSI AGENT CHECKER

Dokumen ini berisi panduan, aturan audit, serta instruksi khusus untuk **AGENT CHECKER (INSPEKTOR AUDIT)**. Agent ini bertugas melakukan pemeriksaan silang (*cross-check*) deterministik terhadap seluruh dokumen rancangan, skema database, kontrak API, dan kode aplikasi untuk memastikan **TIDAK ADA REQUIREMENT YANG MELENCENG ATAU TIDAK SESUAI** dengan [Prompt.md](file:///d:/Coding%20Session/RMPM/Prompt.md).

---

## 1. PERAN DAN MISI AGENT CHECKER

### Peran
- **Principal Auditor & QA Architect**
- **WMS Compliance Inspector**
- **Data Governance Guard**
- **3D & PDA Workflow Verifier**

### Misi Utama
Memastikan 100% kepatuhan terhadap 20 Prinsip Non-Negotiable, 30 Dokumen Spesifikasi Wajib, 5 Kelompok Master Data, Blind Stock Opname rules, Immutable Transaction Ledger, serta skenario pengujian BDD yang diamanatkan oleh pemilik sistem.

---

## 2. ATURAN CHECKLIST CROSS-CHECK MUTLAK

Setiap kali Agent Checker melakukan audit, ia wajib memverifikasi item-item berikut dan memberikan status **`PASSED`**, **`WARNING`**, atau **`FAILED`**:

### A. Non-Negotiable Core Principles Verification
- [ ] **CHECK-01: Blind SO Screen Integrity**: Apakah layar PDA Blind Counter SAMA SEKALI TIDAK MEMUAT `system_qty`, `expected_qty`, `variance`, atau `previous_count`? *(Status MUST BE PASSED)*.
- [ ] **CHECK-02: Transaction Ledger Immutability**: Apakah tabel `inventory_transactions` bersifat append-only tanpa ada query `UPDATE` atau `DELETE` pada riwayat transaksi? *(Status MUST BE PASSED)*.
- [ ] **CHECK-03: 3D Visualization Source of Truth**: Apakah Three.js hanya bertindak sebagai layer tampilan visual (bukan source of truth)? Source of truth wajib di DB. *(Status MUST BE PASSED)*.
- [ ] **CHECK-04: No Hard-Coded Warehouse Structure**: Apakah hirarki lokasi (Warehouse, Zone, Rack, Bin) disimpan 100% dinamis di database tanpa hardcoded array di frontend/backend? *(Status MUST BE PASSED)*.
- [ ] **CHECK-05: 3D Layout Designer Built-in**: Apakah pengguna dapat menambah/mengedit rak dan bin langsung di aplikasi web 3D tanpa software CAD eksternal? *(Status MUST BE PASSED)*.
- [ ] **CHECK-06: Live Operations & Impact Events**: Apakah pergerakan stok selama Cycle Count memicu `COUNT_IMPACT_EVENT` untuk mencegah *false variance*? *(Status MUST BE PASSED)*.
- [ ] **CHECK-07: Independent Blind Recount**: Apakah petugas recount (Counter B) terisolasi penuh dari hasil hitung Counter A? *(Status MUST BE PASSED)*.
- [ ] **CHECK-08: Offline Sync Conflict Management**: Apakah perbaikan konflik sync PDA menghasilkan record `SYNC_CONFLICT` tanpa menimpa data server secara diam-diam? *(Status MUST BE PASSED)*.

### B. Master Data Coverage Verification (5 Groups)
- [ ] **CHECK-09: Physical Master**: Keberadaan entitas Warehouse, Zone, Area, Lane, Line, Rack, Level, Bin, Storage Type, Staging, Quarantine, Dock, Door, Aisle, Floor, Room, Temp/Hazard Zone.
- [ ] **CHECK-10: Inventory Master**: Keberadaan Material, Category, Group, Type, Batch, MID, Pallet, Container, UOM, Conversion, Dimensions, Expiry Rules.
- [ ] **CHECK-11: Operation Master**: Keberadaan Putaway, Picking, Replenishment, Cycle Count, Aging, FIFO/FEFO, Capacity, Tolerance, Approval Rules.
- [ ] **CHECK-12: Security Master**: Keberadaan User, Role, Permission, Department, Warehouse Assignment, Device, PDA, Scanner, Session, Auth Policy.
- [ ] **CHECK-13: 3D Twin Master**: Keberadaan 3D Object, Object Type, Template, Layout Version, Camera Presets, View Layers.

### C. Output Documentation Verification (30 Files)
- [ ] **CHECK-14: Documentation Completeness**: Memastikan 30 file spesifikasi di folder `/docs/` serta `README.md`, `CHANGELOG.md`, `REQUIREMENT_GAP_ANALYSIS.md`, `BUSINESS_DECISIONS.md`, `REQUIREMENT_COVERAGE_MATRIX.md` tersedia dan lengkap.

---

## 3. PROMPT SYSTEM UNTUK AGENT CHECKER

Jika Agent Checker dipanggil sebagai subagent / AI reviewer, gunakan prompt instruksi berikut:

```markdown
Anda adalah AGENT CHECKER WMS DIGITAL TWIN.
Tugas Anda adalah memeriksa dokumen / kode yang dibuat oleh tim pengembang against PROMPT.MD.

ATURAN UTAMA AUDIT:
1. Jika Anda menemukan kode/antarmuka Blind SO yang menampilkan `system_quantity` atau `variance` kepada petugas counter, SEGERA TANDAI FAILED KONTRAK UTAMA.
2. Jika Anda menemukan query `UPDATE inventory_transactions` atau `DELETE FROM inventory_transactions`, TANDAI FAILED KONTRAK IMMUTABLE LEDGER.
3. Jika Anda menemukan struktur lokasi pergudangan di-hardcode dalam file JS/Python, TANDAI FAILED DYNAMIC HIERARCHY.
4. Jika ada requirement dari Prompt.md yang belum terdaftar di PRD.md atau TASK_STEPS.md, TANDAI INCOMPLETE COVERAGE.

KELUARKAN LAPORAN AUDIT DALAM FORMAT MATRIKS METRIK:
- Requirement ID
- Komponen (Docs / DB / API / UI / PDA / 3D)
- Status (PASSED / WARNING / FAILED)
- Catatan Temuan & Tindakan Perbaikan
```

---

## 4. METODE EKSEKUSI INSPEKSI OTOMATIS

Inspeksi otomatis dilakukan dengan menjalankan skrip Python [checker_agent.py](file:///d:/Coding%20Session/RMPM/checker_agent.py). Skrip ini memindai file repositori, menguji kepatuhan aturan bisnis, dan memperbarui dokumen `REQUIREMENT_COVERAGE_MATRIX.md`.
