# 10_PICKING_SPEC.md

# SPESIFIKASI MODUL PICKING & STRATEGI ALOKASI STOK

---

## 1. STRATEGI ALOKASI STOK (FIFO / FEFO)

Modul Picking bertanggung jawab mengalokasikan stok barang secara otomatis dari bin penyimpanan berdasarkan aturan bisnis material:

- **FEFO (First Expired, First Out)**: Diutamakan untuk bahan baku/kemasan yang memiliki tanggal kedaluwarsa (`expiry_date`). Sistem mengurutkan alokasi stok terdekat dengan waktu kedaluwarsa.
- **FIFO (First In, First Out)**: Diutamakan untuk material non-expiry berdasarkan tanggal penerimaan barang (`receipt_date`).

---

## 2. WORKFLOW DARI ORDER HINGGA CONSOLIDATION

```
[ Outbound Order / Demand ] 
           |
           v
[ Stock Allocation Engine (FIFO/FEFO) ] ---> Update Status Stok: AVAILABLE -> ALLOCATED
           |
           v
[ Pick List & Route Optimization Generator ]
           |
           v
[ PDA Picking Execution Task ] ------------> Scan Bin -> Scan MID/Material -> Pick Qty
           |
           v
[ Outbound Staging Area ] -----------------> Update Status Stok: ALLOCATED -> PICKED -> STAGED
```

---

## 3. PICK ROUTE OPTIMIZATION & PDA EXECUTION

- **Pick Route Optimization**: Menghasilkan daftar urutan lokasi pengambil barang (*S-shape / Z-shape routing algorithm*) untuk meminimalkan jarak tempuh operator picker di lorong gudang.
- **PDA Verification**: Picker wajib melakukan pemindaian barcode bin lokasi tujuan dan barcode MID/Material. Jika picker mengambil dari bin yang salah, PDA menampilkan peringatan `WRONG_BIN_SCANNED`.
