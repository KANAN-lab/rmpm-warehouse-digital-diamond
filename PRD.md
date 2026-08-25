# PRODUCT REQUIREMENT DOCUMENT (PRD)

# RMPM WAREHOUSE DIGITAL TWIN & CONTROL TOWER

---

## 1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW

### 1.1 Visi Sistem
Sistem **RMPM Warehouse Digital Twin & Control Tower** dirancang sebagai platform manajemen gudang modern tingkat enterprise untuk *Raw Materials & Packaging Materials* (RMPM). Sistem ini menggabungkan fondasi Master Data yang ketat, Ledger Transaksi Imutabel (*event ledger*), akurasi stok berbasis *Blind Cycle Count*, modul operasional gudang lengkap (Receiving, Putaway, Picking, Batching, Replenishment, Bin-to-Bin, Aging), serta visualisasi interaktif 3D (*Digital Twin*) dan *PDA / Mobile Data Collection*.

### 1.2 Tujuan Utama
1. **Accuracy-First**: Menjamin akurasi lokasi dan jumlah fisik bahan baku/kemasan dengan metode Blind Stock Opname.
2. **Visual Operational Control**: Menghadirkan visualisasi 3D real-time yang bertindak sebagai antarmuka operasional visual (bukan sekadar dekorasi).
3. **Flexible & No Hard-Coding**: Memungkinkan modifikasi struktur hirarki lokasi gudang, jenis rak, aturan bisnis, dan tata letak 3D langsung dari aplikasi tanpa mengubah source code.
4. **Full Traceability & Auditability**: Mencatat setiap pergerakan barang, pengguna, perangkat, dan perubahan data dengan jejak audit yang tidak dapat diubah (*immutable ledger*).
5. **PDA & Offline Resilience**: Mendukung operasi pergudangan di lapangan menggunakan PDA scanner dengan kemampuan bertahan dalam kondisi *intermittent network* melalui mekanisme rekonsiliasi konflik sinkronisasi (`SYNC_CONFLICT`).

---

## 2. NON-NEGOTIABLE CORE PRINCIPLES

Sistem harus secara mutlak mematuhi 20 Prinsip Utama berikut:

1. **Master Data sebagai Fondasi**: Seluruh entitas fisik, inventaris, aturan operasional, dan keamanan bertumpu pada Master Data yang tervalidasi.
2. **Pemisahan Master Data & Data Transaksi**: Data induk terpisah secara eksplisit dari ledger transaksi dan status inventaris berjalan.
3. **Derivasi Status Inventaris Berjalan**: Status dan jumlah stok saat ini diturunkan/dipelihara hanya dari transaksi yang valid.
4. **Visualisasi 3D Bukan Source of Truth**: *Source of truth* utama adalah **Database + Master Data + Ledger Transaksi**. Three.js/WebGL hanyalah *layer visualisasi dan interaksi*.
5. **Struktur Gudang 100% Dinamis**: Tidak boleh ada *hard-coded warehouse structure*, jenis rak, nama bin, atau batas area.
6. **Built-in 3D Warehouse Layout Designer**: Pengguna dapat membuat dan mengubah layout gudang 3D langsung di dalam aplikasi web tanpa software CAD pihak ketiga.
7. **Bebas Ketergantungan Software External CAD**: Seluruh pembuatan bentuk rak, bin, lorong, dan pembatas dibuat parametrik di dalam sistem.
8. **Blind Cycle Count sebagai Modul Core**: Blind Stock Opname bukan fitur opsional, melainkan mesin penjamin akurasi stok utama WMS.
9. **Counter Layar Blind Mutlak**: Petugas penghitung (*counter*) **TIDAK BOLEH** melihat *system quantity*, *expected quantity*, *variance*, atau riwayat hitung sebelumnya saat melakukan pencatatan fisik.
10. **100% Count Completion != 100% Inventory Accuracy**: Persentase penyelesaian hitung menunjukkan ketercakapan target hitung, bukan kebenaran kuantitas stok.
11. **Traceability Salah Lokasi (*Wrong Location*)**: Setiap temuan barang di lokasi yang salah wajib dapat ditelusuri riwayat pergerakan terakhirnya.
12. **Jejak Audit (Audit Trail) Mutlak**: Setiap pergerakan stok, pengubahan master data, dan keputusan persetujuan harus tercatat lengkap.
13. **Riwayat Hitung Imutabel**: Hasil hitung sebelumnya tidak boleh ditimpa (*overwritten*). Setiap hitung ulang (*recount*) menghasilkan record baru.
14. **Hitung Ulang (Recount) Tetap Blind**: Petugas recount (Counter B) tidak boleh melihat hasil hitung Counter A maupun jumlah sistem.
15. **Operasi Gudang Tetap Live Selama Cycle Count**: Gudang dapat tetap melayani proses Picking, Putaway, dan Bin-to-Bin tanpa perlu *warehouse-wide shutdown*, kecuali jika diatur khusus (*controlled freeze*).
16. **Deteksi Pergerakan Saat Stock Opname**: Pergerakan stok pada lokasi yang sedang dihitung harus memicu event `COUNT_IMPACT_EVENT` untuk rekonsiliasi dinamis.
17. **Workflow Approval untuk Penyesuaian Stok**: Tidak boleh ada *automatic inventory adjustment* tanpa persetujuan (*approval workflow*) bertingkat sesuai konfigurasi toleransi.
18. **Aturan Bisnis Configurable**: Batas toleransi, aturan FIFO/FEFO, min/max replenishment, dan rute picking dapat diubah lewat admin UI.
19. **Auditable System Actions**: Seluruh aksi sistem yang krusial memuat *Correlation ID*, *User ID*, *Device ID*, *Timestamp*, *Before/After State*.
20. **Arsitektur Modular Monolith**: Mengutamakan arsitektur *Modular Monolith* yang bersih dan *scalable* sebelum mempertimbangkan *microservices*.

