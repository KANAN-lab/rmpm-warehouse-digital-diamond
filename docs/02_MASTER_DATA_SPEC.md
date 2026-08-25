# 02_MASTER_DATA_SPEC.md

# SPESIFIKASI MASTER DATA (5 KELOMPOK UTAMA)

---

## 1. KELOMPOK A: PHYSICAL WAREHOUSE MASTER
Entitas master data fisik yang mendefinisikan seluruh elemen spasial pergudangan:

1. **Warehouse (`master_warehouses`)**: `id`, `code`, `name`, `address`, `status`, `created_at`, `updated_at`.
2. **Zone (`master_zones`)**: `id`, `warehouse_id`, `code`, `name`, `zone_type` (Dry, Cold, Hazard, General), `status`.
3. **Area (`master_areas`)**: `id`, `zone_id`, `code`, `name`, `status`.
4. **Lane / Line (`master_lanes`)**: `id`, `area_id`, `code`, `name`, `status`.
5. **Aisle (`master_aisles`)**: `id`, `lane_id`, `code`, `name`, `status`.
6. **Rack (`master_racks`)**: `id`, `aisle_id`, `code`, `name`, `rack_type_id`, `width`, `depth`, `height`, `status`.
7. **Rack Type (`master_rack_types`)**: `id`, `code`, `name`, `max_weight_capacity`, `max_levels`, `status`.
8. **Level (`master_levels`)**: `id`, `rack_id`, `level_number`, `code`, `height_offset`, `status`.
9. **Bin (`master_bins`)**: `id`, `level_id`, `code`, `name`, `barcode`, `qr_code`, `max_weight`, `max_volume`, `max_pallets`, `storage_type_id`, `status`.
10. **Storage Type (`master_storage_types`)**: `id`, `code`, `name`, `description`, `status`.
11. **Staging Area (`master_staging_areas`)**: `id`, `warehouse_id`, `code`, `name`, `staging_type` (Inbound, Outbound), `status`.
12. **Quarantine Area (`master_quarantine_areas`)**: `id`, `warehouse_id`, `code`, `name`, `status`.
13. **Dock & Door (`master_docks`, `master_doors`)**: `id`, `warehouse_id`, `code`, `dock_type` (Inbound, Outbound, Bi-directional), `status`.
14. **Floor, Room, Temp Zone, Hazard Zone**: Entitas atribut fisik tambahan sesuai kebutuhan operasional.

---

## 2. KELOMPOK B: INVENTORY MASTER
Entitas induk material dan spesifikasi fisik barang:

1. **Material (`master_materials`)**: `id`, `code`, `name`, `category_id`, `group_id`, `type_id`, `uom_id`, `shelf_life_days`, `is_batch_managed`, `is_mid_managed`, `status`.
2. **Material Category & Group**: Pengelompokan hirarki material (Raw Material, Packaging Material).
3. **Batch (`master_batches`)**: `id`, `material_id`, `batch_number`, `manufacture_date`, `expiry_date`, `vendor_batch_no`, `status`.
4. **MID (`master_mids`)**: Material Identification Tag. `id`, `mid_code`, `material_id`, `batch_id`, `initial_qty`, `current_qty`, `uom_id`, `status`.
5. **Pallet (`master_pallets`)**: `id`, `pallet_code`, `pallet_type`, `max_weight`, `status`.
6. **Container (`master_containers`)**: `id`, `container_code`, `container_type`, `status`.
7. **UOM & Conversion (`master_uoms`, `master_uom_conversions`)**: `id`, `from_uom_id`, `to_uom_id`, `conversion_factor`.
8. **Packaging Config, Dimensions, Weight, Volume, Shelf Life Rules**.

---

## 3. KELOMPOK C: OPERATION MASTER
Aturan-aturan bisnis operasional pergudangan:

1. **Putaway Rules (`master_rules_putaway`)**: Aturan penentuan lokasi tujuan berdasarkan jenis material dan zona.
2. **Picking Rules (`master_rules_picking`)**: Prioritas pengalokasian stok (FIFO, FEFO).
3. **Replenishment Rules (`master_rules_replenishment`)**: Ambang batas stok minimum/maksimum di bin picking.
4. **Cycle Count Rules (`master_rules_cycle_count`)**: Frekuensi dan metode Blind SO.
5. **Tolerance Rules & Approval Rules (`master_rules_tolerance`)**: Batas toleransi selisih kuantitas & persetujuan bertingkat.

---

## 4. KELOMPOK D: SECURITY MASTER
Pengaturan keamanan dan otorisasi:

1. **User (`master_users`)**: `id`, `username`, `email`, `full_name`, `password_hash`, `department_id`, `status`.
2. **Role & Permission (`master_roles`, `master_permissions`, `master_role_permissions`)**: Matriks RBAC.
3. **Device & PDA (`master_devices`)**: `id`, `device_code`, `device_type` (PDA Scanner, Tablet), `mac_address`, `assigned_user_id`, `status`.
4. **Warehouse Assignment (`master_user_warehouses`)**: Pemetaan hak akses gudang per pengguna.

---

## 5. KELOMPOK E: 3D DIGITAL TWIN MASTER
Data visualisasi dan tata letak 3D:

1. **3D Object (`layout3d_objects`)**: `id`, `business_entity_id`, `business_entity_type` (RACK, BIN, ZONE), `template_id`, `x_pos`, `y_pos`, `z_pos`, `rot_x`, `rot_y`, `rot_z`, `scale_x`, `scale_y`, `scale_z`, `status`.
2. **3D Template (`layout3d_templates`)**: Preset geometri 3D untuk Rak, Bin, Palet.
3. **Layout Version (`layout3d_versions`)**: `id`, `version_number`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `created_by`, `published_at`.
4. **Camera Preset & Display Rules**: Pengaturan sudut pandang kamera dan skema warna visualisasi.
