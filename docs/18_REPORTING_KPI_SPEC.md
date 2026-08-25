# 18_REPORTING_KPI_SPEC.md

# SPESIFIKASI KPI REPORTING & CONTROL TOWER DASHBOARD

---

## 1. FORMULA METRIK KPI ENTERPRISE WMS

Sistem Control Tower menghitung metrik performa gudang secara otomatis dan real-time:

1. **Inventory Quantity Accuracy (%)**:
$$\text{Qty Accuracy} = \left( 1 - \frac{\sum |\text{Physical Qty} - \text{System Qty}|}{\sum \text{System Qty}} \right) \times 100$$

2. **Location Accuracy (%)**:
$$\text{Location Accuracy} = \left( \frac{\text{Bin Terverifikasi dengan Material Tepat}}{\text{Total Bin Terverifikasi}} \right) \times 100$$

3. **Cycle Count Completion Rate (%)**:
$$\text{SO Completion} = \left( \frac{\text{Target SO Status COMPLETED/VERIFIED}}{\text{Total Target SO}} \right) \times 100$$

4. **Wrong Location Ratio (%)**:
$$\text{Wrong Location \%} = \left( \frac{\text{Temuan Wrong Location}}{\text{Total Lokasi Terperiksa}} \right) \times 100$$

---

## 2. 10 VISUALIZATION LAYERS PADA 3D CONTROL TOWER

Manajer Pergudangan dapat mengaktifkan 10 visualisasi layer di kanvas 3D Digital Twin:

1. **Inventory Density Layer**: Kepadatan isi fisik bin.
2. **Cycle Count Progress Layer**: Status kemajuan Blind SO per rak/zona.
3. **Aging & Expiry Layer**: Sorotan stok mendekati/melewati kedaluwarsa.
4. **Capacity & Space Utilization Layer**: Persentase pemanfaatan ruang rak.
5. **Location Accuracy Layer**: Bin dengan temuan salah lokasi (*Wrong Location*).
6. **Active Picking Activity Layer**: Aktivitas pengambilan barang yang sedang berjalan.
7. **Replenishment Activity Layer**: Aktivitas pengisian kembali stok aktif.
8. **Exception Layer**: Bin dengan anomali *Missing* / *Unexpected Material*.
9. **Traffic & Movement Layer**: Frekuensi lalu lintas pergerakan di lorong gudang.
10. **Weight & Floor Load Layer**: Distribusi beban berat pada struktur lantai/rak.

---

## 3. CONFIGURABLE HEATMAP COLOR THEME

- **GREEN**: Normal / High Accuracy / Correct Location
- **YELLOW**: In Progress / Warning / Pending Count
- **ORANGE**: Variance Detected / Recount Needed
- **RED**: Wrong Location / Capacity Overflow / Expired
- **PURPLE**: Missing Stock / Critical Discrepancy
- **BLUE**: Active Inspection / Recount Assigned
