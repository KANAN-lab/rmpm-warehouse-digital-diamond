# 04_INVENTORY_MODEL.md

# SPESIFIKASI MODEL INVENTARIS & CURRENT STATE ENGINE

---

## 1. HIRARKI ENTITAS INVENTARIS

Data stok barang dalam WMS mengadopsi hirarki keterikatan entitas sebagai berikut:

$$\text{Material} \rightarrow \text{Batch} \rightarrow \text{Pallet} \rightarrow \text{MID (Material Identification Tag)} \rightarrow \text{Location}$$

- **Material**: Induk jenis bahan baku/kemasan (misal: Resin Plastik, Botol PET 500ml).
- **Batch**: Lot produksi pabrikan/vendor dengan informasi tanggal pembuatan & kedaluwarsa.
- **Pallet**: Wadah pengangkut/penyimpanan fisik yang mengelompokkan stok.
- **MID**: Identifier unik per-unit kemasan/sak/drum fisik (First-Class Entity).
- **Location**: Entitas bin/staged area tempat fisik barang berada saat ini.

---

## 2. TABEL CURRENT STATE STOK (`inventory_balances`)

Tabel `inventory_balances` memelihara status dan jumlah stok fisik berjalan di setiap lokasi:

- `id` (UUID Primary Key)
- `location_id` (FK ke `master_bins`)
- `material_id` (FK ke `master_materials`)
- `batch_id` (FK ke `master_batches`, nullable)
- `mid_code` (String Unik MID, nullable jika non-MID managed)
- `pallet_id` (FK ke `master_pallets`, nullable)
- `quantity` (Numeric Decimal)
- `uom_id` (FK ke `master_uoms`)
- `status` (Enum Status Inventaris)
- `manufacture_date` (Date)
- `expiry_date` (Date)
- `receipt_date` (Timestamp)
- `last_movement_at` (Timestamp)
- `quality_status` (`PASSED`, `QUARANTINE`, `REJECTED`, `IN_TESTING`)

---

## 3. INVENTORY STATUS STATE MACHINE

Stok barang dapat bertransisi di antara status-status berikut secara terkonfigurasi:

```
[ AVAILABLE ] ----(Allocate)---> [ ALLOCATED ] ----(Pick)----> [ PICKED ] ----(Stage)----> [ STAGED ]
      |                                                                                        |
  (Block/Hold)                                                                            (Dispatch)
      v                                                                                        v
  [ BLOCKED / HOLD ]                                                                      [ DISPATCHED ]
      |
  (Quarantine)
      v
  [ QUARANTINE ] ----(Quality Fail)---> [ DAMAGED / EXPIRED ]
```

Daftar Status:
1. `AVAILABLE`: Stok bebas dialokasikan untuk Picking / Bin-to-Bin.
2. `ALLOCATED`: Stok telah dicadangkan untuk order picking tertentu.
3. `PICKED`: Stok telah diambil dari bin oleh picker.
4. `STAGED`: Stok berada di area staging siap kirim/produksi.
5. `IN_TRANSIT`: Stok dalam proses pemindahan antar bin/gudang.
6. `BLOCKED`: Stok dikunci sementara oleh supervisor.
7. `QUARANTINE`: Stok dalam pemeriksaan laboratorium QC.
8. `DAMAGED`: Stok rusak fisik.
9. `EXPIRED`: Stok telah melewati tanggal kedaluwarsa.
10. `HOLD`: Stok ditahan karena penelusuran exception.
11. `UNKNOWN`: Stok ditemukan tanpa atribut identitas lengkap.
