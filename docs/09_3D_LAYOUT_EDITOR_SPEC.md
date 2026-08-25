# 09_3D_LAYOUT_EDITOR_SPEC.md

# SPESIFIKASI 3D WAREHOUSE LAYOUT DESIGNER & VERSIONING

---

## 1. INTEGRATED 3D DESIGN MODE TOOLS

Aplikasi menyediakan antarmuka **3D Warehouse Designer** terintegrasi yang memungkinkan manajer/supervisor pergudangan merancang dan mengedit layout gudang langsung di browser:

- **Add Tools**: Add Warehouse Floor, Add Zone Area, Add Parametric Rack, Add Level/Bin, Add Aisle Path, Add Inbound/Outbound Staging Area, Add Wall, Add Door, Add Loading Dock, Add Structural Column, Add Custom Equipment.
- **Transform Gizmo Control**:
  - **Move**: Pergeseran posisi pada sumbu X, Y, Z.
  - **Rotate**: Rotasi objek pada sumbu X, Y, Z (penyesuaian sudut lorong).
  - **Scale**: Pengubahan dimensi fisik (Panjang, Lebar, Tinggi).
- **Manipulation Actions**: Duplicate Selected Object, Delete Object, Snap to Grid, Snap to Object Edge, Grouping, Ungrouping, Object Alignment (Left, Center, Right), Distribute Spacing, Distance Measurement Tool.

---

## 2. NUMERIC PROPERTY EDITOR PANEL

Selain manipulasi menggunakan mouse dragging/gizmo, pengguna dapat memasukkan angka presisi melalui panel atribut numerik:

```
+---------------------------------------------------+
|               3D OBJECT PROPERTIES                |
+---------------------------------------------------+
| OBJECT ID: OBJ-RACK-A01                           |
| BUSINESS CODE: RACK-A01                           |
| TYPE: PARAMETRIC_PALLET_RACK                      |
+---------------------------------------------------+
| POSITION (METER):                                 |
| X: [ 12.50 ]    Y: [ 0.00  ]    Z: [ 45.00 ]     |
|                                                   |
| ROTATION (DEGREE):                                |
| RX: [ 0.0  ]    RY: [ 90.0 ]    RZ: [ 0.0   ]     |
|                                                   |
| DIMENSION (METER):                                |
| Width: [ 2.70 ] Depth: [ 1.10 ] Height: [ 6.00 ]  |
+---------------------------------------------------+
| RACK STRUCTURE:                                   |
| Levels: [ 5 ]    Bins per Level: [ 4 ]            |
+---------------------------------------------------+
| [ APPLY CHANGES ]              [ DELETE OBJECT ]  |
+---------------------------------------------------+
```

---

## 3. LAYOUT VERSIONING & PUBLISHING LIFECYCLE

Layout gudang 3D dikelola melalui siklus versi yang ketat untuk mencegah gangguan pada operasi gudang aktif:

```
[ DRAFT LAYOUT (v1.2-draft) ] ----(Validate & Publish)----> [ PUBLISHED LAYOUT (v1.2-live) ]
                                                                     |
                                                               (New Version)
                                                                     v
                                                            [ ARCHIVED LAYOUT (v1.1) ]
```

1. **`DRAFT`**: Layout dalam tahap perancangan atau simulasi. Tidak mempengaruhi penentuan lokasi transaksi live.
2. **`PUBLISHED`**: Layout resmi yang digunakan oleh sistem operasional live WMS.
3. **`ARCHIVED`**: Riwayat versi layout lama yang disimpan untuk keperluan audit sejarah spasial gudang.
