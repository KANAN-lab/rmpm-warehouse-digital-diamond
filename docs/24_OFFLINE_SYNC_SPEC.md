# 24_OFFLINE_SYNC_SPEC.md

# SPESIFIKASI OFFLINE SYNC ARCHITECTURE & SYNC CONFLICT MANAGEMENT

---

## 1. OFFLINE SYNC ARCHITECTURE

PDA menyimpan transaksi lokal di database SQLite saat jaringan terputus. Setelah koneksi kembali terhubung (*online*), skrip Sync Processor mengirimkan antrean transaksi ke backend secara bertahap:

```
[ PDA Local SQLite Queue ] --(Network Restored)--> [ HTTP POST /api/v1/sync/pda-queue ]
                                                                 |
                                                     (Server Validation Check)
                                                                 |
                                       +-------------------------+-------------------------+
                                       |                                                   |
                               (No Conflict)                                       (Conflict Detected)
                                       v                                                   v
                          [ Commit to Transaction Ledger ]                    [ Create SYNC_CONFLICT Record ]
                                                                                           |
                                                                                  (Supervisor Review)
```

---

## 2. SYNC CONFLICT MANAGEMENT (`SYNC_CONFLICT`)

> [!CAUTION]
> Jika terjadi bentrokan state antara offline queue PDA dan database server (misal: PDA mencatat MID-001 berada di Bin A saat offline, tetapi Server telah menerima transaksi pergerakan MID-001 ke Bin B sebelum PDA sync), sistem **TIDAK BOLEH** menimpa data server secara diam-diam.

1. System membuat record `SYNC_CONFLICT` pada tabel `system_sync_conflicts`.
2. Notifikasi dikirimkan ke Dashboard Supervisor Control Tower.
3. Supervisor meninjau kronologi waktu (*timestamp*) dan menyetujui salah satu aksi:
   - **Accept PDA State**: Mengakui fisik temuan PDA dan menerbitkan penyesuaian.
   - **Accept Server State**: Mempertahankan state server dan menerbitkan tugas verifikasi fisik ke lokasi.
