"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaterialTraceabilityGraph = exports.classifyWrongLocation = exports.mockExceptions = void 0;
const transactionLedgerService_js_1 = require("./transactionLedgerService.js");
const inventoryStateService_js_1 = require("./inventoryStateService.js");
exports.mockExceptions = [
    {
        exceptionId: 'exp-001',
        exceptionType: 'WRONG_LOCATION',
        wrongLocationLevel: 'WRONG_BIN',
        locationCode: 'A01-R03-L02-B04',
        expectedLocationCode: 'A01-R03-L01-B01',
        midCode: 'MID-2026-994821',
        materialCode: 'RM-RESIN-001',
        severity: 'HIGH',
        status: 'OPEN',
        reportedAt: new Date().toISOString()
    }
];
// 1. Classify Wrong Location Hierarchy
const classifyWrongLocation = (actualLocationCode, expectedLocationCode) => {
    const actualParts = actualLocationCode.split('-');
    const expectedParts = expectedLocationCode.split('-');
    if (actualParts[0] !== expectedParts[0])
        return 'WRONG_ZONE';
    if (actualParts[1] !== expectedParts[1])
        return 'WRONG_RACK';
    if (actualParts[2] !== expectedParts[2])
        return 'WRONG_LEVEL';
    return 'WRONG_BIN';
};
exports.classifyWrongLocation = classifyWrongLocation;
// 2. Build Full End-to-End Node Graph Traceability for Material Tag MID
const getMaterialTraceabilityGraph = (midCode) => {
    const item = inventoryStateService_js_1.mockInventoryBalances.find(b => b.midCode === midCode);
    const transactions = transactionLedgerService_js_1.mockTransactionLedger.filter(t => t.midCode === midCode);
    if (!item && transactions.length === 0) {
        return null;
    }
    const nodes = [];
    const edges = [];
    let previousNodeId = null;
    transactions.forEach((txn, index) => {
        const nodeId = `node-${txn.transactionId}`;
        nodes.push({
            nodeId,
            label: `${txn.transactionType} at ${txn.destinationLocationCode || txn.sourceLocationCode}`,
            type: txn.transactionType === 'RECEIVING' ? 'RECEIVING' : txn.transactionType === 'PUTAWAY' ? 'PUTAWAY' : 'MOVEMENT',
            timestamp: txn.timestamp,
            locationCode: txn.destinationLocationCode || txn.sourceLocationCode || 'UNKNOWN',
            operatorUsername: txn.operatorUsername
        });
        if (previousNodeId) {
            edges.push({
                fromNodeId: previousNodeId,
                toNodeId: nodeId,
                action: txn.transactionType,
                quantity: txn.quantity,
                uom: txn.uom
            });
        }
        previousNodeId = nodeId;
    });
    // Current State Node
    if (item) {
        const currentNodeId = `node-current-state`;
        nodes.push({
            nodeId: currentNodeId,
            label: `Current Balance: ${item.status} (${item.quantity} ${item.uom})`,
            type: 'CURRENT_STATE',
            timestamp: item.lastMovementAt,
            locationCode: item.locationCode,
            operatorUsername: 'SYSTEM_LEDGER'
        });
        if (previousNodeId) {
            edges.push({
                fromNodeId: previousNodeId,
                toNodeId: currentNodeId,
                action: 'STORED',
                quantity: item.quantity,
                uom: item.uom
            });
        }
    }
    return {
        midCode,
        materialCode: item ? item.materialCode : 'RM-RESIN-001',
        materialName: item ? item.materialName : 'Polypropylene Resin',
        nodes,
        edges
    };
};
exports.getMaterialTraceabilityGraph = getMaterialTraceabilityGraph;
