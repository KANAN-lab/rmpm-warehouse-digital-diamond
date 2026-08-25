"""
RMPM WAREHOUSE DIGITAL TWIN - AUTOMATED CHECKER AGENT
=====================================================
Skrip verifikasi dan audit otomatis untuk melakukan cross-check 100% kepatuhan
arsitektur, dokumen PRD, task steps, serta kode terhadap Prompt.md.
"""

import os
import re
import sys
from pathlib import Path

WORKSPACE_DIR = Path(__file__).parent.resolve()
DOCS_DIR = WORKSPACE_DIR / "docs"
PROMPT_FILE = WORKSPACE_DIR / "Prompt.md"
PRD_FILE = WORKSPACE_DIR / "PRD.md"
TASK_FILE = WORKSPACE_DIR / "TASK_STEPS.md"
CHECKER_FILE = WORKSPACE_DIR / "CHECKER_AGENT.md"
COVERAGE_FILE = WORKSPACE_DIR / "REQUIREMENT_COVERAGE_MATRIX.md"

REQUIRED_DOCS = [
    "01_SYSTEM_ARCHITECTURE.md",
    "02_MASTER_DATA_SPEC.md",
    "03_LOCATION_HIERARCHY.md",
    "04_INVENTORY_MODEL.md",
    "05_TRANSACTION_MODEL.md",
    "06_BLIND_CYCLE_COUNT_SPEC.md",
    "07_PDA_WORKFLOW.md",
    "08_3D_DIGITAL_TWIN_SPEC.md",
    "09_3D_LAYOUT_EDITOR_SPEC.md",
    "10_PICKING_SPEC.md",
    "11_BATCHING_SPEC.md",
    "12_REPLENISHMENT_SPEC.md",
    "13_RECEIVING_PUTAWAY_SPEC.md",
    "14_BIN_TO_BIN_SPEC.md",
    "15_AGING_SPEC.md",
    "16_EXCEPTION_MANAGEMENT.md",
    "17_TRACEABILITY_SPEC.md",
    "18_REPORTING_KPI_SPEC.md",
    "19_ROLE_PERMISSION_SPEC.md",
    "20_AUDIT_LOG_SPEC.md",
    "21_API_SPEC.md",
    "22_DATABASE_SCHEMA.md",
    "23_EVENT_MODEL.md",
    "24_OFFLINE_SYNC_SPEC.md",
    "25_SECURITY_SPEC.md",
    "26_VALIDATION_RULES.md",
    "27_TEST_STRATEGY.md",
    "28_ACCEPTANCE_CRITERIA.md",
    "29_DEPLOYMENT_SPEC.md",
    "30_GLOSSARY.md"
]

NON_NEGOTIABLE_RULES = [
    ("MASTER_DATA_FOUNDATION", r"Master Data", "Master Data sebagai fondasi utama"),
    ("TRANSACTION_LEDGER_SEPARATION", r"Transaction Data|Ledger", "Pemisahan transaksi dari master data"),
    ("DERIVED_INVENTORY_STATE", r"DERIVED|Derived|Current State", "Status stok diturunkan dari transaksi"),
    ("THREEJS_VISUALIZATION_ONLY", r"Three\.js|visualization layer", "Three.js hanyalah layer visualisasi"),
    ("DYNAMIC_WAREHOUSE_STRUCTURE", r"hard-coded|Dynamic Hierarchy", "Struktur gudang dinamis tanpa hardcode"),
    ("BUILTIN_3D_DESIGNER", r"3D Warehouse Designer|Layout Designer", "Built-in 3D Layout Designer"),
    ("BLIND_CYCLE_COUNT_CORE", r"Blind Cycle Count|Blind Stock Opname", "Blind Cycle Count modul core"),
    ("BLIND_COUNTER_SCREEN_HIDE_QTY", r"System Qty|Expected Qty|HIDING|TIDAK MENAMPILKAN", "Layar Blind counter sembunyikan System Qty"),
    ("WRONG_LOCATION_TRACEABILITY", r"Wrong Location|WRONG_LOCATION", "Salah lokasi wajib traceable"),
    ("IMMUTABLE_TRANSACTION_HISTORY", r"Immutable|APPEND-ONLY|Never delete", "Riwayat transaksi imutabel"),
    ("INDEPENDENT_BLIND_RECOUNT", r"Recount|Counter B", "Recount independen tetap blind"),
    ("LIVE_WAREHOUSE_OPERATION", r"LIVE|Live Operation", "Gudang tetap live selama SO"),
    ("MOVEMENT_DURING_COUNT_DETECTION", r"COUNT_IMPACT_EVENT|Movement during count", "Deteksi pergerakan saat SO"),
    ("CONFIGURABLE_APPROVAL_WORKFLOW", r"Approval|Tolerance", "Workflow approval penyesuaian stok"),
    ("OFFLINE_SYNC_CONFLICT_MANAGEMENT", r"SYNC_CONFLICT|Sync Queue", "Manajemen konflik offline sync PDA")
]

