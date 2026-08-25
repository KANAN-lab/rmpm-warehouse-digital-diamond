# 12_REPLENISHMENT_SPEC.md

# SPESIFIKASI MODUL REPLENISHMENT & CAPACITY ENGINE

---

## 1. REPLENISHMENT TRIGGER MECHANISM

Modul Replenishment memastikan ketersediaan stok di area pengambilan barang (*picking bins*) dengan memicu tugas pemindahan otomatis dari area penyimpanan utama (*bulk / reserve storage*):

1. **Min/Max Trigger**: Pemicu berdasarkan ambang batas stok minimum di bin picking.
$$\text{If Current Picking Bin Qty} \le \text{Min Threshold} \implies \text{Generate Replenishment Task to Max Level}$$
2. **Demand-Driven Trigger**: Pemicu berdasarkan lonjakan pesanan outbound yang melebihi kapasitas stok di bin picking aktif.

---

## 2. WORKFLOW EKSEKUSI REPLENISHMENT

1. System memindai bin picking yang membutuhkan pasokan stok.
2. System memilih lokasi bulk storage berdasarkan aturan FIFO/FEFO.
3. System menerbitkan tugas **Replenishment Task** ke PDA operator.
4. Operator mengambil stok dari bulk storage dan melakukan pemindaian konfirmasi di bin picking tujuan.
5. Menghasilkan transaksi `REPLENISHMENT` di ledger imutabel.