---

## 3. REQUIRED OUTPUT DOCUMENTATION SPECIFICATION

Sebelum tahap pengembangan kode aplikasi dimulai, 30 dokumen arsitektur dan spesifikasi teknis berikut wajib dibuat di folder `/docs/`:

1. `01_SYSTEM_ARCHITECTURE.md`: Arsitektur modular monolith, layer visualisasi, API, dan integrasi database.
2. `02_MASTER_DATA_SPEC.md`: Spesifikasi entitas master data (Physical, Inventory, Operation, Security, 3D).
3. `03_LOCATION_HIERARCHY.md`: Model hirarki lokasi dinamis dan aturan validasi koordinat.
4. `04_INVENTORY_MODEL.md`: Struktur entitas inventaris (Material, Batch, Pallet, MID, Status).
5. `05_TRANSACTION_MODEL.md`: Model ledger transaksi imutabel dan status pergerakan.
6. `06_BLIND_CYCLE_COUNT_SPEC.md`: Aturan bisnis Blind SO, snapshot, rekonsiliasi, dan recount.
7. `07_PDA_WORKFLOW.md`: Workflow antarmuka PDA mobile, mode scan/manual, dan offline storage.
8. `08_3D_DIGITAL_TWIN_SPEC.md`: Integrasi Three.js, mapping 3D ke database entity, rendering instancing.
9. `09_3D_LAYOUT_EDITOR_SPEC.md`: Fitur 3D Designer, kontrol transformasi, snap/grid, dan versi layout.
10. `10_PICKING_SPEC.md`: Strategi picking (FIFO/FEFO), alokasi order, dan konfirmasi PDA.
11. `11_BATCHING_SPEC.md`: Pembuatan batch material, integrasi produksi, dan tracking status.
12. `12_REPLENISHMENT_SPEC.md`: Triggers replenishment (Min/Max, Demand), pembuatan task, dan eksekusi.
13. `13_RECEIVING_PUTAWAY_SPEC.md`: Alur verifikasi PO/ASN, inspeksi QC, dan penetapan lokasi putaway.
14. `14_BIN_TO_BIN_SPEC.md`: Aturan pemindahan barang antar bin, validasi kapasitas, dan otorisasi.
15. `15_AGING_SPEC.md`: Perhitungan umur stok, bucket aging dinamis, dan peringatan stok kedaluwarsa.
16. `16_EXCEPTION_MANAGEMENT.md`: Handling Wrong Location, Missing Stock, Unexpected Stock, dan Damage.
17. `17_TRACEABILITY_SPEC.md`: Graph pergerakan material, pemetaan jalur lokasi, dan analisis akar masalah.
18. `18_REPORTING_KPI_SPEC.md`: Definisi KPI operasional, formula akurasi, dan dashboard kontrol tower.
19. `19_ROLE_PERMISSION_SPEC.md`: Matriks RBAC, daftar role, dan granular permission keys.
20. `20_AUDIT_LOG_SPEC.md`: Skema log audit, capture snapshot perubahan data, dan kebijakan retensi.
21. `21_API_SPEC.md`: Kontrak REST API lengkap (Request/Response payload, HTTP status, Auth).
22. `22_DATABASE_SCHEMA.md`: ERD lengkap, spesifikasi tabel, DDL SQL, constraint, dan indeks.
23. `23_EVENT_MODEL.md`: Katalog 16 domain events, payload schema, dan mekanisme pub/sub.
24. `24_OFFLINE_SYNC_SPEC.md`: Mekanisme sync queue PDA, validasi dua arah, dan resolusi conflict.
25. `25_SECURITY_SPEC.md`: Kebijakan otentikasi JWT/Session, enkripsi data, dan device binding.
26. `26_VALIDATION_RULES.md`: Matriks validasi master data, transaksi, dan aturan lokasi.
27. `27_TEST_STRATEGY.md`: Strategi Unit Test, Integration, API, Performance, Offline Sync, dan Acceptance.
28. `28_ACCEPTANCE_CRITERIA.md`: Skenario acceptance test format BDD (Given / When / Then).
29. `29_DEPLOYMENT_SPEC.md`: Spesifikasi environment (Dev, Staging, Prod), Docker build, dan CI/CD.
30. `30_GLOSSARY.md`: Kamus istilah WMS (MID, Bin, Cycle Count, Staging, Dynamic Hierarchy, dll).

