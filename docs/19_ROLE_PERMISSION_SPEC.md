# 19_ROLE_PERMISSION_SPEC.md

# SPESIFIKASI ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS

---

## 1. ROLES HIERARCHY

Sistem mengimplementasikan otorisasi berbasis peran (RBAC) granular:

1. `ADMIN`: Hak akses penuh ke seluruh konfigurasi sistem, database, dan master data.
2. `WAREHOUSE_MANAGER`: Hak akses ke publikasi layout 3D, persetujuan adjustment stok bernilai tinggi, dan KPI reporting.
3. `SUPERVISOR`: Hak akses ke pembuatan tugas Blind SO, pembukaan recount, persetujuan adjustment stok standar, dan resolusi konflik offline PDA (`SYNC_CONFLICT`).
4. `INVENTORY_CONTROLLER`: Hak akses ke analisis variansi stok, pembekuan lokasi (*controlled freeze*), dan manajemen karantina QC.
5. `COUNTER`: Hak akses khusus ke PDA Blind Cycle Count (layar blind tanpa akses ke variance/system qty).
6. `PICKER`: Hak akses ke tugas eksekusi picking di PDA.
7. `PUTAWAY_OPERATOR`: Hak akses ke tugas eksekusi putaway di PDA.
8. `REPLENISHMENT_OPERATOR`: Hak akses ke tugas eksekusi replenishment di PDA.
9. `VIEWER`: Hak akses read-only ke Control Tower 3D dan laporan statistik.

---

## 2. GRANULAR PERMISSION KEYS MATRIX

| Permission Key | Description | Roles |
| :--- | :--- | :--- |
| `master_data.view` | Melihat data master | All Roles |
| `master_data.edit` | Mengubah master data gudang/material | `ADMIN`, `WAREHOUSE_MANAGER` |
| `layout.edit` | Mengedit 3D layout gudang (Draft Mode) | `ADMIN`, `WAREHOUSE_MANAGER` |
| `layout.publish` | Memublikasikan versi layout 3D ke produksi | `ADMIN`, `WAREHOUSE_MANAGER` |
| `cycle_count.create` | Membuat penugasan Blind Cycle Count | `ADMIN`, `WAREHOUSE_MANAGER`, `SUPERVISOR` |
| `cycle_count.count` | Melakukan penginputan hitung fisik blind di PDA | `COUNTER`, `SUPERVISOR` |
| `cycle_count.view_variance`| Melihat selisih/variansi angka SO | `ADMIN`, `WAREHOUSE_MANAGER`, `SUPERVISOR`, `INVENTORY_CONTROLLER` |
| `cycle_count.approve` | Menyetujui adjustment penyesuaian stok | `ADMIN`, `WAREHOUSE_MANAGER`, `SUPERVISOR` |
| `inventory.adjust` | Mengeksekusi transaksi adjustment stok | `ADMIN`, `WAREHOUSE_MANAGER` |
