# 11_BATCHING_SPEC.md

# SPESIFIKASI MODUL BATCHING & ASSOCIATED PRODUCTION

---

## 1. PEMBENTUKAN BATCH MATERIAL

Modul Batching bertugas mengelola pengelompokan bahan baku/kemasan ke dalam lot batch produksi:
- **Batch Creation**: Merekam nomor batch pabrikan (*vendor batch*) dan nomor batch internal pabrik.
- **Batch Metadata**: Menghubungkan informasi `manufacture_date`, `expiry_date`, sertifikat analisis (COA), serta status pengujian kualitas (`PASSED`, `QUARANTINE`, `REJECTED`).

---

## 2. ASOSIASI WORK ORDER PRODUKSI

Setiap pemintaan campuran bahan baku (*kitting / staging for production batch*) dihubungkan dengan ID Work Order Produksi:
- Mengunci lot batch tertentu agar tidak terpakai oleh lini produksi lain.
- Mencatat transaksi `BATCHING` di dalam ledger imutabel.
- Memfasilitasi *backward & forward traceability* jika terjadi kasus penarikan produk (*product recall*).
