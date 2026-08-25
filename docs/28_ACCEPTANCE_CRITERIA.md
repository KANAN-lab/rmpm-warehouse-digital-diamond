# 28_ACCEPTANCE_CRITERIA.md

# SPESIFIKASI KRITERIA PENERIMAAN (ACCEPTANCE CRITERIA BDD)

---

## 1. BDD TEST SCENARIOS (GIVEN / WHEN / THEN)

### Scenario 1: Blind SO Hiding System Quantity
- **GIVEN**: Bin `A01-R03-L02-B04` mencatat kuantitas stok sistem 1,000 KG Material RM001.
- **WHEN**: Petugas Counter membuka tugas Blind Cycle Count di PDA untuk Bin `A01-R03-L02-B04`.
- **THEN**: Antarmuka PDA **TIDAK MENAMPILKAN** angka 1,000 KG maupun kolom selisih variansi.
- **WHEN**: Petugas Counter memasukkan hasil hitung fisik 980 KG dan menekan tombol Confirm.
- **THEN**: Sistem menyimpan record 980 KG secara imutabel di `cycle_count_entries`, dan angka variansi selisih 20 KG hanya dapat diakses oleh akun berkewenangan (Supervisor / Inventory Controller).

### Scenario 2: Traceability Wrong Location Detection
- **GIVEN**: Tag MID-001 tercatat di database berada pada Bin `A01-R03-L02-B04`.
- **WHEN**: Counter menemukan MID-001 secara fisik di Bin `B02-R01-L03-B02`.
- **THEN**: Counter memasukkan hasil temuan lokasi fisik baru di PDA.
- **THEN**: Sistem menerbitkan catatan `WRONG_LOCATION` dengan kategori `WRONG_ZONE` dan secara otomatis memperbarui grafik penelusuran (*Traceability Graph*) yang menampilkan riwayat pergerakan terakhir, operator pemindah, dan transaksi terkait.