Dokumen Tambahan Wajib:
- `README.md`: Dokumentasi utama repositori.
- `CHANGELOG.md`: Catatan versi & riwayat perubahan.
- `REQUIREMENT_GAP_ANALYSIS.md`: Analisis requirement & identifikasi keputusan bisnis.
- `BUSINESS_DECISIONS.md`: Log keputusan bisnis pengganti asumsi implisit.
- `REQUIREMENT_COVERAGE_MATRIX.md`: Matriks pemetaan requirement vs implementasi.

---

## 4. MASTER DATA ARCHITECTURE (5 GROUPS)

Master Data dikelompokkan ke dalam 5 kategori utama dengan dukungan *Active/Inactive/Archived status*, audit trail pembuatan/perubahan, dan pencegahan *hard deletion*:

```
+-----------------------------------------------------------------------------------+
|                            MASTER DATA ARCHITECTURE                               |
+------------------+------------------+------------------+------------------+-------+
| A. PHYSICAL WAREHOUSE| B. INVENTORY MASTER| C. OPERATION MASTER| D. SECURITY MASTER| E. 3D DIGITAL TWIN|
+------------------+------------------+------------------+------------------+-------+
| - Warehouse      | - Material       | - Putaway Rule   | - User           | - 3D Object       |
| - Zone           | - Category       | - Picking Rule   | - Role           | - Object Type     |
| - Area           | - Material Group | - Replenish Rule | - Permission     | - Object Template |
| - Lane / Line    | - Material Type  | - CycleCount Rule| - Department     | - Rack Template   |
| - Aisle / Rack   | - Batch          | - Aging Rule     | - Whse Assignment| - Bin Template    |
| - Level / Bin    | - MID            | - FIFO/FEFO Rule | - Device / PDA   | - Layout Version  |
| - Storage Type   | - Pallet         | - Capacity Rule  | - Scanner        | - Pos/Rot/Scale   |
| - Staging Area   | - Container      | - Tolerance Rule | - Session        | - Camera Preset   |
| - Quarantine     | - UOM & Conv     | - Approval Rule  | - Auth Policy    | - Viz Layer & Theme|
| - Dock / Door    | - Dimensions/W/V | - Exception Rule |                  |                   |
| - Temp/Hazard Zone| - Expiry Rule   |                  |                  |                   |
+------------------+------------------+------------------+------------------+-------+
```

---

## 5. LOCATION HIERARCHY & ACCURACY ENGINE

### 5.1 Dynamic Location Hierarchy
Sistem tidak mendefinisikan hirarki lokasi secara statis. Setiap lokasi memiliki *parent location ID*, *location type*, dan atribut fisik:

$$\text{Warehouse} \rightarrow \text{Zone} \rightarrow \text{Area} \rightarrow \text{Lane / Line} \rightarrow \text{Aisle} \rightarrow \text{Rack} \rightarrow \text{Level} \rightarrow \text{Bin}$$

