# 17_TRACEABILITY_SPEC.md

# SPESIFIKASI TRACEABILITY & MOVEMENT GRAPH ENGINE

---

## 1. TIMELINE MOVEMENT GRAPH

Setiap penelusuran histori material (berdasarkan MID, Nomor Batch, atau Nomor Palet) menyajikan **Timeline Graph** pergerakan fisik yang menjawab 8 Pertanyaan Audit Utama:

1. Di mana lokasi barang berada saat ini?
2. Di mana lokasi yang seharusnya menurut sistem?
3. Di mana lokasi-lokasi yang pernah ditempati sebelumnya?
4. Kapan persisnya pergerakan fisik tersebut terjadi?
5. Siapa operator yang mengeksekusi pergerakan tersebut?
6. Transaksi mana yang menyebabkan pergerakan tersebut?
7. Apa alasan / reason code perpindahan barang?
8. Perangkat (PDA/Device ID) mana yang digunakan saat memindahkan?

```
[ Inbound Dock ] --(Receiving: Op-01, 10:00)---> [ Staging A ] --(Putaway: Op-02, 10:30)---> [ Bin A01-L02-B01 ]
                                                                                                    |
                                                                                         (Bin-to-Bin: Op-03, 14:15)
                                                                                                    v
                                                                                           [ Bin B02-L01-B03 ]
```

---

## 2. MATRIKS ANALISIS AKAR MASALAH (ROOT CAUSE MATRIX)

Penyebab kesalahan lokasi (*Wrong Location*) diklasifikasikan ke dalam kategori terkonfigurasi:
- `PUTAWAY_ERROR`: Operator meletakkan barang di bin yang salah saat putaway.
- `PICKING_ERROR`: Operator mengambil dari bin salah atau meninggalkan sebagian sisa stok tanpa mengonfirmasi.
- `REPLENISHMENT_ERROR`: Kesalahan lokasi pengisian kembali stok.
- `BIN_TO_BIN_ERROR`: Pemindahan fisik tanpa melakukan pemindaian konfirmasi di PDA.
- `SYSTEM_MAPPING_ERROR`: Kesalahan pemetaan data master lokasi.
- `BARCODE_DAMAGE`: Barcode tidak terbaca sehingga operator memilih lokasi manual yang salah.
