# 27_TEST_STRATEGY.md

# SPESIFIKASI STRATEGI PENGUJIAN SISTEM (TEST STRATEGY)

---

## 1. TINGKATAN PENGUJIAN (TESTING LEVELS)

1. **Unit Testing**: Menguji logika bisnis terisolasi (kalkulasi variansi SO, formula UOM conversion, state machine transisi status).
2. **Integration Testing**: Menguji integrasi antara API Service, PostgreSQL Database, dan Event Bus Pub/Sub.
3. **API Contract Testing**: Memastikan payload Request/Response REST API sesuai dengan spesifikasi Swagger/OpenAPI.
4. **PDA Offline & Sync Testing**: Menguji antrean transaksi lokal SQLite pada PDA saat kondisi jaringan terputus dan pemulihan rekonsiliasi konflik (`SYNC_CONFLICT`).
5. **3D Interaction Testing**: Menguji keakuratan direct mapping antara objek 3D Three.js dan entitas database.
6. **Performance & Load Testing**: Menguji performa rendering 3D pada layout gudang skala besar (10,000+ bin) dan daya tahan API pada beban ribuan pemindaian PDA bersamaan.
