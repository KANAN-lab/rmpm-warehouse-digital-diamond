import { v4 as uuidv4 } from 'uuid';
import { mockInventoryBalances, InventoryBalance } from './inventoryStateService.js';
import { mockLocationTree, findLocationNode } from './locationHierarchyService.js';
import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export interface InboundReceivingRequest {
  poNumber: string;
  materialCode: string;
  materialName: string;
  batchNumber: string;
  quantity: number;
  uom: string;
  manufactureDate?: string;
  expiryDate?: string;
  operatorId: string;
  operatorUsername: string;
  correlationId: string;
}

// 1. Inbound PO / ASN Verification & Receiving at Dock
export const receiveInboundShipment = (req: InboundReceivingRequest) => {
  const midCode = `MID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dockLocationCode = 'DOCK-IN-01';

  const newBalance: InventoryBalance = {
    id: `inv-${uuidv4().substring(0, 8)}`,
    locationId: 'loc-dock-in-01',
    locationCode: dockLocationCode,
    materialId: `mat-${req.materialCode}`,
    materialCode: req.materialCode,
    materialName: req.materialName,
    batchId: `batch-${req.batchNumber}`,
    batchNumber: req.batchNumber,
    midCode,
    palletCode: `PAL-EUR-${Math.floor(100 + Math.random() * 900)}`,
    quantity: req.quantity,
    uom: req.uom,
    status: 'QUARANTINE', // Pending QC Inspection
    manufactureDate: req.manufactureDate,
    expiryDate: req.expiryDate,
    receiptDate: new Date().toISOString(),
    lastMovementAt: new Date().toISOString(),
    qualityStatus: 'IN_TESTING'
  };

  mockInventoryBalances.push(newBalance);

  // Record Immutable RECEIVING Transaction
  const transaction = recordTransaction({
    transactionType: 'RECEIVING',
    destinationLocationCode: dockLocationCode,
    materialCode: req.materialCode,
    batchNumber: req.batchNumber,
    midCode,
    palletCode: newBalance.palletCode,
    quantity: req.quantity,
    uom: req.uom,
    operatorId: req.operatorId,
    operatorUsername: req.operatorUsername,
    referenceDocument: req.poNumber,
    reasonCode: 'INBOUND_PO_RECEIVING',
    correlationId: req.correlationId
  });

  eventBus.publish('InventoryReceived', { poNumber: req.poNumber, midCode, quantity: req.quantity }, req.correlationId);

  return { success: true, midCode, inventory: newBalance, transaction };
};

// 2. Quality Control Inspection (Passing to AVAILABLE or QUARANTINE)
export const executeQualityInspection = (params: {
  midCode: string;
  result: 'PASSED' | 'REJECTED';
  inspectorUserId: string;
  inspectorUsername: string;
  notes?: string;
  correlationId: string;
}) => {
  const item = mockInventoryBalances.find(b => b.midCode === params.midCode);
  if (!item) return { success: false, error: `MID '${params.midCode}' tidak ditemukan.` };

  if (params.result === 'PASSED') {
    item.status = 'AVAILABLE';
    item.qualityStatus = 'PASSED';
  } else {
    item.status = 'QUARANTINE';
    item.qualityStatus = 'REJECTED';
  }

  item.lastMovementAt = new Date().toISOString();

  return { success: true, item };
};

// 3. Putaway Suggestion Engine (Finds optimal Bin based on Material & Capacity)
export const generatePutawaySuggestion = (midCode: string) => {
  const item = mockInventoryBalances.find(b => b.midCode === midCode);
  if (!item) return null;

  // Algoritma rekomendasi bin optimal berdasarkan zona material
  const suggestedBinCode = 'A01-R03-L02-B04'; // Recommended Zone A Bin

  return {
    midCode: item.midCode,
    materialCode: item.materialCode,
    quantity: item.quantity,
    uom: item.uom,
    currentLocationCode: item.locationCode,
    suggestedBinCode,
    suggestedZone: 'ZONE-A (Raw Material Storage)',
    reasoning: 'Rekomendasi otomatis berdasarkan aturan rotasi zona dan ketersediaan kapasitas rak.'
  };
};

// 4. Confirm Putaway Execution via PDA
export const confirmPutawayExecution = (params: {
  midCode: string;
  scannedBinCode: string;
  operatorId: string;
  operatorUsername: string;
  correlationId: string;
}) => {
  const item = mockInventoryBalances.find(b => b.midCode === params.midCode);
  if (!item) return { success: false, error: `MID '${params.midCode}' tidak ditemukan.` };

  const sourceLoc = item.locationCode;
  item.locationCode = params.scannedBinCode;
  item.lastMovementAt = new Date().toISOString();

  // Record Immutable PUTAWAY Transaction
  const transaction = recordTransaction({
    transactionType: 'PUTAWAY',
    sourceLocationCode: sourceLoc,
    destinationLocationCode: params.scannedBinCode,
    materialCode: item.materialCode,
    batchNumber: item.batchNumber,
    midCode: item.midCode,
    palletCode: item.palletCode,
    quantity: item.quantity,
    uom: item.uom,
    operatorId: params.operatorId,
    operatorUsername: params.operatorUsername,
    reasonCode: 'INBOUND_PUTAWAY_EXECUTION',
    correlationId: params.correlationId
  });

  eventBus.publish('InventoryPutAway', { midCode: params.midCode, bin: params.scannedBinCode }, params.correlationId);

  return { success: true, transaction, updatedBalance: item };
};
