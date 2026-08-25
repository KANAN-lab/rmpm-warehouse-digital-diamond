# 25_SECURITY_SPEC.md

# SPESIFIKASI KEAMANAN SISTEM, OTENTIKASI & ENKRIPSI

---

## 1. AUTHENTICATION & DEVICE BINDING

- **User Authentication**: Otentikasi berbasis token JWT terenkripsi dengan durasi kedaluwarsa terkonfigurasi.
- **Device Registry Binding**: Setiap PDA / Scanner terdaftar di tabel `master_devices` berdasarkan `mac_address` dan `device_code`. Pengoperasian PDA dibatasi hanya untuk perangkat terotorisasi yang terhubung dengan akun pengguna aktif.

---

## 2. DATA ENCRYPTION & SECURE STORAGE

- **Data in Transit**: Seluruh komunikasi HTTP antara browser Web, PDA Mobile, dan REST Server API wajib menggunakan protokol TLS 1.3 (HTTPS).
- **Data at Rest**: Enkripsi password menggunakan algoritma Argon2id / bcrypt dengan *cost factor* tinggi. Enkripsi kunci rahasia dan kredensial integrasi ERP di database menggunakan AES-256-GCM.
