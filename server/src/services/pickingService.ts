import { mockInventoryBalances, InventoryBalance } from './inventoryStateService.js';
import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export type PickingStrategy = 'FIFO' | 'FEFO';

export interface PickTaskItem {
  taskId: string;
  pickListId: string;
  materialCode: string;
  materialName: string;
  requestedQty: number;
  allocatedQty: number;
  pickedQty: number;
  uom: string;
  allocatedLocationCode: string;
  allocatedMidCode: string;
  allocatedBatchNumber?: string;
  expiryDate?: string;
  receiptDate: string;
  status: 'ALLOCATED' | 'IN_PROGRESS' | 'PICKED' | 'PARTIAL' | 'SHORTAGE';
  pickRouteOrder: number;
}

export interface PickList {
  pickListId: string;
  pickListCode: string;
  strategy: PickingStrategy;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'SHORTAGE_FLAGGED';
  totalItems: number;
  createdBy: string;
  createdAt: string;
  tasks: PickTaskItem[];
}

export const mockPickLists: PickList[] = [];

// 1. Auto-Allocation Stock Engine (FIFO / FEFO)
export const allocateStockForPicking = (
  materialCode: string,
  requestedQty: number,
  strategy: PickingStrategy = 'FEFO'
): { allocatedItems: InventoryBalance[]; unfulfilledQty: number } => {
  // Filter available stock
  let availableStock = mockInventoryBalances.filter(
    b => b.materialCode === materialCode && b.status === 'AVAILABLE' && b.quantity > 0
  );

  // Sort based on strategy
  if (strategy === 'FEFO') {
    // First Expired First Out
    availableStock.sort((a, b) => {
      const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return dateA - dateB;
    });
  } else {
    // First In First Out
    availableStock.sort((a, b) => {
      return new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime();
    });
  }

  let remaining = requestedQty;
  const allocatedItems: InventoryBalance[] = [];

  for (const item of availableStock) {
    if (remaining <= 0) break;
    allocatedItems.push(item);
    remaining -= item.quantity;
  }

  return {
    allocatedItems,
    unfulfilledQty: Math.max(0, remaining)
  };
};

// 2. Create Pick List & Optimize Route (Sort by Zone -> Aisle -> Bin)
export const createPickListWithRoute = (params: {
  materialCode: string;
  requestedQty: number;
  strategy: PickingStrategy;
  createdBy: string;
  correlationId: string;
}): PickList => {
  const allocation = allocateStockForPicking(params.materialCode, params.requestedQty, params.strategy);
  const pickListId = `picklist-${Date.now()}`;
  const pickListCode = `PICK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  let routeOrder = 1;
  const tasks: PickTaskItem[] = allocation.allocatedItems.map(item => ({
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

  const pickList: PickList = {
    pickListId,
    pickListCode,
    strategy: params.strategy,
    status: allocation.unfulfilledQty > 0 ? 'SHORTAGE_FLAGGED' : 'CREATED',
    totalItems: tasks.length,
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    tasks
  };

  mockPickLists.push(pickList);

  eventBus.publish('InventoryPicked', { pickListCode, strategy: params.strategy, taskCount: tasks.length }, params.correlationId);

  return pickList;
};

// 3. Confirm PDA Picking Execution & Handle Shortage / Partial Picking
export const confirmPickingExecution = (params: {
  pickListId: string;
  taskId: string;
  scannedLocationCode: string;
  scannedMidCode: string;
  actualPickedQty: number;
  operatorId: string;
  operatorUsername: string;
  correlationId: string;
}) => {
  const pickList = mockPickLists.find(p => p.pickListId === params.pickListId);
  if (!pickList) return { success: false, error: 'Pick List tidak ditemukan.' };

  const task = pickList.tasks.find(t => t.taskId === params.taskId);
  if (!task) return { success: false, error: 'Tugas picking tidak ditemukan.' };

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
  } else {
    task.status = 'PICKED';
  }

  // Record Immutable Picking Transaction
  recordTransaction({
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
