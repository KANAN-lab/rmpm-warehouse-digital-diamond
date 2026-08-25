import { v4 as uuidv4 } from 'uuid';
import { mockInventoryBalances, InventoryBalance } from './inventoryStateService.js';
import { eventBus, DomainEventType } from './eventBus.js';

export type TransactionType = 
  | 'RECEIVING' 
  | 'PUTAWAY' 
  | 'PICKING' 
  | 'BATCHING' 
  | 'REPLENISHMENT' 
  | 'BIN_TO_BIN' 
  | 'TRANSFER' 
  | 'RETURN' 
  | 'ADJUSTMENT' 
  | 'CYCLE_COUNT' 
  | 'STAGED' 
  | 'DISPATCH' 
  | 'HOLD' 
  | 'RELEASE' 
  | 'DAMAGE' 
  | 'SCRAP';

export interface InventoryTransaction {
  transactionId: string;
  transactionType: TransactionType;
  sourceLocationId?: string;
  sourceLocationCode?: string;
  destinationLocationId?: string;
  destinationLocationCode?: string;
  materialId: string;
  materialCode: string;
  batchNumber?: string;
  midCode: string;
  palletCode?: string;
  quantity: number;
  uom: string;
  operatorId: string;
  operatorUsername: string;
  deviceId?: string;
  timestamp: string;
  referenceDocument?: string;
  reasonCode?: string;
  status: 'SUCCESS' | 'PENDING_APPROVAL' | 'REVERTED';
  correlationId: string;
  previousState?: Partial<InventoryBalance>;
  newState?: Partial<InventoryBalance>;
  isReversal?: boolean;
  reversalOfTransactionId?: string;
}

// In-Memory Immutable Transaction Ledger (APPEND-ONLY)
export const mockTransactionLedger: InventoryTransaction[] = [
  {
    transactionId: 'txn-001-receiving',
    transactionType: 'RECEIVING',
    destinationLocationId: 'loc-staging-in-01',
    destinationLocationCode: 'DOCK-IN-01',
    materialId: 'mat-001',
    materialCode: 'RM-RESIN-001',
    batchNumber: 'BATCH-RM-88421',
    midCode: 'MID-2026-994821',
    palletCode: 'PAL-EUR-001',
    quantity: 1000.00,
    uom: 'KG',
    operatorId: 'usr-admin-001',
    operatorUsername: 'admin',
    deviceId: 'DEV-DESKTOP-01',
    timestamp: '2026-02-01T10:00:00Z',
    referenceDocument: 'PO-2026-00918',
    reasonCode: 'INBOUND_PURCHASE',
    status: 'SUCCESS',
    correlationId: 'corr-init-001',
    previousState: {},
    newState: { quantity: 1000, status: 'AVAILABLE' }
  },
  {
    transactionId: 'txn-002-putaway',
    transactionType: 'PUTAWAY',
    sourceLocationId: 'loc-staging-in-01',
    sourceLocationCode: 'DOCK-IN-01',
    destinationLocationId: 'loc-bin-a01-l02-b04',
    destinationLocationCode: 'A01-R03-L02-B04',
    materialId: 'mat-001',
    materialCode: 'RM-RESIN-001',
    batchNumber: 'BATCH-RM-88421',
    midCode: 'MID-2026-994821',
    palletCode: 'PAL-EUR-001',
    quantity: 1000.00,
    uom: 'KG',
    operatorId: 'usr-putaway-01',
    operatorUsername: 'putaway_op',
    deviceId: 'PDA-DEV-004',
    timestamp: '2026-02-01T10:30:00Z',
    referenceDocument: 'PUTAWAY-2026-001',
    reasonCode: 'REGULAR_PUTAWAY',
    status: 'SUCCESS',
    correlationId: 'corr-init-002',
    previousState: { locationCode: 'DOCK-IN-01' },
    newState: { locationCode: 'A01-R03-L02-B04' }
  }
];

