import { mockInventoryBalances } from './inventoryStateService.js';
import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export interface ReplenishmentThresholdRule {
  materialCode: string;
  pickingLocationCode: string;
  minQtyThreshold: number;
  maxQtyTarget: number;
  uom: string;
}

export interface ReplenishmentTask {
  taskId: string;
  taskCode: string;
  materialCode: string;
  materialName: string;
  bulkLocationCode: string;
  pickingLocationCode: string;
  midCode: string;
  quantity: number;
  uom: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export const mockReplenishmentThresholds: ReplenishmentThresholdRule[] = [
  {
    materialCode: 'RM-RESIN-001',
    pickingLocationCode: 'A01-R03-L02-B04',
    minQtyThreshold: 200.00,
    maxQtyTarget: 1000.00,
    uom: 'KG'
  }
];

export const mockReplenishmentTasks: ReplenishmentTask[] = [];

// 1. Trigger Engine: Scan Bins Below Min Qty Threshold & Auto-Create Tasks
export const evaluateReplenishmentTriggers = (createdBy: string, correlationId: string) => {
  const generatedTasks: ReplenishmentTask[] = [];

  for (const rule of mockReplenishmentThresholds) {
    const currentPickingStock = mockInventoryBalances.find(b => b.locationCode === rule.pickingLocationCode);
    const currentQty = currentPickingStock ? currentPickingStock.quantity : 0;

    if (currentQty <= rule.minQtyThreshold) {
      // Find Bulk Storage Source Stock
      const bulkSource = mockInventoryBalances.find(
        b => b.materialCode === rule.materialCode && b.locationCode !== rule.pickingLocationCode && b.quantity > 0
      );

      const replenishNeeded = rule.maxQtyTarget - currentQty;
      const transferQty = bulkSource ? Math.min(bulkSource.quantity, replenishNeeded) : replenishNeeded;

      const taskId = `repl-${Date.now()}`;
      const taskCode = `REPL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTask: ReplenishmentTask = {
        taskId,
        taskCode,
        materialCode: rule.materialCode,
        materialName: bulkSource ? bulkSource.materialName : 'Raw Material Pellets',
        bulkLocationCode: bulkSource ? bulkSource.locationCode : 'BULK-ZONE-B01',
        pickingLocationCode: rule.pickingLocationCode,
        midCode: bulkSource ? bulkSource.midCode : 'MID-2026-AUTO',
        quantity: transferQty,
        uom: rule.uom,
        status: 'PENDING',
        createdBy,
        createdAt: new Date().toISOString()
      };

      mockReplenishmentTasks.push(newTask);
      generatedTasks.push(newTask);

      eventBus.publish('InventoryReplenished', { taskCode, transferQty, location: rule.pickingLocationCode }, correlationId);
    }
  }

  return generatedTasks;
};

// 2. Confirm PDA Execution of Replenishment Transfer
export const confirmReplenishmentExecution = (params: {
  taskId: string;
  scannedBulkLocationCode: string;
  scannedPickingLocationCode: string;
  scannedMidCode: string;
  operatorId: string;
  operatorUsername: string;
  correlationId: string;
}) => {
  const task = mockReplenishmentTasks.find(t => t.taskId === params.taskId);
  if (!task) return { success: false, error: 'Tugas replenishment tidak ditemukan.' };

  if (task.bulkLocationCode !== params.scannedBulkLocationCode) {
    return { success: false, error: `Salah lokasi bulk! Scan lokasi bulk (${params.scannedBulkLocationCode}) tidak sesuai tugas (${task.bulkLocationCode}).` };
  }

  if (task.pickingLocationCode !== params.scannedPickingLocationCode) {
    return { success: false, error: `Salah lokasi picking target! Scan lokasi (${params.scannedPickingLocationCode}) tidak sesuai tugas (${task.pickingLocationCode}).` };
  }

  task.status = 'COMPLETED';

  // Record Immutable Replenishment Transaction
  recordTransaction({
    transactionType: 'REPLENISHMENT',
    sourceLocationCode: task.bulkLocationCode,
    destinationLocationCode: task.pickingLocationCode,
    materialCode: task.materialCode,
    midCode: task.midCode,
    quantity: task.quantity,
    uom: task.uom,
    operatorId: params.operatorId,
    operatorUsername: params.operatorUsername,
    referenceDocument: task.taskCode,
    reasonCode: 'MIN_MAX_BIN_REPLENISHMENT',
    correlationId: params.correlationId
  });

  return { success: true, task };
};
