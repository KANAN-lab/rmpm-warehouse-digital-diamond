# 13_RECEIVING_PUTAWAY_SPEC.md

# SPESIFIKASI MODUL RECEIVING & PUTAWAY ENGINE

---

## 1. RECEIVING WORKFLOW (INBOUND)

1. **PO / ASN Verification**: Petugas verifikasi mencocokkan dokumen Purchase Order (PO) atau Advanced Shipping Notice (ASN).
2. **Inbound Physical Dock Scan**: Penerimaan fisik barang di area Loading Dock / Inbound Staging Area.
3. **MID Tagging**: Sistem menerbitkan label fisik unik (Material Identification Tag - MID) dan barcode untuk ditempelkan pada setiap sak/drum/palet yang diterima.
4. **Quality Control Inspection**: Material yang membutuhkan pengujian QC dialokasikan ke status `QUARANTINE` di area karantina. Setelah lolos QC, status diperbarui menjadi `AVAILABLE`.
5. Transaksi `RECEIVING` dicatat di ledger imutabel.

---

## 2. PUTAWAY SUGGESTION ENGINE

Engine Putaway memberikan rekomendasi bin lokasi penyimpanan optimal berdasarkan algoritma validasi aturan (*Putaway Rules*):

- **Zone Compatibility**: Memastikan material kimia/hazard ditempatkan di Hazard Zone, dan material dingin di Cold Zone.
- **Dimensional & Capacity Check**: Memastikan berat dan volume barang tidak melebihi `max_weight` dan `max_volume` bin tujuan.
- **Product Velocity / ABC Classification**: Barang fast-moving ditempatkan di bin tingkat bawah yang dekat dengan akses lorong utama.

Operator mendatangi bin rekomendasi, melakukan scan barcode bin tujuan di PDA, dan mengonfirmasi transaksi `PUTAWAY`.
