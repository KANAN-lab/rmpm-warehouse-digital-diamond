# 16_EXCEPTION_MANAGEMENT.md

# SPESIFIKASI EXCEPTION MANAGEMENT & DISCREPANCY HANDLING

---

## 1. PENANGANAN ANOMALI OPERASIONAL

Modul Exception Management menangani 4 kasus anomali utama pergudangan tanpa merusak konsistensi data:

1. **Wrong Location (`WRONG_LOCATION`)**: Material ditemukan secara fisik di luar lokasi yang tercatat di database.
   - *Tindakan*: Sistem mencatat pengamatan fisik, menetapkan status deviasi lokasi, dan menyediakan pintasan untuk memicu penelusuran pergerakan (*Traceability Graph*).
2. **Missing Material (`MISSING_PENDING_RECOUNT`)**: Stok yang terdaftar di database tidak ditemukan secara fisik saat opname.
   - *Tindakan*: Stok **TIDAK BISA** langsung di-adjust/dihapus otomatis. Stok dialihkan ke status `MISSING_PENDING_RECOUNT` dan memicu tugas hitung ulang independen (Counter B).
3. **Unexpected Material (`UNEXPECTED_MATERIAL`)**: Material fisik ditemukan di lokasi opname tetapi tidak terdaftar di sistem.
   - *Tindakan*: Operator mencatat barcode/MID material. Sistem menyimpan temuan sebagai `UNEXPECTED_MATERIAL` dan menerbitkan tugas investigasi ke supervisor.
4. **Damaged Stock (`DAMAGED`)**: Barang ditemukan dalam keadaan rusak fisik.
   - *Tindakan*: Mengubah status inventaris menjadi `DAMAGED`, memindahkan stok ke Quarantine/Damage Zone, dan mencatat transaksi `DAMAGE`.
