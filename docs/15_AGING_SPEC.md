# 15_AGING_SPEC.md

# SPESIFIKASI DYNAMIC AGING ENGINE & EXPIRED TRACKING

---

## 1. DYNAMIC AGING BUCKET CALCULATION

Engine Aging menghitung umur stok material secara dinamis berdasarkan selisih waktu antara tanggal rujukan (`receipt_date` atau `manufacture_date`) dan tanggal hari ini ($t_{\text{current}}$):

$$\text{Age (Days)} = t_{\text{current}} - \text{Receipt Date}$$

Pengelompokan bucket umur stok bersifat terkonfigurasi (*no hard-coded aging buckets*):
- **Bucket 1**: 0 – 30 Hari (Fresh Stock)
- **Bucket 2**: 31 – 60 Hari
- **Bucket 3**: 61 – 90 Hari
- **Bucket 4**: 91 – 180 Hari (Slow Moving Warning)
- **Bucket 5**: > 180 Hari (Dead Stock)

---

## 2. NEAR-EXPIRY & EXPIRED AUTOMATED ALERTS

- **Near Expiry Alert**: Peringatan otomatis yang dipicu ketika sisa masa simpan material kurang dari ambang batas toleransi (misal: $< 30\text{ hari}$ sebelum `expiry_date`). Status inventaris dapat otomatis dialihkan menjadi `HOLD` untuk peninjauan QC.
- **Expired Stock Isolation**: Material yang telah melewati `expiry_date` secara otomatis dialihkan ke status `EXPIRED`, diblokir dari alokasi picking, dan disorot dengan warna merah pada layer 3D Digital Twin.
