# 26_VALIDATION_RULES.md

# MATRIKS ATURAN VALIDASI MASTER DATA & TRANSAKSI

---

## 1. DATA VALIDATION MATRIX

Sistem menerapkan validasi ketat sebelum komit transaksi atau pembaruan master data:

1. **Unique Code Validation**: Kode Gudang, Zona, Rak, Bin, Material, MID, dan Barcode wajib unik secara global di seluruh database.
2. **Parent-Child Integrity**: Dilarang menghapus parent location (misal: Rak) jika masih terdapat child locations (misal: Bin) aktif di bawahnya.
3. **Capacity Overflow Prevention**:
$$\text{If (Current Bin Volume + Item Volume)} > \text{Bin Max Volume} \implies \text{Reject Transaction (CAPACITY_OVERFLOW)}$$
4. **Status Transition Validation**: Transaksi pergerakan dari bin berstatus `INACTIVE` / `MAINTENANCE` akan ditolak secara otomatis oleh validator API.
5. **UOM Conversion Validation**: Memastikan konversi UOM (misal: Sak ke KG) terdaftar di tabel `master_uom_conversions` sebelum melakukan kalkulasi kuantitas.
