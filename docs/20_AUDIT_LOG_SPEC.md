# 20_AUDIT_LOG_SPEC.md

# SPESIFIKASI AUDIT LOGGING & SECURITY TRAIL

---

## 1. AUDIT LOGGING CAPTURE REQUIREMENTS

Setiap aksi sistem yang mengubah data (*CUD Operations*), pengubahan status, eksekusi transaksi, atau login pengguna wajib mencatat log audit ke dalam tabel `audit_logs`:

- `audit_id` (UUID Primary Key)
- `timestamp` (Timestamp ISO-8601 dengan timezone)
- `user_id` (UUID Operator / User)
- `device_id` (UUID PDA / PC Browser)
- `ip_address` (String Alamat IP)
- `action` (Enum Action: `CREATE`, `UPDATE`, `DELETE_SOFT`, `APPROVE`, `REJECT`, `LOGIN`, `SYNC_OFFLINE`)
- `entity_type` (Nama Entitas: `master_bins`, `inventory_balances`, `cycle_count_entries`, dll)
- `entity_id` (UUID Entitas Target)
- `before_state` (JSONB Snapshot data sebelum pengubahan)
- `after_state` (JSONB Snapshot data setelah pengubahan)
- `reason_code` (Kode Alasan / Keterangan Bisnis)
- `correlation_id` (UUID Tracking Request Session)

---

## 2. POLISA RETENSI & IMMUTABILITY AUDIT LOG

- **Immutability**: Tabel `audit_logs` diset dengan izin database *append-only*. Dilarang keras melakukan `UPDATE` atau `DELETE` pada baris audit log.
- **Retention Policy**: Log audit disimpan sekurang-kurangnya 7 tahun untuk memenuhi persyaratan compliance audit pergudangan manufaktur dan ISO.
