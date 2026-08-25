# STEP-BY-STEP TASK CHECKLIST IMPLEMENTASI WMS DIGITAL TWIN

Dokumen ini berisi daftar tugas detail langkah demi langkah (*step-by-step*) dari **Phase 0** hingga **Phase 18** untuk memastikan **TIDAK ADA SATUPUN REQUIREMENT** dari [Prompt.md](file:///d:/Coding%20Session/RMPM/Prompt.md) yang terlewat.

---

## PHASE 0: SPECIFICATION & ARCHITECTURE DOCUMENTATION
- [ ] 0.1 Buat direktori `/docs/` di dalam root project.
- [ ] 0.2 Buat file `docs/01_SYSTEM_ARCHITECTURE.md` (Spesifikasi arsitektur modular monolith & layer visualisasi 3D).
- [ ] 0.3 Buat file `docs/02_MASTER_DATA_SPEC.md` (Spesifikasi 5 kelompok master data).
- [ ] 0.4 Buat file `docs/03_LOCATION_HIERARCHY.md` (Aturan hirarki lokasi dinamis).
- [ ] 0.5 Buat file `docs/04_INVENTORY_MODEL.md` (Spesifikasi entitas stok, Material, Batch, Pallet, MID).
- [ ] 0.6 Buat file `docs/05_TRANSACTION_MODEL.md` (Spesifikasi ledger transaksi append-only 16 jenis).
- [ ] 0.7 Buat file `docs/06_BLIND_CYCLE_COUNT_SPEC.md` (Spesifikasi Blind SO, screen restrictions, snapshot & recount).
- [ ] 0.8 Buat file `docs/07_PDA_WORKFLOW.md` (Spesifikasi UI PDA, mode scan/manual & queue offline).
- [ ] 0.9 Buat file `docs/08_3D_DIGITAL_TWIN_SPEC.md` (Spesifikasi Three.js & database entity mapping 1-to-1).
- [ ] 0.10 Buat file `docs/09_3D_LAYOUT_EDITOR_SPEC.md` (Spesifikasi 3D Designer, gizmo transform & versioning layout).
- [ ] 0.11 Buat file `docs/10_PICKING_SPEC.md` (Spesifikasi strategi alokasi picking FIFO/FEFO & task execution).
- [ ] 0.12 Buat file `docs/11_BATCHING_SPEC.md` (Spesifikasi pembentukan batch material & asosiasi produksi).
- [ ] 0.13 Buat file `docs/12_REPLENISHMENT_SPEC.md` (Spesifikasi pemicu min/max & alokasi replenishment).
- [ ] 0.14 Buat file `docs/13_RECEIVING_PUTAWAY_SPEC.md` (Spesifikasi receiving PO/ASN, QC inspection & putaway rules).
- [ ] 0.15 Buat file `docs/14_BIN_TO_BIN_SPEC.md` (Spesifikasi pergerakan bin-to-bin & validasi kapasitas).
- [ ] 0.16 Buat file `docs/15_AGING_SPEC.md` (Spesifikasi kalkulasi umur material & dynamic aging buckets).
- [ ] 0.17 Buat file `docs/16_EXCEPTION_MANAGEMENT.md` (Spesifikasi penanganan wrong location, missing, unexpected stock).
- [ ] 0.18 Buat file `docs/17_TRACEABILITY_SPEC.md` (Spesifikasi graph pergerakan material & root cause matrix).
- [ ] 0.19 Buat file `docs/18_REPORTING_KPI_SPEC.md` (Spesifikasi KPI operasional, formula akurasi & control tower).
- [ ] 0.20 Buat file `docs/20_AUDIT_LOG_SPEC.md` (Spesifikasi audit logging & snapshot capture).
- [ ] 0.21 Buat file `docs/19_ROLE_PERMISSION_SPEC.md` (Matriks RBAC & granular permission keys).
- [ ] 0.22 Buat file `docs/21_API_SPEC.md` (Spesifikasi kontrak REST API lengkap).
- [ ] 0.23 Buat file `docs/22_DATABASE_SCHEMA.md` (DDL SQL, skema ERD, constraint & indeks).
- [ ] 0.24 Buat file `docs/23_EVENT_MODEL.md` (Katalog 16 domain events & skema payload).
- [ ] 0.25 Buat file `docs/24_OFFLINE_SYNC_SPEC.md` (Spesifikasi sync queue PDA & resolusi `SYNC_CONFLICT`).
- [ ] 0.26 Buat file `docs/25_SECURITY_SPEC.md` (Spesifikasi otentikasi JWT, session & device security).
- [ ] 0.27 Buat file `docs/26_VALIDATION_RULES.md` (Matriks aturan validasi master data & transaksi).
- [ ] 0.28 Buat file `docs/27_TEST_STRATEGY.md` (Rencana pengujian Unit, Integration, API, Offline & Performance).
- [ ] 0.29 Buat file `docs/28_ACCEPTANCE_CRITERIA.md` (Skenario pengujian BDD Given/When/Then).
- [ ] 0.30 Buat file `docs/29_DEPLOYMENT_SPEC.md` (Spesifikasi Docker build, envvars & CI/CD).
- [ ] 0.31 Buat file `docs/30_GLOSSARY.md` (Kamus istilah WMS & Digital Twin).
- [ ] 0.32 Buat file `README.md` & `CHANGELOG.md`.
- [ ] 0.33 Buat file `REQUIREMENT_GAP_ANALYSIS.md`, `BUSINESS_DECISIONS.md`, dan `REQUIREMENT_COVERAGE_MATRIX.md`.

---

## PHASE 1: SYSTEM CORE & SHARED ARCHITECTURE
- [ ] 1.1 Inisialisasi struktur project Modular Monolith (Backend Service API & Web Frontend).
- [ ] 1.2 Setup utilitas Logging, Correlation ID Middleware, & Standard Error Responder (menggunakan pesan ramah operasional).
- [ ] 1.3 Implementasi sistem otentikasi JWT / Session & Device Registry (`device_id`, `pda_mac`, `user_id`).
- [ ] 1.4 Implementasi Middleware Role-Based Access Control (RBAC) dengan granular permission checker.

---

## PHASE 2: DATABASE SCHEMA & MASTER DATA MODULES
- [ ] 2.1 Buat migrasi DDL database untuk 5 Kelompok Master Data:
  - Physical Warehouse (`warehouses`, `zones`, `areas`, `lanes`, `lines`, `racks`, `levels`, `bins`, `storage_types`, `staging_areas`, `quarantine_areas`, `docks`, `doors`, `aisles`, `floors`, `rooms`, `temp_zones`, `hazard_zones`).
  - Inventory Master (`materials`, `material_categories`, `material_groups`, `material_types`, `batches`, `mids`, `pallets`, `containers`, `uoms`, `uom_conversions`, `packaging_configs`, `dimensions`).
  - Operation Master (`rules_putaway`, `rules_picking`, `rules_replenishment`, `rules_cycle_count`, `rules_aging`, `rules_tolerance`, `rules_approval`, `rules_exception`).
  - Security Master (`users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `departments`, `warehouse_assignments`, `devices`, `sessions`).
  - 3D Master (`layout3d_objects`, `layout3d_templates`, `layout3d_versions`, `camera_presets`, `view_layers`, `display_rules`).
- [ ] 2.2 Buat API CRUD untuk seluruh Master Data dengan fitur List, Search, Filter, Sort, Soft-Delete (`ACTIVE`/`INACTIVE`/`ARCHIVED`), Import/Export CSV/Excel dengan Staging Validation Table.
- [ ] 2.3 Buat Seeder Data (*Seed Data*) realitis (1 Warehouse, 3 Zones, Racks, Bins, Materials, Batches, MIDs, Pallets).

---

## PHASE 3: DYNAMIC LOCATION HIERARCHY ENGINE
- [ ] 3.1 Implementasi model hirarki lokasi rekursif (`parent_location_id`).
- [ ] 3.2 Implementasi API pembacaan struktur lokasi (Tree view & path lookup).
- [ ] 3.3 Buat generator Barcode & QR Code otomatis untuk setiap level lokasi (Bin, Rack, Zone).
- [ ] 3.4 Implementasi validasi atribut lokasi (Kapasitas berat, volume, jenis penyimpanan, status aktif).

---

## PHASE 4: INVENTORY STATE ENGINE
- [ ] 4.1 Buat tabel `inventory_balances` (Current Stock State) yang memuat `material_id`, `batch_id`, `mid_code`, `pallet_id`, `location_id`, `quantity`, `uom_id`, `status`.
- [ ] 4.2 Implementasi State Machine Transisi Status Inventaris (`AVAILABLE`, `BLOCKED`, `QUARANTINE`, `DAMAGED`, `EXPIRED`, `HOLD`, `ALLOCATED`, `PICKED`, `STAGED`, `IN_TRANSIT`, `UNKNOWN`).
- [ ] 4.3 Implementasi API pencarian stok berdasarkan MID, Material, Batch, Palet, dan Lokasi.

---

## PHASE 5: IMMUTABLE TRANSACTION ENGINE & EVENT BUS
- [ ] 5.1 Buat tabel `inventory_transactions` (**Append-Only Ledger**, Dilarang UPDATE/DELETE).
- [ ] 5.2 Implementasi Transaction Engine untuk 16 jenis transaksi: `RECEIVING`, `PUTAWAY`, `PICKING`, `BATCHING`, `REPLENISHMENT`, `BIN_TO_BIN`, `TRANSFER`, `RETURN`, `ADJUSTMENT`, `CYCLE_COUNT`, `STAGED`, `DISPATCH`, `HOLD`, `RELEASE`, `DAMAGE`, `SCRAP`.
- [ ] 5.3 Implementasi Jurnal Pembalik / Transaksi Penyesuaian untuk koreksi transaksi lama.
- [ ] 5.4 Implementasi Event Bus internal untuk memublikasikan 16 Domain Events (`InventoryMoved`, `CycleCountStarted`, dll).

---

## PHASE 6: BLIND CYCLE COUNT CORE ENGINE & RECONCILIATION
- [ ] 6.1 Implementasi pembuatan Order & Task Cycle Count dalam 11 Mode Hitung (Rack, Zone, Area, Bin, MID, Pallet, Material, Batch, dll).
- [ ] 6.2 Implementasi pembuatan `Inventory Snapshot` otomatis pada detik permulaan Cycle Count.
- [ ] 6.3 Implementasi penguncian informasi pada API Blind Counter: Mutlak menyembunyikan *System Quantity*, *Expected Quantity*, *Variance*, dan *Previous Count*.
- [ ] 6.4 Implementasi event listener `COUNT_IMPACT_EVENT` saat terjadi pergerakan stok (Picking/Putaway) di lokasi yang sedang dihitung pada gudang LIVE.
- [ ] 6.5 Implementasi Engine Rekonsiliasi Dinamis (Menghitung ekspektasi stok berdasarkan Snapshot + Impact Events).
- [ ] 6.6 Implementasi alokasi Tugas Recount Independen (Counter B) yang bersifat imutabel.
- [ ] 6.7 Implementasi Workflow Approval penyesuaian stok bertingkat berdasarkan toleransi selisih.

---

## PHASE 7: PDA MOBILE INTERFACE & OFFLINE SYNC
- [ ] 7.1 Buat UI Web Responsive / PWA khusus PDA Scanner dengan komponen layar sentuh besar dan input ramah sarung tangan.
- [ ] 7.2 Implementasi fitur Scan Barcode & Manual Data Entry (Wajib mencatat flag `SCAN` vs `MANUAL`).
- [ ] 7.3 Implementasi Layar Blind Counter PDA (Tanpa System Qty, Tanpa Variance, Tombol Confirm & Location Empty).
- [ ] 7.4 Implementasi Local SQLite / IndexedDB Queue pada PDA untuk pengoperasian offline.
- [ ] 7.5 Implementasi Sync Queue Engine & Deteksi Konflik Sinkronisasi (`SYNC_CONFLICT`) dengan antarmuka resolusi konflik untuk Supervisor.

---

## PHASE 8: 3D DIGITAL TWIN ENGINE (THREE.JS)
- [ ] 8.1 Setup Canvas Three.js WebGL rendering engine dengan dukungan Orbit, Pan, Zoom, Perspective & Orthographic view.
- [ ] 8.2 Implementasi Pemetaan Direct 1-to-1 antara objek 3D (`OBJ-RACK-A01`) dan entitas database (`RACK-A01`).
- [ ] 8.3 Implementasi optimasi rendering menggunakan `InstancedMesh`, Frustum Culling, dan LOD untuk ribuan bin.
- [ ] 8.4 Implementasi 3D Camera Presets (Top View, Front View, Side View, Custom Presets).

---

## PHASE 9: 3D LAYOUT DESIGNER & PARAMETRIC GENERATOR
- [ ] 9.1 Buat Parametric Rack Generator Engine (Input: Width, Depth, Height, Levels, Bins/Level $\rightarrow$ Generasi otomatis struktur 3D & Barcode Bins).
- [ ] 9.2 Implementasi Mode Designer 3D: Add Rack, Bin, Zone, Aisle, Wall, Door, Dock, Column.
- [ ] 9.3 Implementasi Transform Controls (Gizmo Move, Rotate, Scale, Snap to Grid, Snap to Object, Group/Ungroup, Align, Distribute).
- [ ] 9.4 Buat Panel Properti Numerik (Posisi X/Y/Z, Rotasi X/Y/Z, Dimensi P/L/T).
- [ ] 9.5 Implementasi Siklus Layout Versioning (`DRAFT`, `PUBLISHED`, `ARCHIVED`).

---

## PHASE 10: PICKING MODULE
- [ ] 10.1 Implementasi Alokasi Stok Otomatis berdasarkan strategi FIFO / FEFO.
- [ ] 10.2 Buat alur pembuatan Pick List & optimasi urutan rute pengambilan barang (*Pick Route*).
- [ ] 10.3 Buat UI PDA Execution Picking & Konfirmasi Scan Bin / Material.

---

## PHASE 11: REPLENISHMENT MODULE
- [ ] 11.1 Implementasi Engine Pemicu Replenishment (Berdasarkan batas Min/Max bin picking atau Demand Order).
- [ ] 11.2 Buat pembuatan otomatis Replenishment Task dari Bulk Storage ke Picking Area.
- [ ] 11.3 Buat UI PDA Konfirmasi Pemindahan Replenishment.

---

## PHASE 12: BIN-TO-BIN MOVEMENT ENGINE
- [ ] 12.1 Implementasi API & UI Bin-to-Bin Transfer.
- [ ] 12.2 Buat validasi kompatibilitas material-lokasi & batas kapasitas bin tujuan.
- [ ] 12.3 Catat transaksi `BIN_TO_BIN` lengkap dengan otorisasi operator & alasan perpindahan.

---

## PHASE 13: RECEIVING & PUTAWAY WORKFLOW
- [ ] 13.1 Buat modul verifikasi Inbound PO / ASN & pencatatan Receiving fisik di Inbound Dock.
- [ ] 13.2 Buat modul Quality Control Inspection (Passing to `AVAILABLE` or Quarantine to `QUARANTINE`).
- [ ] 13.3 Implementasi Putaway Suggestion Engine & eksekusi Putaway via PDA.

---

## PHASE 14: BATCHING MODULE
- [ ] 14.1 Implementasi modul pembuatan Batch Material & asosiasi dengan Work Order Produksi.
- [ ] 14.2 Buat tracking status batch material (Preparation, Mixed, Released to Production).

---

## PHASE 15: DYNAMIC AGING ENGINE
- [ ] 15.1 Buat modul kalkulasi umur material berdasarkan tanggal penerimaan / pembuatan.
- [ ] 15.2 Buat pengelompokan Dynamic Aging Buckets (0-30, 31-60, 61-90, 91-180, 180+ hari).
- [ ] 15.3 Buat pemicu peringatan stok mendekati kedaluwarsa (*Near Expiry*) & *Dead Stock*.

---

## PHASE 16: EXCEPTION ENGINE & TRACEABILITY GRAPH
- [ ] 16.1 Implementasi penanganan Exception: `WRONG_LOCATION`, `MISSING_PENDING_RECOUNT`, `UNEXPECTED_MATERIAL`, `DAMAGED_STOCK`.
- [ ] 16.2 Implementasi Klasifikasi Wrong Location (Wrong Warehouse/Zone/Area/Lane/Line/Rack/Level/Bin).
- [ ] 16.3 Implementasi Node Graph Traceability (Pergerakan fisik material dari awal hingga akhir beserta operator, timestamp, dan alasan).

---

## PHASE 17: CONTROL TOWER REPORTING, KPI & 3D HEATMAPS
- [ ] 17.1 Buat Dashboard KPI Real-Time: Inventory Accuracy %, Location Accuracy %, Quantity Accuracy %, SO Completion %, Wrong Location %, Recount %.
- [ ] 17.2 Implementasi 10 Visualisation Layers pada 3D canvas (Inventory, SO Progress, Aging, Capacity, Exceptions, dll).
- [ ] 17.3 Implementasi Skema Warna Heatmap 3D (Green, Yellow, Orange, Red, Purple, Blue).
- [ ] 17.4 Buat fitur 3D Click-Through & 3D Search (Search MID/Material $\rightarrow$ Fly camera & Highlight object).

---

## PHASE 18: SYSTEM OPTIMIZATION, AUDIT & DEPLOYMENT
- [ ] 18.1 Jalankan skrip Audit Compliance `checker_agent.py` untuk menguji ketercakapan 100% requirement.
- [ ] 18.2 Jalankan Load Testing & Optimasi Indeks Database untuk pencarian cepat.
- [ ] 18.3 Siapkan Docker Compose / Kubernetes deployment spec & dokumentasikan panduan rilis produksi.