Setiap record lokasi wajib memiliki:
- `id` (UUID), `code` (Unique), `name`, `barcode`, `qr_code`.
- `parent_location_id`, `location_type_id`.
- `max_weight`, `max_volume`, `max_pallet_capacity`.
- `status` (`ACTIVE`, `INACTIVE`, `BLOCKED`, `MAINTENANCE`).
- `x_pos`, `y_pos`, `z_pos` (Koordinat dunia nyata & 3D).
- `three_object_id` (Referensi ke entitas 3D).

### 5.2 Location Accuracy Classification
Apabila fisik material ditemukan di luar lokasi yang tercatat di database, sistem mengklasifikasikan tingkat kesalahan lokasi (*Wrong Location Breakdown*):
- `WRONG_WAREHOUSE`
- `WRONG_ZONE`
- `WRONG_AREA`
- `WRONG_LANE` / `WRONG_LINE`
- `WRONG_AISLE`
- `WRONG_RACK`
- `WRONG_LEVEL`
- `WRONG_BIN`

---

## 6. 3D DIGITAL TWIN & 3D LAYOUT DESIGNER

### 6.1 Rendering Engine (Three.js)
- **Direct Mapping**: Setiap objek 3D terhubung 1-to-1 dengan ID entitas database (`OBJ-RACK-A01` $\leftrightarrow$ `RACK-A01`). Tidak diperbolehkan adanya objek 3D *orphan* tanpa bisnis ID.
- **Parametric Rack Generator**: Generator otomatis untuk membangun rak berdasarkan parameter: `width`, `depth`, `height`, `levels_count`, `bins_per_level`. Sistem secara otomatis meng-generate atribut koordinat 3D, struktur hirarki bin, dan ID barcode untuk setiap bin.
- **Optimasi Performa**: Menggunakan `InstancedMesh`, Frustum Culling, Level of Detail (LOD), dan *lazy loading* untuk mampu merender puluhan ribu bin dan palet tanpa *frame drop* (< 60 FPS target).

### 6.2 Mode Layout Designer
Menyediakan antarmuka editor visual interaktif 3D di browser:
- **Tools**: Add Warehouse, Add Zone, Add Rack, Add Bin, Add Aisle, Add Staging, Add Wall, Add Door, Add Dock, Add Column.
- **Transform Control**: Gizmo Move, Rotate, Scale, Snap to Grid, Snap to Object, Duplicate, Group/Ungroup, Align, Distribute, Measure Tool.
- **Numeric Property Panel**: Pengisian angka presisi untuk Posisi X/Y/Z, Rotasi X/Y/Z, Dimensi P/L/T.
- **Layout Versioning**: Status Layout (`DRAFT`, `PUBLISHED`, `ARCHIVED`). Pengubahan layout tidak boleh menimpa layout produksi secara langsung tanpa melalui siklus publikasi versi.

---

## 7. INVENTORY MODEL & IMMUTABLE TRANSACTION LEDGER

### 7.1 Struktur Entitas Inventaris
$$Material \rightarrow Batch \rightarrow Pallet \rightarrow MID \rightarrow Location$$

Atribut inventaris: `material_id`, `batch_id`, `mid_code` (Material Identification Tag), `pallet_id`, `quantity`, `uom_id`, `location_id`, `status`, `manufacture_date`, `expiry_date`, `receipt_date`, `last_movement_at`, `quality_status`.

### 7.2 Configurable Inventory Statuses
`AVAILABLE`, `BLOCKED`, `QUARANTINE`, `DAMAGED`, `EXPIRED`, `HOLD`, `ALLOCATED`, `PICKED`, `STAGED`, `IN_TRANSIT`, `UNKNOWN`.

### 7.3 Ledger Transaksi Imutabel (16 Tipe Transaksi)
Setiap pergerakan dan penyesuaian stok dicatat dalam tabel `inventory_transactions` yang bersifat **APPEND-ONLY** (Dilarang melakukan `UPDATE` atau `DELETE` pada riwayat transaksi):

Types: `RECEIVING`, `PUTAWAY`, `PICKING`, `BATCHING`, `REPLENISHMENT`, `BIN_TO_BIN`, `TRANSFER`, `RETURN`, `ADJUSTMENT`, `CYCLE_COUNT`, `STAGED`, `DISPATCH`, `HOLD`, `RELEASE`, `DAMAGE`, `SCRAP`.

