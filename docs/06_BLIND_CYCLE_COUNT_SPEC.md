# 06_BLIND_CYCLE_COUNT_SPEC.md

# SPESIFIKASI BLIND CYCLE COUNT & RECONCILIATION ENGINE

---

## 1. ATURAN SCREEN RESTRICTION BLIND COUNTER (MUTLAK)

Pencatatan Stock Opname menggunakan metode **Blind Cycle Count**. Layar petugas counter pada antarmuka PDA/Mobile **TIDAK BOLEH** menampilkan:

1. **System Quantity** (Jumlah stok menurut catatan sistem/database).
2. **Expected Quantity** (Ekspektasi kuantitas yang seharusnya ada).
3. **Variance** (Selisih antara hasil hitung fisik dan sistem).
4. **Previous Count** (Hasil hitungan fisik yang dimasukkan sebelumnya atau oleh counter lain).

Petugas counter hanya diberikan informasi lokasi target (misal: Bin `A01-R03-L02-B04`), kolom scan/input barcode material atau MID, serta masukan jumlah fisik murni (*Physical Quantity Entry*).

---

## 2. 11 MODE SELEKSI CYCLE COUNT

Sistem mendukung pembuatan penugasan Cycle Count dalam 11 cakupan hirarki:

1. **Rack Mode**: Menghitung seluruh bin pada satu atau beberapa rak tertentu.
2. **Zone Mode**: Menghitung seluruh lokasi di dalam satu zona.
3. **Area Mode**: Menghitung area tertentu.
4. **Lane Mode**: Menghitung seluruh bin di sepanjang jalur/lane.
5. **Line Mode**: Menghitung line lokasi tertentu.
6. **Bin Mode**: Menghitung bin spesifik.
7. **Level Mode**: Menghitung satu tingkat horizontal pada rak.
8. **MID Mode**: Menghitung berdasarkan daftar tag MID tertentu.
9. **Pallet Mode**: Menghitung stok pada palet tertentu.
10. **Material Mode**: Menghitung seluruh stok untuk SKU material tertentu di seluruh gudang.
11. **Batch Mode**: Menghitung stok lot batch tertentu.

---

## 3. LIFECYCLE & TARGET STATES CYCLE COUNT

```
[ NOT_STARTED ] ---> [ IN_PROGRESS ] ---> [ COUNTED ] ---> [ VERIFIED ] ---> [ COMPLETED ]
                           |                  |
                           |                  +---> [ RECOUNT_REQUIRED ]
                           |
                           +---> [ SKIPPED ] / [ INVALID ]
```

States: `NOT_STARTED`, `IN_PROGRESS`, `COUNTED`, `RECOUNT_REQUIRED`, `VERIFIED`, `COMPLETED`, `SKIPPED`, `INVALID`.

> [!CAUTION]
> Status `SKIPPED` **TIDAK SAMA** dengan `COMPLETED`. Target yang dilewati (*skipped*) harus tetap tercatat di laporan audit dan tidak dihitung ke dalam penyelesaian fisik.

---

## 4. FORMULA COMPLETION RATE VS ACCURACY

- **Completion Rate Formula**:
$$\text{Completion \%} = \left( \frac{\text{Jumlah Target Berstatus COMPLETED / VERIFIED}}{\text{Total Target yang Ditetapkan}} \right) \times 100$$

- **Inventory Quantity Accuracy Formula**:
$$\text{Quantity Accuracy \%} = \left( 1 - \frac{\sum |\text{Physical Qty} - \text{Adjusted System Qty}|}{\sum \text{Adjusted System Qty}} \right) \times 100$$

---

## 5. REKONSILIASI DINAMIS & MOVEMENT DURING COUNT (`COUNT_IMPACT_EVENT`)

1. **Count Snapshot**: Ketika penugasan Cycle Count dimulai, sistem merekam `cycle_count_snapshots` yang menyimpan status dan kuantitas stok sistem saat titik waktu awal ($t_0$).
2. **Live Operation**: Gudang tetap beroperasi (*LIVE*).
3. **Count Impact Event**: Jika transaksi Picking, Putaway, atau Bin-to-Bin terjadi pada lokasi yang menjadi target opname antara waktu $t_0$ dan waktu eksekusi fisik $t_{\text{phys}}$, sistem membuat record `COUNT_IMPACT_EVENT`.
4. **Dynamic Reconciliation**:
$$\text{Expected Qty at } t_{\text{phys}} = \text{Snapshot Qty}(t_0) + \sum \text{Inbound Impact} - \sum \text{Outbound Impact}$$
$$\text{Variance} = \text{Physical Qty} - \text{Expected Qty at } t_{\text{phys}}$$

---

## 6. INDEPENDENT RECOUNT (COUNTER B)

Jika hasil hitung Counter A menghasilkan variansi di luar batas toleransi, supervisor memicu **Recount Task**:
- Tugas diberikan kepada petugas berbeda (Counter B).
- Counter B tetap menjalani layar blind (tidak bisa melihat angka hasil Counter A maupun sistem).
- Kedua hasil hitung tersimpan imutabel di database `cycle_count_entries` untuk audit komparatif.
