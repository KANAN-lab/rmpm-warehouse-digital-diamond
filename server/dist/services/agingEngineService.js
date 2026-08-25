"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpiryAlerts = exports.getAgingSummaryReport = exports.calculateMaterialAging = void 0;
const inventoryStateService_js_1 = require("./inventoryStateService.js");
// 1. Calculate Age in Days & Map to Dynamic Aging Buckets
const calculateMaterialAging = (item) => {
    const now = new Date();
    const receipt = new Date(item.receiptDate);
    const diffTime = Math.abs(now.getTime() - receipt.getTime());
    const ageInDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let agingBucket = 'BUCKET_0_30';
    let colorHex = '#10b981'; // Green: Fresh 0-30 days
    if (ageInDays > 180) {
        agingBucket = 'BUCKET_180_PLUS';
        colorHex = '#ef4444'; // Red: Stagnant > 180 days
    }
    else if (ageInDays > 90) {
        agingBucket = 'BUCKET_91_180';
        colorHex = '#f97316'; // Orange: Critical 91-180 days
    }
    else if (ageInDays > 60) {
        agingBucket = 'BUCKET_61_90';
        colorHex = '#eab308'; // Yellow: 61-90 days
    }
    else if (ageInDays > 30) {
        agingBucket = 'BUCKET_31_60';
        colorHex = '#38bdf8'; // Blue: 31-60 days
    }
    // Calculate Expiry Warning
    let daysToExpiry;
    let isNearExpiry = false;
    if (item.expiryDate) {
        const expDate = new Date(item.expiryDate);
        const expDiff = expDate.getTime() - now.getTime();
        daysToExpiry = Math.floor(expDiff / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 30) {
            isNearExpiry = true;
        }
    }
    return {
        midCode: item.midCode,
        materialCode: item.materialCode,
        materialName: item.materialName,
        locationCode: item.locationCode,
        quantity: item.quantity,
        uom: item.uom,
        receiptDate: item.receiptDate,
        ageInDays,
        agingBucket,
        expiryDate: item.expiryDate,
        daysToExpiry,
        isNearExpiry,
        colorHex
    };
};
exports.calculateMaterialAging = calculateMaterialAging;
// 2. Summary Breakdown of All Balances Across 5 Aging Buckets
const getAgingSummaryReport = () => {
    const agingDetails = inventoryStateService_js_1.mockInventoryBalances.map(exports.calculateMaterialAging);
    const buckets = {
        BUCKET_0_30: agingDetails.filter(d => d.agingBucket === 'BUCKET_0_30'),
        BUCKET_31_60: agingDetails.filter(d => d.agingBucket === 'BUCKET_31_60'),
        BUCKET_61_90: agingDetails.filter(d => d.agingBucket === 'BUCKET_61_90'),
        BUCKET_91_180: agingDetails.filter(d => d.agingBucket === 'BUCKET_91_180'),
        BUCKET_180_PLUS: agingDetails.filter(d => d.agingBucket === 'BUCKET_180_PLUS')
    };
    return {
        totalStockCount: agingDetails.length,
        bucketCounts: {
            '0-30 Days (Fresh)': buckets.BUCKET_0_30.length,
            '31-60 Days (Normal)': buckets.BUCKET_31_60.length,
            '61-90 Days (Warning)': buckets.BUCKET_61_90.length,
            '91-180 Days (Critical)': buckets.BUCKET_91_180.length,
            '180+ Days (Stagnant)': buckets.BUCKET_180_PLUS.length
        },
        details: agingDetails
    };
};
exports.getAgingSummaryReport = getAgingSummaryReport;
// 3. Expiry Warning Alerts (< 30 Days Remaining)
const getExpiryAlerts = () => {
    const agingDetails = inventoryStateService_js_1.mockInventoryBalances.map(exports.calculateMaterialAging);
    return agingDetails.filter(d => d.isNearExpiry);
};
exports.getExpiryAlerts = getExpiryAlerts;
