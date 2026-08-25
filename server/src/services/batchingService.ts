import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export type BatchProductionStatus = 'PREPARATION' | 'MIXED' | 'RELEASED_TO_PRODUCTION' | 'CONSUMED';

export interface ProductionBatch {
  batchId: string;
  batchNumber: string;
  workOrderNumber: string;
  materialCode: string;
  targetQuantity: number;
  uom: string;
  status: BatchProductionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const mockProductionBatches: ProductionBatch[] = [
  {
    batchId: 'pbatch-001',
    batchNumber: 'BATCH-PROD-2026-001',
    workOrderNumber: 'WO-2026-99182',
    materialCode: 'RM-RESIN-001',
    targetQuantity: 2500.00,
    uom: 'KG',
    status: 'PREPARATION',
    createdBy: 'usr-admin-001',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z'
  }
];

// 1. Create Production Batch & Associate with Work Order
export const createProductionBatch = (params: {
  workOrderNumber: string;
  materialCode: string;
  targetQuantity: number;
  uom: string;
  createdBy: string;
  correlationId: string;
}): ProductionBatch => {
  const batchId = `pbatch-${Date.now()}`;
  const batchNumber = `BATCH-PROD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBatch: ProductionBatch = {
    batchId,
    batchNumber,
    workOrderNumber: params.workOrderNumber,
    materialCode: params.materialCode,
    targetQuantity: params.targetQuantity,
    uom: params.uom,
    status: 'PREPARATION',
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockProductionBatches.push(newBatch);

  // Record Immutable BATCHING Transaction
  recordTransaction({
    transactionType: 'BATCHING',
    materialCode: params.materialCode,
    batchNumber,
    midCode: `MID-BATCH-${batchNumber}`,
    quantity: params.targetQuantity,
    uom: params.uom,
    operatorId: params.createdBy,
    operatorUsername: 'operator',
    referenceDocument: params.workOrderNumber,
    reasonCode: 'PRODUCTION_BATCH_CREATION',
    correlationId: params.correlationId
  });

  eventBus.publish('InventoryBatched', { batchNumber, workOrderNumber: params.workOrderNumber }, params.correlationId);

  return newBatch;
};

// 2. Transition Batch Status Tracking
export const transitionBatchStatus = (
  batchNumber: string,
  newStatus: BatchProductionStatus,
  correlationId: string
) => {
  const batch = mockProductionBatches.find(b => b.batchNumber === batchNumber);
  if (!batch) return { success: false, error: `Batch produksi '${batchNumber}' tidak ditemukan.` };

  batch.status = newStatus;
  batch.updatedAt = new Date().toISOString();

  return { success: true, batch };
};
