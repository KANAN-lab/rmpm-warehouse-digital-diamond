# REQUIREMENT_GAP_ANALYSIS.md

# ANALISIS GAP REQUIREMENT & KEBUTUHAN KEPUTUSAN BISNIS

Dokumen ini mencatat hasil inspeksi awal terhadap seluruh kebutuhan bisnis [Prompt.md](file:///d:/Coding%20Session/RMPM/Prompt.md) untuk mengidentifikasi potensi celah (*gaps*), kebutuhan aturan terkonfigurasi, serta dependensi antar modul sebelum penulisan kode dimulai.

---

## 1. IDENTIFIKASI AMBIGUITAS & ASUMSI STANDAR INDUSTRI

1. **Aturan Toleransi Selisih Blind SO**:
   - *Requirement*: Persetujuan penyesuaian stok membutuhkan workflow approval.
   - *Analisis Gap*: Perlu penetapan batas toleransi kuantitas & nilai rupiah yang memicu tingkat persetujuan (Supervisor vs Manager).
   - *Rekomendasi Default*: Penyesuaian selisih $< 1.0\%$ atau $< \$100$ disetujui Supervisor; selisih $\ge 1.0\%$ membutuhkan persetujuan Warehouse Manager. (Dicatat di [BUSINESS_DECISIONS.md](file:///d:/Coding%20Session/RMPM/BUSINESS_DECISIONS.md)).

2. **Mekanisme Peringatan Dynamic Aging**:
   - *Requirement*: Peringatan barang mendekati kedaluwarsa (*Near Expiry*).
   - *Rekomendasi Default*: Ambang batas peringatan diset 30 hari sebelum `expiry_date` untuk bahan baku standar dan 60 hari untuk bahan peka kualitas.

3. **Resolusi Offline Sync Conflict (`SYNC_CONFLICT`)**:
   - *Requirement*: Sistem membuat record `SYNC_CONFLICT` saat terjadi bentrokan state PDA dan Server.
   - *Rekomendasi Default*: Transaksi offline dimasukkan ke antrean peninjauan Supervisor di Control Tower tanpa menimpa data server secara otomatis.
