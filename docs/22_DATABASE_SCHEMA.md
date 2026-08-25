# 22_DATABASE_SCHEMA.md

# SPESIFIKASI SKEMA DATABASE & INDEXING STRATEGY

---

## 1. LOGICAL SCHEMAS SEPARATION

Database memisahkan tabel secara terstruktur ke dalam 6 Logical Schema:

1. `master_*`: Menampung 5 kelompok Master Data (`master_warehouses`, `master_zones`, `master_racks`, `master_bins`, `master_materials`, `master_batches`, `master_mids`, `master_uoms`, `master_rules`, `master_users`, `master_roles`, dll).
2. `inventory_*`: Menampung Current Inventory State (`inventory_balances`, `inventory_mids`, `inventory_pallets`).
3. `txn_*`: Menampung Ledger Transaksi Imutabel (`inventory_transactions`).
4. `cycle_count_*`: Menampung data Blind SO (`cycle_count_orders`, `cycle_count_targets`, `cycle_count_entries`, `cycle_count_snapshots`, `cycle_count_impacts`).
5. `audit_*`: Menampung Security & Audit Trail (`audit_logs`, `system_event_logs`).
6. `layout3d_*`: Menampung Metadata Layout 3D (`layout3d_objects`, `layout3d_versions`, `layout3d_templates`).

---

## 2. DDL EXAMPLE & MANDATORY CONSTRAINTS

```sql
-- TABEL MASTER BINS
CREATE TABLE master_bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES master_levels(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    barcode VARCHAR(128) UNIQUE NOT NULL,
    max_weight NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
    max_volume NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL TRANSACTION LEDGER (APPEND-ONLY)
CREATE TABLE inventory_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(64) NOT NULL,
    source_location_id UUID REFERENCES master_bins(id),
    destination_location_id UUID REFERENCES master_bins(id),
    material_id UUID NOT NULL REFERENCES master_materials(id),
    batch_id UUID REFERENCES master_batches(id),
    mid_code VARCHAR(128),
    quantity NUMERIC(14, 4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES master_uoms(id),
    operator_id UUID NOT NULL REFERENCES master_users(id),
    device_id UUID REFERENCES master_devices(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference_document VARCHAR(128),
    reason_code VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    correlation_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB
);
```

---

## 3. INDEXING STRATEGY FOR HIGH PERFORMANCE

Indeks B-Tree & Composite Wajib untuk pencarian cepat:

```sql
CREATE INDEX idx_bins_code ON master_bins(code);
CREATE INDEX idx_bins_barcode ON master_bins(barcode);
CREATE INDEX idx_mids_code ON master_mids(mid_code);
CREATE INDEX idx_inv_bal_loc_mat ON inventory_balances(location_id, material_id);
CREATE INDEX idx_inv_bal_mid ON inventory_balances(mid_code);
CREATE INDEX idx_txn_timestamp ON inventory_transactions(timestamp);
CREATE INDEX idx_txn_corr_id ON inventory_transactions(correlation_id);
CREATE INDEX idx_cc_entries_order ON cycle_count_entries(cycle_count_id);
```
