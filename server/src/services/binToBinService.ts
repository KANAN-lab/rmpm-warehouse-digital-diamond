import { mockInventoryBalances } from './inventoryStateService.js';
import { mockLocationTree, findLocationNode, validateLocationCapacity } from './locationHierarchyService.js';
import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export interface BinToBinTransferRequest {
  sourceLocationCode: string;
  destinationLocationCode: string;
  midCode: string;
  quantity: number;
  reasonCode: string;
  operatorId: string;
  operatorUsername: string;
  correlationId: string;
}

// 1. Validate Material-Location Compatibility & Destination Capacity
export const validateBinToBinTransfer = (
  sourceLocationCode: string,
  destinationLocationCode: string,
  midCode: string,
  quantity: number
): { isValid: boolean; reason?: string } => {
  const item = mockInventoryBalances.find(b => b.midCode === midCode && b.locationCode === sourceLocationCode);
  if (!item) {
    return {
      isValid: false,
      reason: `Stok dengan MID '${midCode}' tidak ditemukan di lokasi asal '${sourceLocationCode}'.`
    };
  }

  if (item.quantity < quantity) {
    return {
      isValid: false,
      reason: `Kuantitas stok tidak mencukupi! (Tersedia: ${item.quantity} ${item.uom}, Diminta: ${quantity} ${item.uom}).`
    };
  }

  const targetNode = findLocationNode(mockLocationTree, destinationLocationCode);
  if (targetNode) {
    const capacityCheck = validateLocationCapacity(targetNode, quantity * 1.5, 2.0, 1);
    if (!capacityCheck.isValid) {
      return capacityCheck;
    }
  }

  return { isValid: true };
};

// 2. Execute Bin-to-Bin Transfer & Log Immutable Transaction
export const executeBinToBinTransfer = (req: BinToBinTransferRequest) => {
  const validation = validateBinToBinTransfer(
    req.sourceLocationCode,
    req.destinationLocationCode,
    req.midCode,
    req.quantity
  );

  if (!validation.isValid) {
    return { success: false, error: validation.reason };
  }

  const item = mockInventoryBalances.find(b => b.midCode === req.midCode && b.locationCode === req.sourceLocationCode);
  if (!item) {
    return { success: false, error: 'Stok tidak ditemukan.' };
  }

  // Update current stock location atomicly
  const oldLoc = item.locationCode;
  item.locationCode = req.destinationLocationCode;
  item.lastMovementAt = new Date().toISOString();

  // Record Immutable BIN_TO_BIN Transaction
  const transaction = recordTransaction({
    transactionType: 'BIN_TO_BIN',
    sourceLocationCode: oldLoc,
    destinationLocationCode: req.destinationLocationCode,
    materialCode: item.materialCode,
    batchNumber: item.batchNumber,
    midCode: item.midCode,
    palletCode: item.palletCode,
    quantity: req.quantity,
    uom: item.uom,
    operatorId: req.operatorId,
    operatorUsername: req.operatorUsername,
    reasonCode: req.reasonCode || 'SLOT_OPTIMIZATION_TRANSFER',
    correlationId: req.correlationId
  });

  eventBus.publish('InventoryMoved', { midCode: req.midCode, from: oldLoc, to: req.destinationLocationCode }, req.correlationId);

  return { success: true, transaction, updatedBalance: item };
};