Setiap record transaksi memuat: `transaction_id`, `transaction_type`, `source_location_id`, `destination_location_id`, `material_id`, `batch_id`, `mid_code`, `pallet_id`, `quantity`, `uom_id`, `operator_id`, `device_id`, `timestamp`, `reference_doc`, `reason_code`, `status`, `correlation_id`, `previous_state`, `new_state`.

Koreksi kesalahan transaksi dilakukan dengan membuat **Koreksi Transaksi Baru** (Jurnal pembalik / transaksi penyesuaian), bukan mengedit baris transaksi lama.

---

## 8. BLIND CYCLE COUNT ENGINE & PDA WORKFLOW

### 8.1 Blind Count Guarantees (Mutlak)
- **Layar Blind Counter**: Antarmuka PDA/Mobile tempat counter memasukkan hasil hitung **SAMA SEKALI TIDAK MENAMPILKAN**:
  - *System Quantity*
  - *Expected Quantity*
  - *Variance / Selisih*
  - *Previous Count / Hasil Hitung Sebelum/Counter Lain*
- Petugas counter hanya melihat informasi target: Lokasi, Material (jika ditentukan), barcode input, serta kolom pengisian jumlah fisik (*Physical Qty Entry*) dan UOM.

```
+---------------------------------------------------+
|               PDA BLIND CYCLE COUNT               |
+---------------------------------------------------+
| TASK ID: CC-20260825-00001                        |
| LOCATION: A01-R03-L02-B04                         |
| STATUS: IN_PROGRESS                               |
+---------------------------------------------------+
| SCAN / INPUT MATERIAL / MID:                      |
| [ MID-2026-994821                        ] [SCAN] |
|                                                   |
| BATCH NUMBER:                                     |
| [ BATCH-RM-88421                         ]        |
|                                                   |
| PHYSICAL QUANTITY ENTRY:                          |
| [ 980.00                                 ]        |
|                                                   |
| UOM:                                              |
| [ KG                                   v ]        |
+---------------------------------------------------+
| [ CONFIRM ENTRY ]           [ MARK LOCATION EMPTY ]|
+---------------------------------------------------+
| NOTE: SYSTEM QTY IS HIDDEN FOR AUDIT ACCURACY     |
+---------------------------------------------------+
```

### 8.2 Cycle Count Modes & Target States
- **11 Mode Selection**: Rack Mode, Zone Mode, Area Mode, Lane Mode, Line Mode, Bin Mode, Level Mode, MID Mode, Pallet Mode, Material Mode, Batch Mode.
- **Target States**: `NOT_STARTED`, `IN_PROGRESS`, `COUNTED`, `RECOUNT_REQUIRED`, `VERIFIED`, `COMPLETED`, `SKIPPED`, `INVALID`. *(Catatan: `SKIPPED` tidak sama dengan `COMPLETED`)*.
- **Completion Rate Formula**:
$$\text{Completion \%} = \left( \frac{\text{Completed Targets}}{\text{Total Required Targets}} \right) \times 100$$
*(Perhatian: 100% Completion tidak berarti 100% Accuracy).*

### 8.3 Live Operation & Movement Handling During Count
- Gudang tetap beroperasi (*LIVE*) saat proses Cycle Count berlangsung.
- Jika terjadi pergerakan stok pada lokasi yang sedang dihitung (misal ada transaksi Picking/Putaway saat tugas SO berjalan), sistem memicu **`COUNT_IMPACT_EVENT`** yang mencatat `cycle_count_id`, `location_id`, `movement_id`, `quantity`, `operator_id`, `timestamp`.
- **Rekonsiliasi Dinamis**: Mesin rekonsiliasi mengkalkulasi ulang jumlah sistem *pada saat detik fisik dihitung* (*Count Snapshot*) ditambah/dikurangi dampak transaksi pergerakan berselang, sehingga tidak menghasilkan *false variance*.

### 8.4 Recount Independen & Exception Handling
- **Recount (Counter B)**: Tugas hitung ulang dialokasikan secara independen. Counter B tidak dapat melihat hasil input Counter A. Kedua record hitung tersimpan imutabel di riwayat.
- **Empty Location Confirmation**: Fitur khusus untuk mengonfirmasi bin dalam keadaan kosong secara fisik (`LOCATION_EMPTY`).
- **Unexpected Material**: Pencatatan fisik jika ditemukan barang yang tidak terdaftar di lokasi tersebut tanpa menolak pengamatan fisik.
- **Missing Material**: Stok yang terdaftar tetapi tidak ditemukan fisik dimasukkan ke status `MISSING_PENDING_RECOUNT` (tidak langsung mengurangi stok database).

