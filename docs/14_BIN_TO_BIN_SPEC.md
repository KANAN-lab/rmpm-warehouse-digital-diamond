# 14_BIN_TO_BIN_SPEC.md

# SPESIFIKASI BIN-TO-BIN MOVEMENT ENGINE

---

## 1. ATURAN PEMINDAHAN AD-HOC INTER-BIN

Modul Bin-to-Bin mengelola pemindahan stok antar bin dalam satu atau antar zona gudang secara terencana maupun ad-hoc:

1. **Validation Engine**:
   - Memastikan bin asal (`source_bin`) memiliki stok yang mencukupi dan berstatus `AVAILABLE`.
   - Memastikan bin tujuan (`destination_bin`) berstatus `ACTIVE` dan kapasitasnya mencukupi.
   - Memastikan kompatibilitas jenis material dengan zona bin tujuan.
2. **PDA Execution**: Operator melakukan scan Bin Asal $\rightarrow$ Scan MID $\rightarrow$ Scan Bin Tujuan.
3. **Ledger Commit**: Sistem menerbitkan transaksi `BIN_TO_BIN` secara imutabel, mengurangi kuantitas stok di bin asal dan menambahkannya di bin tujuan secara atomic.
