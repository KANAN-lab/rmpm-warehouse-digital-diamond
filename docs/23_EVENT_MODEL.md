# 23_EVENT_MODEL.md

# SPESIFIKASI DOMAIN EVENT CATALOG (16 DOMAIN EVENTS)

---

## 1. KATALOG DOMAIN EVENTS WMS

Sistem menerbitkan 16 Domain Events utama secara asynchronous untuk mengintegrasikan logika antarmodul:

1. `InventoryReceived`: Dipublikasikan saat barang baru diterima di inbound dock.
2. `InventoryPutAway`: Dipublikasikan saat barang ditempatkan di bin lokasi penyimpanan.
3. `InventoryPicked`: Dipublikasikan saat barang diambil dari bin lokasi.
4. `InventoryBatched`: Dipublikasikan saat lot material dialokasikan ke batch produksi.
5. `InventoryReplenished`: Dipublikasikan saat stok dipindahkan ke area picking.
6. `InventoryMoved`: Dipublikasikan saat terjadi transaksi pergerakan Bin-to-Bin.
7. `CycleCountStarted`: Dipublikasikan saat penugasan Blind SO diaktifkan.
8. `CountRecorded`: Dipublikasikan setiap kali petugas counter memasukkan hasil hitung di PDA.
9. `CountCompleted`: Dipublikasikan saat target SO mencapai 100% ketercakapan fisik.
10. `RecountRequested`: Dipublikasikan saat variansi membutuhkan hitung ulang independen (Counter B).
11. `WrongLocationDetected`: Dipublikasikan saat material fisik ditemukan di luar lokasi database.
12. `VarianceDetected`: Dipublikasikan saat terjadi perbedaan angka fisik dan snapshot sistem.
13. `AdjustmentApproved`: Dipublikasikan saat supervisor menyetujui penyesuaian stok.
14. `LayoutPublished`: Dipublikasikan saat versi layout 3D baru resmi digunakan.
15. `SyncConflictDetected`: Dipublikasikan saat transaksi offline PDA bentrok dengan data server.
16. `MasterDataUpdated`: Dipublikasikan saat entitas master data diubah.

---

## 2. EVENT PAYLOAD SCHEMA EXAMPLE

```json
{
  "event_id": "evt-991823-112",
  "event_type": "WrongLocationDetected",
  "timestamp": "2026-08-25T16:13:05Z",
  "correlation_id": "corr-88219-abc",
  "payload": {
    "cycle_count_id": "CC-20260825-00001",
    "mid_code": "MID-001",
    "expected_location_code": "A01-R03-L02-B04",
    "actual_location_code": "B02-R01-L03-B02",
    "wrong_location_type": "WRONG_ZONE",
    "operator_id": "usr-counter-02",
    "device_id": "pda-dev-001"
  }
}
```