---

## 9. TRACEABILITY, MOVEMENT GRAPH & ROOT CAUSE ANALYSIS

### 9.1 Graph Pergerakan Material
Sistem menyediakan *Timeline Graph* pergerakan stok yang menjawab pertanyaan audit:
- Di mana posisi barang sekarang?
- Di mana lokasi yang seharusnya?
- Di mana lokasi sebelumnya?
- Kapan barang berpindah?
- Siapa operator yang memindahkan?
- Transaksi mana yang menyebabkan perpindahan?
- Apa alasan perpindahan tersebut?

$$\text{Location A} \xrightarrow[\text{Op: User01}]{\text{Receiving}} \text{Staging Area} \xrightarrow[\text{Op: User02}]{\text{Putaway}} \text{Rack A01-L02-B01} \xrightarrow[\text{Op: User03}]{\text{Bin-to-Bin}} \text{Rack B02-L01-B03}$$

### 9.2 Klasifikasi Root Cause Wrong Location
Putaway Error, Picking Error, Replenishment Error, Bin-to-Bin Error, Return Process, Temporary Storage, Emergency Storage, Barcode Error, System Mapping Error, Operator Error, Unknown.

---

## 10. OPERATIONAL WAREHOUSE MODULES

1. **Receiving**: Verifikasi PO/ASN $\rightarrow$ Inbound Dock $\rightarrow$ Physical Receiving Scan $\rightarrow$ Quality Inspection $\rightarrow$ Staging Allocation.
2. **Putaway**: Penentuan lokasi tujuan berdasarkan aturan (*Putaway Rules*: Zone compatibility, weight/volume capacity) $\rightarrow$ PDA Putaway Task $\rightarrow$ Destination Bin Scan $\rightarrow$ Transaction Execution.
3. **Picking**: Order Demand $\rightarrow$ Stock Allocation (FIFO / FEFO) $\rightarrow$ Pick List Generation (Optimized Route) $\rightarrow$ PDA Pick Execution $\rightarrow$ Staging Area.
4. **Batching**: Pengelompokan pesanan/pencampuran lot material untuk keperluan produksi $\rightarrow$ Tracking status batching.
5. **Replenishment**: Pemicu stok minimum/maksimum di area picking $\rightarrow$ Automatic Replenishment Task $\rightarrow$ Transfer dari bulk storage ke picking bin.
6. **Bin-to-Bin**: Pemindahan stok antar bin secara ad-hoc atau terencana $\rightarrow$ Validasi kompatibilitas & kapasitas $\rightarrow$ Eksekusi pergerakan.
7. **Aging Engine**: Kalkulasi otomatis umur stok berdasarkan `receipt_date` / `manufacture_date`. Dynamic Aging Buckets (misal: 0-30 hari, 31-60 hari, 61-90 hari, 91-180 hari, 180+ hari, serta status *Near Expiry*, *Expired*, *Slow Moving*, *Dead Stock*).

---

## 11. 3D VISUALIZATION LAYERS, HEATMAPS & INTERACTION

### 11.1 Visualisation Layers
Pengguna Control Tower dapat mengaktifkan 10 layer visualisasi di atas canvas 3D:
1. Inventory Density Layer
2. Cycle Count Progress Layer
3. Aging & Expiry Layer
4. Capacity & Space Utilization Layer
5. Location Accuracy / Discrepancy Layer
6. Active Picking Activity Layer
7. Replenishment Activity Layer
8. Exception & Wrong Location Layer
9. Traffic & Movement Frequency Layer
10. Weight & Floor Load Layer

### 11.2 Configurable Heatmap Color Scheme
- **GREEN**: Normal / Correct Location / High Accuracy
- **YELLOW**: In Progress / Pending Count / Warning
- **ORANGE**: Variance Detected / Recount Needed
- **RED**: Wrong Location / Capacity Overflow / Expired
- **PURPLE**: Missing Stock / Critical Exception
- **BLUE**: Recount Task Assigned / In Inspection

