"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPickingExecution = exports.createPickListWithRoute = exports.allocateStockForPicking = exports.mockPickLists = void 0;
const inventoryStateService_js_1 = require("./inventoryStateService.js");
const transactionLedgerService_js_1 = require("./transactionLedgerService.js");
const eventBus_js_1 = require("./eventBus.js");
exports.mockPickLists = [];
// 1. Auto-Allocation Stock Engine (FIFO / FEFO)
const allocateStockForPicking = (materialCode, requestedQty, strategy = 'FEFO') => {
    // Filter available stock
    let availableStock = inventoryStateService_js_1.mockInventoryBalances.filter(b => b.materialCode === materialCode && b.status === 'AVAILABLE' && b.quantity > 0);
    // Sort based on strategy
    if (strategy === 'FEFO') {
        // First Expired First Out
        availableStock.sort((a, b) => {
            const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
            const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
            return dateA - dateB;
        });
    }
    else {
        // First In First Out
        availableStock.sort((a, b) => {
            return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
        });
    }
    let remaining = requestedQty;
    const allocatedItems = [];
    for (const item of availableStock) {
        if (remaining <= 0)
            break;
        allocatedItems.push(item);
        remaining -= item.quantity;
    }
    return {
        allocatedItems,
        unfulfilledQty: Math.max(0, remaining)
    };
};
exports.allocateStockForPicking = allocateStockForPicking;
// 2. Create Pick List & Optimize Route (Sort by Zone -> Aisle -> Bin)
const createPickListWithRoute = (params) => {
    const allocation = (0, exports.allocateStockForPicking)(params.materialCode, params.requestedQty, params.strategy);
    const pickListId = `picklist-${Date.now()}`;
    const pickListCode = `PICK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    let routeOrder = 1;
    const tasks = allocation.allocatedItems.map(item => ({
        taskId: `picktask-${Math.random().toString(36).substring(2, 7)}`,
        pickListId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        requestedQty: Math.min(item.quantity, params.requestedQty),
        allocatedQty: Math.min(item.quantity, params.requestedQty),
        pickedQty: 0,
        uom: item.uom,
        allocatedLocationCode: item.locationCode,
        allocatedMidCode: item.midCode,
        allocatedBatchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        receiptDate: item.receiptDate,
        status: 'ALLOCATED',
        pickRouteOrder: routeOrder++
    }));
    // Route Optimization: Sort by Location Code alphabetically
    tasks.sort((a, b) => a.allocatedLocationCode.localeCompare(b.allocatedLocationCode));
    tasks.forEach((t, index) => { t.pickRouteOrder = index + 1; });
    const pickList = {
        pickListId,
        pickListCode,
        strategy: params.strategy,
        status: allocation.unfulfilledQty > 0 ? 'SHORTAGE_FLAGGED' : 'CREATED',
        totalItems: tasks.length,
        createdBy: params.createdBy,
        createdAt: new Date().toISOString(),
        tasks
    };
    exports.mockPickLists.push(pickList);
    eventBus_js_1.eventBus.publish('InventoryPicked', { pickListCode, strategy: params.strategy, taskCount: tasks.length }, params.correlationId);
    return pickList;
};
exports.createPickListWithRoute = createPickListWithRoute;
// 3. Confirm PDA Picking Execution & Handle Shortage / Partial Picking
const confirmPickingExecution = (params) => {
    const pickList = exports.mockPickLists.find(p => p.pickListId === params.pickListId);
    if (!pickList)
        return { success: false, error: 'Pick List tidak ditemukan.' };
    const task = pickList.tasks.find(t => t.taskId === params.taskId);
    if (!task)
        return { success: false, error: 'Tugas picking tidak ditemukan.' };
    // Validate Location & MID
    if (task.allocatedLocationCode !== params.scannedLocationCode) {
        return { success: false, error: `Salah lokasi! Lokasi yang di-scan (${params.scannedLocationCode}) tidak sesuai alokasi (${task.allocatedLocationCode}).` };
    }
    if (task.allocatedMidCode !== params.scannedMidCode) {
        return { success: false, error: `Salah MID! Tag MID yang di-scan (${params.scannedMidCode}) tidak sesuai alokasi (${task.allocatedMidCode}).` };
    }
    task.pickedQty = params.actualPickedQty;
    if (params.actualPickedQty < task.allocatedQty) {
        task.status = 'PARTIAL';
    }
    else {
        task.status = 'PICKED';
    }
    // Record Immutable Picking Transaction
    (0, transactionLedgerService_js_1.recordTransaction)({
        transactionType: 'PICKING',
        sourceLocationCode: task.allocatedLocationCode,
        destinationLocationCode: 'STAGING-OUT-01',
        materialCode: task.materialCode,
        batchNumber: task.allocatedBatchNumber,
        midCode: task.allocatedMidCode,
        quantity: params.actualPickedQty,
        uom: task.uom,
        operatorId: params.operatorId,
        operatorUsername: params.operatorUsername,
        referenceDocument: pickList.pickListCode,
        reasonCode: params.actualPickedQty < task.allocatedQty ? 'PARTIAL_SHORTAGE_PICK' : 'REGULAR_PICK',
        correlationId: params.correlationId
    });
    return { success: true, task };
};
exports.confirmPickingExecution = confirmPickingExecution;
