# 08_3D_DIGITAL_TWIN_SPEC.md

# SPESIFIKASI 3D DIGITAL TWIN ENGINE (THREE.JS)

---

## 1. THREE.JS RENDERING ENGINE ARCHITECTURE

Engine visualisasi 3D dibangun di atas **Three.js (WebGL / WebGPU)** yang dirender langsung di browser tanpa ketergantungan pada plugin eksternal atau software CAD pihak ketiga.

- **Scene Graph**: Mengelola hierarki objek 3D (Warehouse $\rightarrow$ Zone $\rightarrow$ Rack Mesh $\rightarrow$ Level Mesh $\rightarrow$ Bin Mesh $\rightarrow$ Pallet / Material Mesh).
- **Camera Controller**: Memfasilitasi kontrol navigasi OrbitControls, Pan, Pinch Zoom, serta peralihan sudut pandang *Perspective Projection* (untuk inspeksi 3D realistis) dan *Orthographic Projection* (untuk tata letak layout 2D top-view).

---

## 2. DIRECT MAPPING 3D OBJECT TO DATABASE ENTITY

> [!IMPORTANT]
> Setiap mesh/objek 3D yang dirender pada kanvas Three.js terhubung secara mutlak 1-to-1 dengan ID entitas bisnis di database (`master_bins`, `master_racks`, `master_mids`).
> - Objek 3D Rak `OBJ-RACK-A01` $\leftrightarrow$ DB Entity `RACK-A01`
> - Objek 3D Bin `OBJ-BIN-A01-L02-B04` $\leftrightarrow$ DB Entity `BIN-A01-L02-B04`

Dilarang keras menyisipkan objek 3D *orphan* yang tidak memiliki asosiasi entitas database valid.

---

## 3. PARAMETRIC RACK GENERATOR ENGINE

Generator parametrik menghasilkan geometri 3D rak secara otomatis berdasarkan data spesifikasi ukuran di database:

$$\text{Input Parameters: } \{ \text{width: 2.7m}, \text{depth: 1.1m}, \text{height: 6.0m}, \text{levels: 5}, \text{bins\_per\_level: 4} \}$$

Engine secara otomatis:
1. Menghitung struktur balok tiang (*upright frames*) dan gelagar horizontal (*beams*).
2. Membagi ruang menjadi 5 tingkat (*levels*) dan 20 bin (*storage cells*).
3. Menerbitkan koordinat lokal $(x, y, z)$ untuk setiap cell bin.
4. Menghubungkan ID entitas bin dan meng-generate kode barcode bawaan.

---

## 4. PERFORMA RENDERING SKALA ENTERPRISE

Untuk merender gudang skala besar dengan puluhan ribu bin dan palet tanpa penurunan performa (< 60 FPS):

1. **InstancedMesh**: Menggunakan `THREE.InstancedMesh` untuk merender ribuan elemen bergeometri sama (seperti bin, kotak material, dan palet kayu) dalam satu *draw call*.
2. **Frustum Culling**: Objek 3D di luar bidang pandang kamera aktif tidak diproses oleh renderer GPU.
3. **Level of Detail (LOD)**:
   - *High LOD* (Jarak Dekat): Render detail struktur rak, bingkai, teks barcode, dan palet.
   - *Medium LOD* (Jarak Menengah): Render kotak geometri sederhana tanpa tekstur detail.
   - *Low LOD* (Jarak Jauh): Render blok warna solid transparan per-zona.