### 11.3 3D Interaction, Search & Click-Through
- **Click-Through Hierarchy**: Klik Warehouse $\rightarrow$ Zone $\rightarrow$ Rack $\rightarrow$ Level $\rightarrow$ Bin $\rightarrow$ Detail MID & Material Info Panel.
- **3D Search & Auto-Focus**: Pencarian berdasarkan MID, Kode Material, Batch, Kode Bin, atau Nomor Palet secara otomatis menggerakkan kamera 3D (fly-to / smooth orbit), menyorot (*highlight*) objek 3D target, dan membuka modal detail operasional.

---

## 12. REST API, DOMAIN EVENTS, SECURITY (RBAC) & AUDIT LOGGING

### 12.1 REST API Standards
Seluruh API dibangun secara RESTful dengan respons JSON terstandar, otentikasi JWT, validasi skema payload, dan error code ramah pengguna operasional pergudangan:

```json
{
  "success": false,
  "error": {
    "code": "LOCATION_RACK_INACTIVE",
    "message": "Bin A01-R03-L02-B04 tidak dapat digunakan karena Rack A01-R03 dalam status Inactive.",
    "details": { "rack_id": "RACK-A01-R03", "status": "INACTIVE" }
  },
  "timestamp": "2026-08-25T16:13:05Z",
  "correlation_id": "req-9918234-abc"
}
```

### 12.2 Domain Event Catalog (16 Events Wajib)
`InventoryReceived`, `InventoryPutAway`, `InventoryPicked`, `InventoryBatched`, `InventoryReplenished`, `InventoryMoved`, `CycleCountStarted`, `CountRecorded`, `CountCompleted`, `RecountRequested`, `WrongLocationDetected`, `VarianceDetected`, `AdjustmentApproved`, `LayoutPublished`, `SyncConflictDetected`, `MasterDataUpdated`.

### 12.3 Role-Based Access Control (RBAC)
Role: `ADMIN`, `WAREHOUSE_MANAGER`, `SUPERVISOR`, `INVENTORY_CONTROLLER`, `COUNTER`, `PICKER`, `PUTAWAY_OPERATOR`, `REPLENISHMENT_OPERATOR`, `VIEWER`.

Granular Permissions (Contoh): `cycle_count.create`, `cycle_count.count`, `cycle_count.view_variance`, `cycle_count.approve`, `inventory.adjust`, `layout.edit`, `layout.publish`, `master_data.edit`.

---

## 13. DATABASE SCHEMA & INDEXING STRATEGY

### 13.1 Struktur Skema Database
Database memisahkan tabel secara eksplisit ke dalam 6 Logical Schema:
1. `master_*`: `master_warehouses`, `master_zones`, `master_racks`, `master_bins`, `master_materials`, `master_batches`, `master_mids`, `master_uoms`, `master_rules`, dll.
2. `inventory_*`: `inventory_balances` (Current State), `inventory_mids`, `inventory_pallets`.
3. `txn_*`: `inventory_transactions` (Immutable Ledger).
4. `cycle_count_*`: `cycle_count_orders`, `cycle_count_targets`, `cycle_count_entries`, `cycle_count_snapshots`, `cycle_count_impacts`.
5. `audit_*`: `audit_logs`, `system_event_logs`.
6. `layout3d_*`: `layout3d_objects`, `layout3d_versions`, `layout3d_templates`.

### 13.2 Indexing Mandatory Strategy
Wajib membuat indeks B-Tree & Composite Index pada kolom pencarian tinggi:
- `master_bins`: Index (`code`), Index (`barcode`), Index (`rack_id`).
- `master_mids`: Index (`mid_code`), Index (`material_id`), Index (`batch_id`).
- `inventory_balances`: Composite Index (`location_id`, `material_id`, `batch_id`), Index (`mid_code`).
- `inventory_transactions`: Index (`transaction_id`), Index (`timestamp`), Composite Index (`source_location_id`, `destination_location_id`), Index (`correlation_id`).
- `cycle_count_entries`: Index (`cycle_count_id`), Composite Index (`target_id`, `counter_id`).

---

## 14. OFFLINE PDA ARCHITECTURE & SYNC CONFLICT MANAGEMENT

```
+------------------+         +-------------------+         +------------------+
| PDA Local SQLite |  -----> | Sync Queue Engine |  -----> | REST Server API  |
+------------------+         +-------------------+         +------------------+
| - Local Tasks    |         | - Queue Tasks     |         | - Server Valid.  |
| - Local Counts   |         | - Retry Logic     |         | - DB Commit      |
| - Offline Rules  |         | - Conflict Check  |         | - Pub Domain Evt |
+------------------+         +-------------------+         +------------------+
                                       |
                                       v (Conflict Detected)
                             +-------------------+
                             |   SYNC_CONFLICT   |
                             | Workflow Approver |
                             +-------------------+
```

