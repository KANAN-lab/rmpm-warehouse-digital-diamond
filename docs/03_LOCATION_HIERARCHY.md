# 03_LOCATION_HIERARCHY.md

# SPESIFIKASI HIRARKI LOKASI DINAMIS & ACCURACY ENGINE

---

## 1. DYNAMIC LOCATION HIERARCHY MODEL

Sistem tidak mengunci hirarki lokasi secara kaku (*no hard-coded hierarchy*). Setiap node lokasi dihubungkan melalui pola self-referencing `parent_location_id` dan `location_type_id`.

```
                  [ Warehouse: WH-RMPM-01 ]
                             |
                  [ Zone: ZONE-A (Dry Storage) ]
                             |
                  [ Area: AREA-A1 (Bulk Raw Material) ]
                             |
                  [ Lane / Line: LANE-01 ]
                             |
                  [ Aisle: AISLE-01 ]
                             |
                  [ Rack: RACK-A01 ]
                             |
                  [ Level: LEVEL-02 ]
                             |
                  [ Bin: BIN-A01-L02-B04 ]
```

---

## 2. ATRIBUT DAN VALIDASI LOKASI

Setiap entitas lokasi memiliki atribut standar:
- `id` (UUID Primary Key)
- `code` (String Unik, misal: `A01-R03-L02-B04`)
- `name` (Nama ramah pengguna)
- `barcode` & `qr_code` (String terenkode untuk di-scan PDA)
- `parent_location_id` (Foreign Key ke entitas lokasi induk)
- `location_type` (`WAREHOUSE`, `ZONE`, `AREA`, `LANE`, `AISLE`, `RACK`, `LEVEL`, `BIN`, `STAGING`, `DOCK`)
- `capacity_max_weight` (Batas beban maksimum kg)
- `capacity_max_volume` (Batas volume m³)
- `capacity_max_pallets` (Batas jumlah palet)
- `status` (`ACTIVE`, `INACTIVE`, `BLOCKED`, `MAINTENANCE`)
- `x_pos`, `y_pos`, `z_pos` (Koordinat dunia nyata / 3D)

---

## 3. LOCATION ACCURACY CLASSIFICATION (WRONG LOCATION)

Ketika material ditemukan secara fisik di luar lokasi yang tercatat di database saat Blind Cycle Count atau inspeksi operasional, sistem secara otomatis mengklasifikasikan tingkat deviasi lokasi (*Wrong Location Breakdown*):

1. **`WRONG_WAREHOUSE`**: Ditemukan di gedung gudang yang salah.
2. **`WRONG_ZONE`**: Ditemukan di zona yang salah (misal di Cold Zone padahal seharusnya Dry Zone).
3. **`WRONG_AREA`**: Ditemukan di area yang salah.
4. **`WRONG_LANE` / `WRONG_LINE`**: Ditemukan di jalur/line yang salah.
5. **`WRONG_AISLE`**: Ditemukan di lorong yang salah.
6. **`WRONG_RACK`**: Ditemukan di rak yang salah.
7. **`WRONG_LEVEL`**: Ditemukan di tingkat rak yang salah.
8. **`WRONG_BIN`**: Ditemukan di bin/slot yang salah pada rak dan tingkat yang sama.

---

## 4. FORMULA LOCATION ACCURACY

Akurasi lokasi dihitung secara periodik dan real-time:

$$\text{Location Accuracy \%} = \left( \frac{\text{Jumlah Inventory Terverifikasi di Lokasi Benar}}{\text{Total Total Inventory Terverifikasi}} \right) \times 100$$
