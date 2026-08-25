"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchInventoryBalances = exports.transitionInventoryStatus = exports.validateStatusTransition = exports.mockInventoryBalances = void 0;
// Allowed State Machine Transitions Matrix
const ALLOWED_TRANSITIONS = {
    AVAILABLE: ['ALLOCATED', 'BLOCKED', 'QUARANTINE', 'HOLD', 'IN_TRANSIT'],
    ALLOCATED: ['PICKED', 'AVAILABLE', 'HOLD'],
    PICKED: ['STAGED', 'AVAILABLE', 'HOLD'],
    STAGED: ['AVAILABLE', 'HOLD'],
    IN_TRANSIT: ['AVAILABLE', 'HOLD'],
    BLOCKED: ['AVAILABLE', 'QUARANTINE', 'DAMAGED', 'HOLD'],
    QUARANTINE: ['AVAILABLE', 'DAMAGED', 'EXPIRED', 'BLOCKED', 'HOLD'],
    HOLD: ['AVAILABLE', 'QUARANTINE', 'BLOCKED', 'DAMAGED'],
    DAMAGED: ['HOLD', 'EXPIRED'],
    EXPIRED: ['HOLD'],
    UNKNOWN: ['QUARANTINE', 'HOLD', 'AVAILABLE']
};
// In-Memory Storage for Current Inventory Balances
exports.mockInventoryBalances = [
    {
        id: 'inv-bal-001',
        locationId: 'loc-bin-a01-l02-b04',
        locationCode: 'A01-R03-L02-B04',
        materialId: 'mat-001',
        materialCode: 'RM-RESIN-001',
        materialName: 'Polypropylene Resin Pellets',
        batchId: 'batch-001',
        batchNumber: 'BATCH-RM-88421',
        midCode: 'MID-2026-994821',
        palletCode: 'PAL-EUR-001',
        quantity: 1000.00,
        uom: 'KG',
        status: 'AVAILABLE',
        manufactureDate: '2026-01-15',
        expiryDate: '2027-01-15',
        receiptDate: '2026-02-01T10:00:00Z',
        lastMovementAt: '2026-02-01T10:30:00Z',
        qualityStatus: 'PASSED'
    },
    {
        id: 'inv-bal-002',
        locationId: 'loc-bin-a01-l01-b01',
        locationCode: 'A01-R01-L01-B01',
        materialId: 'mat-002',
        materialCode: 'PM-BOTTLE-500',
        materialName: 'PET Preform Bottle 500ml',
        batchId: 'batch-002',
        batchNumber: 'BATCH-PM-99120',
        midCode: 'MID-2026-110293',
        palletCode: 'PAL-EUR-002',
        quantity: 5000.00,
        uom: 'PCS',
        status: 'AVAILABLE',
        manufactureDate: '2026-02-01',
        expiryDate: '2028-02-01',
        receiptDate: '2026-02-05T08:00:00Z',
        lastMovementAt: '2026-02-05T09:00:00Z',
        qualityStatus: 'PASSED'
    }
];
// Validate Inventory Status Transition
const validateStatusTransition = (currentStatus, targetStatus) => {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (allowed.includes(targetStatus)) {
        return { isValid: true };
    }
    return {
        isValid: false,
        reason: `Transisi status tidak valid! Stok dari status '${currentStatus}' tidak dapat langsung diubah menjadi '${targetStatus}'.`
    };
};
exports.validateStatusTransition = validateStatusTransition;
// Execute Inventory Status Transition
const transitionInventoryStatus = (midCode, targetStatus, reasonCode) => {
    const item = exports.mockInventoryBalances.find(b => b.midCode === midCode);
    if (!item) {
        return { success: false, error: `Stok dengan Tag MID '${midCode}' tidak ditemukan.` };
    }
    const validation = (0, exports.validateStatusTransition)(item.status, targetStatus);
    if (!validation.isValid) {
        return { success: false, error: validation.reason };
    }
    const oldStatus = item.status;
    item.status = targetStatus;
    item.lastMovementAt = new Date().toISOString();
    return { success: true, item };
};
exports.transitionInventoryStatus = transitionInventoryStatus;
// Search Inventory Balances
const searchInventoryBalances = (filters) => {
    return exports.mockInventoryBalances.filter(item => {
        if (filters.midCode && !item.midCode.toLowerCase().includes(filters.midCode.toLowerCase()))
            return false;
        if (filters.materialCode && !item.materialCode.toLowerCase().includes(filters.materialCode.toLowerCase()))
            return false;
        if (filters.batchNumber && !item.batchNumber?.toLowerCase().includes(filters.batchNumber.toLowerCase()))
            return false;
        if (filters.palletCode && !item.palletCode?.toLowerCase().includes(filters.palletCode.toLowerCase()))
            return false;
        if (filters.locationCode && !item.locationCode.toLowerCase().includes(filters.locationCode.toLowerCase()))
            return false;
        if (filters.status && item.status !== filters.status)
            return false;
        return true;
    });
};
exports.searchInventoryBalances = searchInventoryBalances;