// Append Transaction to Immutable Ledger & Update Balance Atomicly
export const recordTransaction = (params: {
  transactionType: TransactionType;
  sourceLocationCode?: string;
  destinationLocationCode?: string;
  materialCode: string;
  batchNumber?: string;
  midCode: string;
  palletCode?: string;
  quantity: number;
  uom: string;
  operatorId: string;
  operatorUsername: string;
  deviceId?: string;
  referenceDocument?: string;
  reasonCode?: string;
  correlationId: string;
}): InventoryTransaction => {
  const transactionId = `txn-${Date.now()}-${uuidv4().substring(0, 6)}`;
  
  // Find target inventory balance
  let balance = mockInventoryBalances.find(b => b.midCode === params.midCode);
  const previousState = balance ? { ...balance } : {};

  if (balance) {
    if (params.destinationLocationCode) {
      balance.locationCode = params.destinationLocationCode;
    }
    if (params.transactionType === 'PICKING' || params.transactionType === 'DISPATCH') {
      balance.quantity = Math.max(0, balance.quantity - params.quantity);
    } else if (params.transactionType === 'RECEIVING' || params.transactionType === 'RETURN') {
      balance.quantity += params.quantity;
    }
    balance.lastMovementAt = new Date().toISOString();
  }

  const newTxn: InventoryTransaction = {
    transactionId,
    transactionType: params.transactionType,
    sourceLocationCode: params.sourceLocationCode,
    destinationLocationCode: params.destinationLocationCode,
    materialId: `mat-${params.materialCode}`,
    materialCode: params.materialCode,
    batchNumber: params.batchNumber,
    midCode: params.midCode,
    palletCode: params.palletCode,
    quantity: params.quantity,
    uom: params.uom,
    operatorId: params.operatorId,
    operatorUsername: params.operatorUsername,
    deviceId: params.deviceId,
    timestamp: new Date().toISOString(),
    referenceDocument: params.referenceDocument,
    reasonCode: params.reasonCode,
    status: 'SUCCESS',
    correlationId: params.correlationId,
    previousState,
    newState: balance ? { ...balance } : {}
  };

  // Append-only commit
  mockTransactionLedger.push(newTxn);

  // Map Transaction Type to Domain Event Type
  const eventMap: Record<TransactionType, DomainEventType> = {
    RECEIVING: 'InventoryReceived',
    PUTAWAY: 'InventoryPutAway',
    PICKING: 'InventoryPicked',
    BATCHING: 'InventoryBatched',
    REPLENISHMENT: 'InventoryReplenished',
    BIN_TO_BIN: 'InventoryMoved',
    TRANSFER: 'InventoryMoved',
    RETURN: 'InventoryReceived',
    ADJUSTMENT: 'AdjustmentApproved',
    CYCLE_COUNT: 'CountRecorded',
    STAGED: 'InventoryMoved',
    DISPATCH: 'InventoryMoved',
    HOLD: 'InventoryMoved',
    RELEASE: 'InventoryMoved',
    DAMAGE: 'InventoryMoved',
    SCRAP: 'InventoryMoved'
  };

  const domainEventType = eventMap[params.transactionType] || 'InventoryMoved';
  eventBus.publish(domainEventType, newTxn, params.correlationId);

  return newTxn;
};

// Create Reversal Transaction (Jurnal Pembalik / Koreksi Transaksi Imutabel)
export const createReversalTransaction = (
  originalTransactionId: string,
  operatorId: string,
  operatorUsername: string,
  reasonCode: string,
  correlationId: string
): { success: boolean; reversalTransaction?: InventoryTransaction; error?: string } => {
  const original = mockTransactionLedger.find(t => t.transactionId === originalTransactionId);

  if (!original) {
    return { success: false, error: `Transaksi asal dengan ID '${originalTransactionId}' tidak ditemukan.` };
  }

  if (original.status === 'REVERTED') {
    return { success: false, error: `Transaksi '${originalTransactionId}' sudah pernah dibalikkan sebelumnya.` };
  }

  // Mark original as REVERTED
  original.status = 'REVERTED';

  // Create Reversal Entry with inverted source and destination
  const reversalTxn = recordTransaction({
    transactionType: 'ADJUSTMENT',
    sourceLocationCode: original.destinationLocationCode,
    destinationLocationCode: original.sourceLocationCode,
    materialCode: original.materialCode,
    batchNumber: original.batchNumber,
    midCode: original.midCode,
    palletCode: original.palletCode,
    quantity: original.quantity,
    uom: original.uom,
    operatorId,
    operatorUsername,
    deviceId: original.deviceId,
    referenceDocument: `REVERSAL-OF-${original.transactionId}`,
    reasonCode: reasonCode || 'CORRECTION_REVERSAL',
    correlationId
  });

  reversalTxn.isReversal = true;
  reversalTxn.reversalOfTransactionId = originalTransactionId;

  return { success: true, reversalTransaction: reversalTxn };
};
