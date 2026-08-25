# 05_TRANSACTION_MODEL.md

# SPESIFIKASI LEDGER TRANSAKSI IMUTABEL (APPEND-ONLY)

---

## 1. PRINSIF IMMUTABLE TRANSACTION LEDGER

Setiap pergerakan, perubahan kuantitas, atau transisi status stok wajib menghasilkan record transaksi baru di dalam tabel `inventory_transactions`. 

> [!IMPORTANT]
> **ATURAN MUTLAK**: Tabel `inventory_transactions` bersifat **APPEND-ONLY**.
> - Dilarang keras menjalankan perintah SQL `UPDATE` atau `DELETE` pada tabel transaksi.
> - Pembatalan atau koreksi kesalahan transaksi masa lalu harus dilakukan dengan menerbitkan **Transaksi Pembalik / Transaksi Penyesuaian Baru**.

---

## 2. 16 TIPE TRANSAKSI STANDAR WMS

1. `RECEIVING`: Transaksi penerimaan fisik dari supplier/dock inbound ke staging receiving.
2. `PUTAWAY`: Transaksi pemindahan barang dari staging receiving ke bin penyimpanan utama.
3. `PICKING`: Transaksi pengambilan barang dari bin penyimpanan ke staging outbound/produksi.
4. `BATCHING`: Transaksi pengelompokan/pencampuran lot material untuk work order.
5. `REPLENISHMENT`: Transaksi pemindahan stok dari bulk storage ke picking bin.
6. `BIN_TO_BIN`: Transaksi pemindahan stok antar bin secara internal.
7. `TRANSFER`: Transaksi pemindahan stok antar gudang.
8. `RETURN`: Transaksi pengembalian material dari produksi/outbound ke gudang.
9. `ADJUSTMENT`: Transaksi penyesuaian kuantitas berdasarkan hasil Blind Cycle Count yang disetujui.
10. `CYCLE_COUNT`: Transaksi registrasi aktivitas opname fisik.
11. `STAGED`: Transaksi penempatan barang di lokasi staging.
12. `DISPATCH`: Transaksi pengeluaran barang akhir dari gudang.
13. `HOLD`: Transaksi penahanan stok dari alokasi operasional.
14. `RELEASE`: Transaksi pelepasan penahanan stok kembali ke status available.
15. `DAMAGE`: Transaksi pencatatan kerusakan fisik barang.
16. `SCRAP`: Transaksi pemusnahan barang rusak/kedaluwarsa.

---

## 3. STRUKTUR SKEMA LEDGER TRANSAKSI (`inventory_transactions`)

- `transaction_id` (UUID Primary Key)
- `transaction_type` (Enum 16 Tipe Transaksi)
- `source_location_id` (FK ke `master_bins`, nullable untuk Receiving)
- `destination_location_id` (FK ke `master_bins`, nullable untuk Dispatch)
- `material_id` (FK ke `master_materials`)
- `batch_id` (FK ke `master_batches`, nullable)
- `mid_code` (String Unik MID, nullable)
- `pallet_id` (FK ke `master_pallets`, nullable)
- `quantity` (Numeric Decimal)
- `uom_id` (FK ke `master_uoms`)
- `operator_id` (FK ke `master_users`)
- `device_id` (FK ke `master_devices`)
- `timestamp` (Timestamp dengan timezone, default `NOW()`)
- `reference_document` (String Nomor PO, Order ID, atau Cycle Count ID)
- `reason_code` (FK ke `master_rules_exception` / Reason Code)
- `status` (`SUCCESS`, `PENDING_APPROVAL`, `REVERTED`)
- `correlation_id` (UUID Tracking Request/Session)
- `previous_state` (JSONB Snapshot status & qty sebelum transaksi)
- `new_state` (JSONB Snapshot status & qty sesudah transaksi)
