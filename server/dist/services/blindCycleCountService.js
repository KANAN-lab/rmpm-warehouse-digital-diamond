"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignIndependentRecount = exports.calculateDynamicReconciliation = exports.recordBlindPhysicalCount = exports.getBlindTaskForCounter = exports.createCycleCountOrder = exports.mockCountEntries = exports.mockCycleCountOrders = void 0;
const uuid_1 = require("uuid");
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const eventBus_js_1 = require("./eventBus.js");
// In-Memory Storage for Cycle Count
exports.mockCycleCountOrders = [];
exports.mockCountEntries = [];
// 1. Create Cycle Count Order & Generate Snapshot at t_0
const createCycleCountOrder = (params) => {
    const orderId = `cc-${Date.now()}`;
    const orderCode = `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    // Capture Inventory Snapshot at Start (t_0)
    const snapshots = inventoryStateService_js_1.mockInventoryBalances.map(b => ({
        snapshotId: `snap-${(0, uuid_1.v4)().substring(0, 8)}`,
        cycleCountId: orderId,
        locationCode: b.locationCode,
        materialCode: b.materialCode,
        batchNumber: b.batchNumber,
        midCode: b.midCode,
        systemQtyAtStart: b.quantity,
        uom: b.uom,
        snapshotTimestamp: new Date().toISOString()
    }));
    // Create Targets
    const targets = snapshots.map(s => ({
        targetId: `tgt-${(0, uuid_1.v4)().substring(0, 8)}`,
        cycleCountId: orderId,
        locationCode: s.locationCode,
        expectedMaterialCode: s.materialCode,
        state: 'NOT_STARTED'
    }));
    const newOrder = {
        orderId,
        orderCode,
        mode: params.mode,
        targetCriteria: params.targetCriteria,
        status: 'ACTIVE',
        createdBy: params.createdBy,
        createdAt: new Date().toISOString(),
        snapshots,
        targets,
        impactEvents: []
    };
    exports.mockCycleCountOrders.push(newOrder);
    eventBus_js_1.eventBus.publish('CycleCountStarted', { orderId, orderCode, mode: params.mode }, params.correlationId);
    return newOrder;
};
exports.createCycleCountOrder = createCycleCountOrder;
// 2. Get Blind Task Screen for Counter (MUTLAK HIDE SYSTEM QTY & VARIANCE)
const getBlindTaskForCounter = (taskId) => {
    let foundTarget;
    let foundOrder;
    for (const order of exports.mockCycleCountOrders) {
        const tgt = order.targets.find(t => t.targetId === taskId);
        if (tgt) {
            foundTarget = tgt;
            foundOrder = order;
            break;
        }
    }
    if (!foundTarget || !foundOrder) {
        return null;
    }
    // RETURN BLIND SCREEN PAYLOAD ONLY (NO systemQty, NO expectedQty, NO variance)
    return {
        taskId: foundTarget.targetId,
        orderCode: foundOrder.orderCode,
        locationCode: foundTarget.locationCode,
        state: foundTarget.state,
        instruction: 'Scan lokasi, scan MID/Material, dan masukkan kuantitas fisik murni.',
        // HIDE ALL SYSTEM NUMBERS
        systemQuantityHidden: true
    };
};
exports.getBlindTaskForCounter = getBlindTaskForCounter;
// 3. Record Blind Physical Count Entry
const recordBlindPhysicalCount = (params) => {
    const entryId = `entry-${Date.now()}`;
    const entry = {
        entryId,
        cycleCountId: params.cycleCountId,
        targetId: params.targetId,
        locationCode: params.locationCode,
        scannedCode: params.scannedCode,
        batchNumber: params.batchNumber,
        physicalQty: params.physicalQty,
        uom: params.uom,
        isLocationEmpty: params.isLocationEmpty,
        counterUserId: params.counterUserId,
        counterUsername: params.counterUsername,
        inputMode: params.inputMode,
        counterAttempt: params.counterAttempt || 'COUNT_A',
        timestamp: new Date().toISOString()
    };
    exports.mockCountEntries.push(entry);
    // Update target state
    const order = exports.mockCycleCountOrders.find(o => o.orderId === params.cycleCountId);
    if (order) {
        const target = order.targets.find(t => t.targetId === params.targetId);
        if (target) {
            target.state = 'COUNTED';
        }
    }
    eventBus_js_1.eventBus.publish('CountRecorded', { entryId, locationCode: params.locationCode }, params.correlationId);
    return entry;
};
exports.recordBlindPhysicalCount = recordBlindPhysicalCount;
// 4. Dynamic Reconciliation Engine (Supervisor Only)
const calculateDynamicReconciliation = (orderId) => {
    const order = exports.mockCycleCountOrders.find(o => o.orderId === orderId);
    if (!order)
        return null;
    const entries = exports.mockCountEntries.filter(e => e.cycleCountId === orderId);
    const reconciliationReport = order.snapshots.map(snap => {
        const matchingEntries = entries.filter(e => e.locationCode === snap.locationCode);
        const physicalQty = matchingEntries.reduce((sum, e) => sum + e.physicalQty, 0);
        // Movement during count impact calculation
        const impacts = order.impactEvents.filter(i => i.locationCode === snap.locationCode);
        const totalImpactQty = impacts.reduce((sum, i) => sum + i.quantity, 0);
        const adjustedSystemQty = snap.systemQtyAtStart + totalImpactQty;
        const variance = physicalQty - adjustedSystemQty;
        const hasWrongLocation = matchingEntries.some(e => e.scannedCode !== snap.midCode && e.scannedCode !== snap.materialCode);
        return {
            locationCode: snap.locationCode,
            materialCode: snap.materialCode,
            midCode: snap.midCode,
            systemQtyAtStart: snap.systemQtyAtStart,
            impactAdjustments: totalImpactQty,
            adjustedExpectedQty: adjustedSystemQty,
            physicalQtyCounted: physicalQty,
            variance,
            variancePercentage: adjustedSystemQty > 0 ? (variance / adjustedSystemQty) * 100 : 0,
            isWrongLocation: hasWrongLocation,
            needsRecount: Math.abs(variance) > 5 // Example threshold
        };
    });
    const totalTargets = order.targets.length;
    const completedTargets = order.targets.filter(t => t.state === 'COUNTED' || t.state === 'VERIFIED' || t.state === 'COMPLETED').length;
    const completionRate = totalTargets > 0 ? (completedTargets / totalTargets) * 100 : 0;
    return {
        orderCode: order.orderCode,
        completionRatePct: completionRate,
        totalTargets,
        completedTargets,
        reconciliationReport
    };
};
exports.calculateDynamicReconciliation = calculateDynamicReconciliation;
// 5. Assign Independent Recount (Counter B)
const assignIndependentRecount = (orderId, targetId, counterBUserId, correlationId) => {
    const order = exports.mockCycleCountOrders.find(o => o.orderId === orderId);
    if (!order)
        return { success: false, error: 'Order SO tidak ditemukan.' };
    const target = order.targets.find(t => t.targetId === targetId);
    if (!target)
        return { success: false, error: 'Target SO tidak ditemukan.' };
    target.state = 'RECOUNT_REQUIRED';
    target.counterBUserId = counterBUserId;
    eventBus_js_1.eventBus.publish('RecountRequested', { orderId, targetId, counterBUserId }, correlationId);
    return { success: true, message: `Recount Counter B berhasil dialokasikan untuk target '${targetId}'.` };
};
exports.assignIndependentRecount = assignIndependentRecount;