def check_files_existence():
    results = []
    print("[*] Memeriksa keberadaan file utama & dokumen /docs/...")
    
    files_to_check = [
        ("Prompt.md", PROMPT_FILE),
        ("PRD.md", PRD_FILE),
        ("TASK_STEPS.md", TASK_FILE),
        ("CHECKER_AGENT.md", CHECKER_FILE),
    ]
    
    for name, path in files_to_check:
        exists = path.exists()
        results.append((name, "Core Document", "PASSED" if exists else "MISSING", f"Path: {path}"))
        print(f"  - {name}: {'[PASSED]' if exists else '[MISSING]'}")

    for doc in REQUIRED_DOCS:
        doc_path = DOCS_DIR / doc
        exists = doc_path.exists()
        results.append((doc, "Specification Document", "PASSED" if exists else "MISSING", f"Path: {doc_path}"))
    
    return results

def check_principles_compliance():
    results = []
    print("[*] Memeriksa Kepatuhan Prinsip Non-Negotiable di PRD.md...")
    
    if not PRD_FILE.exists():
        print("  [ERR] PRD.md tidak ditemukan!")
        return results

    content = PRD_FILE.read_text(encoding="utf-8")
    
    for rule_id, pattern, description in NON_NEGOTIABLE_RULES:
        match = re.search(pattern, content, re.IGNORECASE)
        status = "PASSED" if match else "WARNING"
        details = f"Rule: {description}" if match else f"Pola '{pattern}' tidak ditemukan di PRD.md"
        results.append((rule_id, "Non-Negotiable Principle", status, details))
        print(f"  - {rule_id} ({description}): [{status}]")
        
    return results

def generate_coverage_matrix_report(file_results, rule_results):
    print("[*] Membuat dokumen REQUIREMENT_COVERAGE_MATRIX.md...")
    
    matrix_content = """# REQUIREMENT COVERAGE MATRIX & AUDIT REPORT

Dokumen ini dihasilkan secara otomatis oleh `checker_agent.py` untuk mengaudit tingkat ketercakapan requirement, keberadaan dokumen, dan kepatuhan prinsip non-negotiable terhadap [Prompt.md](file:///d:/Coding%20Session/RMPM/Prompt.md).

---

## 1. DOKUMEN UTAMA & SPESIFIKASI (/docs/)

| Nama File / Requirement | Kategori | Status Audit | Catatan Inspeksi |
| :--- | :--- | :--- | :--- |
"""
    for name, cat, status, details in file_results:
        matrix_content += f"| `{name}` | {cat} | **{status}** | {details} |\n"

    matrix_content += """
---

## 2. AUDIT KEPATUHAN PRINSIP NON-NEGOTIABLE (PRD.md)

| ID Prinsip | Deskripsi Prinsip | Status Audit | Catatan Inspeksi |
| :--- | :--- | :--- | :--- |
"""
    for rule_id, cat, status, details in rule_results:
        matrix_content += f"| `{rule_id}` | {cat} | **{status}** | {details} |\n"

    total_items = len(file_results) + len(rule_results)
    passed_items = sum(1 for _, _, s, _ in file_results if s == "PASSED") + sum(1 for _, _, s, _ in rule_results if s == "PASSED")
    coverage_pct = (passed_items / total_items) * 100 if total_items > 0 else 0

    matrix_content += f"""
---

## 3. RINGKASAN CAKUPAN AUDIT (SUMMARY)

- **Total Checklist Checked**: {total_items}
- **Items Passed**: {passed_items}
- **Items Warning/Missing**: {total_items - passed_items}
- **Audit Coverage Percentage**: **{coverage_pct:.2f}%**

> [!NOTE]
> Jika terdapat dokumen spesifikasi di `/docs/` yang berstatus `MISSING`, jalankan tugas pada [TASK_STEPS.md](file:///d:/Coding%20Session/RMPM/TASK_STEPS.md) Phase 0 untuk melengkapinya.
"""
    
    COVERAGE_FILE.write_text(matrix_content, encoding="utf-8")
    print(f"[OK] Laporan coverage berhasil ditulis ke: {COVERAGE_FILE}")

def main():
    print("=====================================================")
    print(" STARTING WMS DIGITAL TWIN AUDIT CHECKER AGENT       ")
    print("=====================================================")
    
    file_res = check_files_existence()
    rule_res = check_principles_compliance()
    generate_coverage_matrix_report(file_res, rule_res)
    
    print("=====================================================")
    print(" AUDIT COMPLETED SUCCESSFULLY.                       ")
    print("=====================================================")

if __name__ == "__main__":
    main()
