# 29_DEPLOYMENT_SPEC.md

# SPESIFIKASI DEPLOYMENT & ENVIRONMENT CONFIGURATION

---

## 1. ENVIRONMENT CONFIGURATION

Aplikasi mendukung 4 tingkatan lingkungan (*environments*): `DEVELOPMENT`, `TESTING`, `STAGING`, `PRODUCTION`.

Variabel lingkungan (*Environment Variables*) dikelola menggunakan file `.env` yang tidak boleh di-commit ke repositori Git:
- `DATABASE_URL`: Kredensial koneksi database PostgreSQL / PostGIS.
- `JWT_SECRET`: Kunci enkripsi token otentikasi.
- `REDIS_URL`: Kredensial Redis untuk Pub/Sub Event Bus & Session Store.
- `LOG_LEVEL`: Tingkat kedalaman logging (`DEBUG`, `INFO`, `WARN`, `ERROR`).

---

## 2. DOCKER & CONTAINERIZATION

Aplikasi dikemas menggunakan Docker Container:
- `Dockerfile.backend`: Build image REST API Backend Service.
- `Dockerfile.frontend`: Build static web assets (Three.js Control Tower App).
- `docker-compose.yml`: Mengorkestrasi Service Backend, Frontend, Database PostgreSQL, dan Redis Message Broker.
