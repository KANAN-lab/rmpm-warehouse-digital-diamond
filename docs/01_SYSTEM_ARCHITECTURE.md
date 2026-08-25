# 01_SYSTEM_ARCHITECTURE.md

# ARSITEKTUR SISTEM RMPM WAREHOUSE DIGITAL TWIN & CONTROL TOWER

---

## 1. DESAIN ARSITEKTUR UTAMA (MODULAR MONOLITH)

Sistem dirancang mengadopsi pola **Modular Monolith enterprise**. Pendekatan ini dipilih untuk menjaga batas-batas modul (*domain boundaries*) yang sangat tegas namun menghindari overhead kompleksitas jaringan, latency inter-service, dan beban operasional infrastruktur microservices pada tahap awal.

```
+-----------------------------------------------------------------------------------+
|                         PRESENTATION / INTERACTION LAYER                          |
|  +------------------------+  +------------------------+  +---------------------+  |
|  | Web Control Tower (3D) |  |   PDA / Mobile Web     |  | REST API Clients    |  |
|  | (Three.js WebGL/WebGPU)|  | (Offline-First Queue)  |  | (Integrasi ERP/MES) |  |
|  +------------------------+  +------------------------+  +---------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              API GATEWAY / MIDDLEWARE                             |
|  - JWT / Session Authentication & Device Registry Binding                         |
|  - RBAC Granular Authorization                                                    |
|  - Request Rate Limiting, Logging & Correlation ID Tracking                       |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              BUSINESS LOGIC MODULES                               |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  | Master Data Mod.  |  | Inventory Engine  |  | Immutable Transaction Ledger  |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  | Blind SO Engine   |  | 3D Layout Editor  |  | Traceability & Movement Graph |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  | Picking Module    |  | Replenishment Mod.|  | Receiving & Putaway Engine    |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
|  | Aging & Expiry    |  | Exception Engine  |  | Control Tower Analytics & KPI |  |
|  +-------------------+  +-------------------+  +-------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             DATA & PERSISTENCE LAYER                              |
|  +-----------------------------------------------------------------------------+  |
|  | Relational Database (PostgreSQL / SQLite)                                    |  |
|  | - Logical Schemas: master_*, inventory_*, txn_*, cycle_count_*, layout3d_*   |  |
|  | - Single Source of Truth for Master Data, Current State & Ledger             |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. SEPARASI SINGLE SOURCE OF TRUTH VS 3D VISUALIZATION LAYER

1. **Database sebagai Source of Truth**:
   - Seluruh status stok, master data hirarki gudang, catatan transaksi imutabel, dan log audit tersimpan secara persisten di dalam Database.
   - Tidak ada logika bisnis atau status stok utama yang hanya disimpan di memori frontend Three.js.

2. **Three.js sebagai Layer Visualisasi & Interaksi**:
   - Three.js bertindak sebagai *visual operational interface*.
   - Three.js mengonsumsi State API dari backend (misal: `/api/v1/3d/layout` dan `/api/v1/3d/heatmap`) untuk merender representasi 3D spasial secara tepat.
   - Pengubahan posisi objek di 3D Layout Designer mengirimkan perintah pembaruan ke API backend yang memvalidasi koordinat sebelum melakukan komit ke database.

---

## 3. INTEGRASI COMPONENT & EVENT-DRIVEN COMMUNICATION

- **Internal Event Bus**: Modul-modul bisnis berkomunikasi secara *decoupled* menggunakan event bus internal.
- **Mekanisme Pub/Sub**: Ketika transaksi penerimaan atau pergerakan terjadi di modul operasional, event seperti `InventoryMoved` dipublikasikan. Modul 3D Digital Twin dan Modul Analytics mendengarkan event tersebut untuk memperbarui *visual state* dan dashboard KPI secara real-time tanpa *tight coupling*.

---

## 4. SKALABILITAS DAN PERFORMANCE TARGETS

- **API Latency**: Response time API CRUD Master Data & Transaksi $< 100\text{ ms}$ (p95).
- **PDA Scan Latency**: Respons konfirmasi scan barcode pada PDA $< 50\text{ ms}$.
- **3D Frame Rate**: Performa rendering 3D pada layout gudang skala besar (ribuan bin & palet) dijaga pada target $\ge 60\text{ FPS}$ dengan memanfaat `InstancedMesh` dan *Frustum Culling*.
