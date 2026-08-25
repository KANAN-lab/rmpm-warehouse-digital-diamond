# 07_PDA_WORKFLOW.md

# SPESIFIKASI WORKFLOW PDA / MOBILE DATA COLLECTION

---

## 1. UX DESIGN FOR WAREHOUSE PDA OPERATORS

Antarmuka pengguna PDA (Personal Digital Assistant / Mobile Scanner) dirancang khusus untuk kondisi pergudangan fisik:
- **Large Touch Targets**: Tombol dan elemen input berukuran minimal $48 \times 48\text{ px}$ untuk pengoperasian ramah sarung tangan kerja.
- **High Contrast Theme**: Tema gelap/terang bertekstur kontras tinggi untuk keterbacaan di area lorong gudang minim cahaya.
- **Audible & Haptic Feedback**: Suara beeper berbeda dan getaran perangkat untuk membedakan hasil **Scan Berhasil (Beep Hijau)** dan **Scan Gagal / Error (Beep Panjang Merah)**.

---

## 2. MODE PENGINPUTAN: SCAN VS MANUAL ENTRY

Setiap input data pada PDA (pembacaan barcode bin, MID, material, batch) wajib mencatat asal metode penginputan ke dalam database:

- **`SCAN`**: Input berasal dari pemindaian *laser barcode scanner* hardware atau kamera PDA.
- **`MANUAL`**: Input dimasukkan melalui tombol keyboard/layar sentuh oleh operator.

Pencatatan ini krusial untuk menganalisis tingkat kesalahan input manual dan kerusakan pencetakan label barcode di gudang.

---

## 3. OFFLINE ARCHITECTURE & LOCAL QUEUE

PDA mendukung pengoperasian dalam kondisi jaringan tidak stabil (*intermittent / dead-zone network*):

```
+-----------------------------------------------------------------------+
|                              PDA DEVICE                               |
|                                                                       |
|  +---------------------+      +------------------------------------+  |
|  | PDA UI Screen       | ---> | Local SQLite / IndexedDB Queue     |  |
|  | (Blind SO / Putaway)|      | - Pending Transactions Queue       |  |
|  +---------------------+      | - Offline Validation Rules Cache   |  |
|                               +------------------------------------+  |
+--------------------------------------------------|--------------------+
                                                   |
                                            (Auto Sync when Online)
                                                   v
+-----------------------------------------------------------------------+
|                          SERVER REST API                              |
|  - Sync Queue Processor                                               |
|  - Conflict Resolution Engine (`SYNC_CONFLICT`)                       |
+-----------------------------------------------------------------------+
```

---

## 4. WORKFLOW OPERASIONAL UTAMA DI PDA

1. **Workflow Blind SO**: Login $\rightarrow$ Select Assignment $\rightarrow$ Scan Bin Barcode $\rightarrow$ Scan MID/Material $\rightarrow$ Input Physical Qty $\rightarrow$ Confirm (Data tersimpan di Local Queue jika offline $\rightarrow$ Sync ke Server).
2. **Workflow Putaway**: Scan Staging Area $\rightarrow$ Scan Material/MID $\rightarrow$ System Recommends Destination Bin $\rightarrow$ Scan Destination Bin $\rightarrow$ Confirm Execution.
3. **Workflow Picking**: Select Pick Task $\rightarrow$ Guided Route to Bin $\rightarrow$ Scan Bin $\rightarrow$ Scan Material $\rightarrow$ Input Picked Qty $\rightarrow$ Confirm to Outbound Staging.
4. **Workflow Bin-to-Bin**: Scan Source Bin $\rightarrow$ Scan MID $\rightarrow$ Scan Destination Bin $\rightarrow$ Confirm Movement.