- **Offline Storage**: PDA menggunakan database SQLite lokal untuk menyimpan daftar tugas hitung dan antrean transaksi fisik.
- **Conflict Resolution (`SYNC_CONFLICT`)**: Jika PDA mencatat MID-001 berada di Lokasi A saat offline, tetapi Server telah memindahkan MID-001 ke Lokasi B sebelum PDA tersinkronisasi, sistem **TIDAK BOLEH** menimpa data server secara diam-diam. Sistem membuat record `SYNC_CONFLICT` yang memerlukan peninjauan supervisor pergudangan.

---

## 15. DATA GOVERNANCE & IMPORT/EXPORT RULES

- **Soft-Delete Only**: Seluruh tabel master menggunakan flag `status` (`ACTIVE`, `INACTIVE`, `ARCHIVED`). Dilarang keras melakukan `DELETE FROM master_*`.
- **Validation Engine Import**: Impor data via CSV/Excel wajib melalui *Staging Validation Table*. Menampilkan ringkasan sebelum komit: `Valid Rows`, `Invalid Rows`, `Duplicates`, `Warnings`, `Errors`.

---

## 16. ACCEPTANCE TEST SCENARIOS (BDD GIVEN / WHEN / THEN)

### Skenario 1: Blind Cycle Count Hiding System Quantity
- **GIVEN**: Bin `A01-R03-L02-B04` mencatat stok 1,000 KG Material RM001 di sistem.
- **WHEN**: Petugas Counter membuka tugas Blind Cycle Count di PDA untuk Bin `A01-R03-L02-B04`.
- **THEN**: Antarmuka PDA **TIDAK MENAMPILKAN** angka 1,000 KG maupun informasi variansi.
- **WHEN**: Petugas Counter menginputkan angka fisik 980 KG dan menekan tombol Confirm.
- **THEN**: Sistem menyimpan angka 980 KG ke dalam `cycle_count_entries` secara imutabel, dan variansi selisih 20 KG hanya dapat dilihat oleh Supervisor / Inventory Controller di Control Tower Dashboard.

### Skenario 2: Wrong Location Traceability
- **GIVEN**: MID-001 terdaftar di sistem berada pada Bin `A01-R03-L02-B04`.
- **WHEN**: Counter menemukan MID-001 secara fisik di Bin `B02-R01-L03-B02`.
- **THEN**: Counter menginput pengamatan lokasi fisik baru di PDA.
- **THEN**: Sistem membuat catatan `WRONG_LOCATION` dengan status `WRONG_ZONE`, serta secara otomatis menampilkan grafik penelusuran pergerakan (*Traceability Graph*) yang memuat lokasi terakhir yang benar, operator pemindah, dan transaksi terkait.

---

## 17. REVISED IMPLEMENTATION ROADMAP (PHASE 1 - 18)

- **Phase 1**: Architecture & Setup (/docs/ 30 files + Core Setup)
- **Phase 2**: Database Schema & Master Data Modules (5 Kelompok Master Data)
- **Phase 3**: Dynamic Location Hierarchy Engine
- **Phase 4**: Inventory State Engine & Status Transitions
- **Phase 5**: Immutable Transaction Ledger Engine & Domain Events
- **Phase 6**: Blind Cycle Count Core Engine & Reconciliation Logic
- **Phase 7**: PDA Mobile Interface & Scan/Manual Data Collection
- **Phase 8**: 3D Digital Twin Engine (Three.js & InstancedMesh)
- **Phase 9**: 3D Layout Designer & Parametric Rack Generator
- **Phase 10**: Picking Module & Order Allocation
- **Phase 11**: Replenishment Engine (Min/Max & Demand)
- **Phase 12**: Bin-to-Bin Movement Engine
- **Phase 13**: Receiving & Putaway Workflow Engine
- **Phase 14**: Batching Module & Production Association
- **Phase 15**: Dynamic Aging Engine & Expiry Tracking
- **Phase 16**: Exception Engine & Traceability Graph Node
- **Phase 17**: Control Tower Dashboard, KPI & 3D Heatmaps
- **Phase 18**: Optimization, Load Testing & Production Deployment
