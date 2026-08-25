# 21_API_SPEC.md

# SPESIFIKASI REST API CONTRACT & PAYLOADS

---

## 1. REST API STANDARDS

Seluruh API menggunakan format **RESTful JSON**:
- Headers: `Authorization: Bearer <JWT>`, `Content-Type: application/json`, `X-Correlation-ID: <UUID>`.

---

## 2. KEY ENDPOINTS SPECIFICATION

### A. Blind Cycle Count Endpoint (PDA Count Entry)
- **POST** `/api/v1/cycle-count/entries`
- **Request Payload**:
```json
{
  "cycle_count_id": "cc-20260825-00001",
  "target_id": "tgt-994812",
  "location_barcode": "A01-R03-L02-B04",
  "scanned_code": "MID-2026-994821",
  "batch_number": "BATCH-RM-88421",
  "physical_qty": 980.00,
  "uom": "KG",
  "input_mode": "SCAN",
  "device_id": "PDA-DEV-004"
}
```
- **Response Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "entry_id": "entry-88412",
    "status": "RECORDED",
    "timestamp": "2026-08-25T16:13:05Z"
  },
  "correlation_id": "req-9918234-abc"
}
```

### B. 3D Digital Twin Layout Endpoint
- **GET** `/api/v1/3d/layout/active`
- **Response Success (200 OK)**: Mengembalikan hierarki geometri objek 3D untuk instancing Three.js.

### C. Offline Sync Queue Endpoint
- **POST** `/api/v1/sync/pda-queue`
- **Request Payload**: Mengirimkan array transaksi yang tercatat selama PDA offline untuk validasi server dan resolusi konflik (`SYNC_CONFLICT`).
