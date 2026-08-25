# BUSINESS_DECISIONS.md

# LOG KEPUTUSAN BISNIS & ASUMSI STANDAR (BUSINESS DECISION LOG)

---

## 1. LOG KEPUTUSAN BISNIS STANDAR

1. **[BD-001] Arsitektur Utama Backend**:
   - *Keputusan*: Menggunakan pola Modular Monolith enterprise dengan pemisahan logical schema database untuk kemudahan deployment dan pemeliharaan.
2. **[BD-002] Visualisasi 3D Browser**:
   - *Keputusan*: Menggunakan Three.js WebGL/WebGPU tanpa dependensi software CAD pihak ketiga. Three.js bertindak sebagai *visual operational interface*, sedangkan *source of truth* berada di database.
3. **[BD-003] Kebijakan Blind SO Screen**:
   - *Keputusan*: Layar PDA petugas counter mutlak menyembunyikan System Quantity, Expected Quantity, Variance, dan Previous Count.
4. **[BD-004] Batas Toleransi Selisih Stok & Approval**:
   - *Keputusan*: Variansi selisih opname fisik di bawah 1% disetujui oleh Supervisor; variansi di atas 1% memerlukan persetujuan Warehouse Manager.
5. **[BD-005] Imutabilitas Ledger Transaksi**:
   - *Keputusan*: Tabel `inventory_transactions` bersifat *append-only*. Dilarang keras melakukan SQL `UPDATE` atau `DELETE` pada riwayat transaksi. Koreksi kesalahan dilakukan melalui transaksi pembalik/penyesuaian baru.
6. **[BD-006] Stack Frontend Web Application**:
   - *Keputusan*: Menggunakan Web Application berbasis **Vite + React + Three.js (WebGL/WebGPU)** untuk Control Tower 3D Desktop dan **PWA (Progressive Web App)** untuk antarmuka PDA Mobile. Pilihan ini menjamin performa render 3D tinggi (60 FPS), pengoperasian offline di perangkat PDA scanner, serta antarmuka web modern yang responsif.
