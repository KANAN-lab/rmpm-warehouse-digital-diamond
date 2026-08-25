-- ============================================================
-- RMPM WAREHOUSE DIGITAL TWIN - COMPLETE DDL SQL SCHEMA
-- LOGICAL SCHEMAS: master_*, inventory_*, txn_*, cycle_count_*, layout3d_*, audit_*
-- ============================================================

-- CREATE LOGICAL SCHEMAS
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS txn;
CREATE SCHEMA IF NOT EXISTS cycle_count;
CREATE SCHEMA IF NOT EXISTS layout3d;
CREATE SCHEMA IF NOT EXISTS audit;

-- ------------------------------------------------------------
-- 1. SECURITY MASTER DATA (master.*)
-- ------------------------------------------------------------
CREATE TABLE master.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE master.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES master.departments(id),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE master.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    module VARCHAR(64) NOT NULL,
    description TEXT
);

CREATE TABLE master.role_permissions (
    role_id UUID REFERENCES master.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES master.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE master.user_roles (
    user_id UUID REFERENCES master.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES master.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE master.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(64) UNIQUE NOT NULL,
    device_type VARCHAR(32) NOT NULL, -- 'PDA_SCANNER', 'TABLET', 'DESKTOP'
    mac_address VARCHAR(64) UNIQUE NOT NULL,
    assigned_user_id UUID REFERENCES master.users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    last_sync_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- 2. PHYSICAL WAREHOUSE MASTER DATA (master.*)
-- ------------------------------------------------------------
CREATE TABLE master.warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    address TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE master.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL REFERENCES master.warehouses(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    zone_type VARCHAR(64) NOT NULL, -- 'DRY', 'COLD', 'HAZARD', 'STAGING'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL REFERENCES master.zones(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.lanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES master.areas(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.aisles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lane_id UUID NOT NULL REFERENCES master.lanes(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.rack_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    max_levels INT NOT NULL DEFAULT 5,
    max_weight_capacity NUMERIC(12, 2) NOT NULL DEFAULT 5000.00
);

CREATE TABLE master.racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aisle_id UUID NOT NULL REFERENCES master.aisles(id),
    rack_type_id UUID REFERENCES master.rack_types(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    width NUMERIC(8, 2) NOT NULL DEFAULT 2.70,
    depth NUMERIC(8, 2) NOT NULL DEFAULT 1.10,
    height NUMERIC(8, 2) NOT NULL DEFAULT 6.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID NOT NULL REFERENCES master.racks(id),
    level_number INT NOT NULL,
    code VARCHAR(64) NOT NULL,
    height_offset NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.storage_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT
);

CREATE TABLE master.bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES master.levels(id),
    storage_type_id UUID REFERENCES master.storage_types(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    barcode VARCHAR(128) UNIQUE NOT NULL,
    qr_code VARCHAR(128),
    max_weight NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
    max_volume NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    max_pallets INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    x_pos NUMERIC(10, 3) DEFAULT 0.00,
    y_pos NUMERIC(10, 3) DEFAULT 0.00,
    z_pos NUMERIC(10, 3) DEFAULT 0.00
);

-- ------------------------------------------------------------
-- 3. INVENTORY MASTER DATA (master.*)
-- ------------------------------------------------------------
CREATE TABLE master.uoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL,
    uom_type VARCHAR(32) NOT NULL -- 'WEIGHT', 'VOLUME', 'PIECE', 'PALLET'
);

CREATE TABLE master.uom_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_uom_id UUID NOT NULL REFERENCES master.uoms(id),
    to_uom_id UUID NOT NULL REFERENCES master.uoms(id),
    conversion_factor NUMERIC(14, 6) NOT NULL
);

CREATE TABLE master.material_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL
);

CREATE TABLE master.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES master.material_categories(id),
    uom_id UUID NOT NULL REFERENCES master.uoms(id),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    shelf_life_days INT DEFAULT 365,
    is_batch_managed BOOLEAN DEFAULT TRUE,
    is_mid_managed BOOLEAN DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES master.materials(id),
    batch_number VARCHAR(128) NOT NULL,
    vendor_batch_no VARCHAR(128),
    manufacture_date DATE,
    expiry_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    UNIQUE(material_id, batch_number)
);

CREATE TABLE master.mids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES master.materials(id),
    batch_id UUID REFERENCES master.batches(id),
    mid_code VARCHAR(128) UNIQUE NOT NULL,
    initial_qty NUMERIC(14, 4) NOT NULL,
    current_qty NUMERIC(14, 4) NOT NULL,
    uom_id UUID NOT NULL REFERENCES master.uoms(id),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE master.pallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pallet_code VARCHAR(128) UNIQUE NOT NULL,
    pallet_type VARCHAR(64) DEFAULT 'EURO_PALLET',
    status VARCHAR(32) DEFAULT 'ACTIVE'
);

-- ------------------------------------------------------------
-- 4. OPERATION MASTER DATA (master.*)
-- ------------------------------------------------------------
CREATE TABLE master.rules_tolerance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    min_variance_pct NUMERIC(6, 2) DEFAULT 0.00,
    max_variance_pct NUMERIC(6, 2) DEFAULT 1.00,
    required_approval_role VARCHAR(64) DEFAULT 'SUPERVISOR'
);

-- ------------------------------------------------------------
-- 5. 3D DIGITAL TWIN MASTER DATA (layout3d.*)
-- ------------------------------------------------------------
CREATE TABLE layout3d.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    template_type VARCHAR(64) NOT NULL, -- 'RACK_PALLET', 'BIN_CELL', 'ZONE_BOUNDARY'
    geometry_json JSONB NOT NULL
);

CREATE TABLE layout3d.versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_number VARCHAR(32) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PUBLISHED', 'ARCHIVED'
    created_by UUID REFERENCES master.users(id),
    published_at TIMESTAMPTZ
);

CREATE TABLE layout3d.objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_version_id UUID REFERENCES layout3d.versions(id),
    business_entity_id UUID NOT NULL,
    business_entity_type VARCHAR(64) NOT NULL, -- 'RACK', 'BIN', 'ZONE'
    template_id UUID REFERENCES layout3d.templates(id),
    x_pos NUMERIC(10, 3) NOT NULL DEFAULT 0.00,
    y_pos NUMERIC(10, 3) NOT NULL DEFAULT 0.00,
    z_pos NUMERIC(10, 3) NOT NULL DEFAULT 0.00,
    rot_x NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    rot_y NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    rot_z NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    scale_x NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    scale_y NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
    scale_z NUMERIC(6, 2) NOT NULL DEFAULT 1.00
);

-- ------------------------------------------------------------
-- MANDATORY INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------
CREATE INDEX idx_bins_code ON master.bins(code);
CREATE INDEX idx_bins_barcode ON master.bins(barcode);
CREATE INDEX idx_mids_code ON master.mids(mid_code);
CREATE INDEX idx_materials_code ON master.materials(code);
CREATE INDEX idx_batches_no ON master.batches(batch_number);
