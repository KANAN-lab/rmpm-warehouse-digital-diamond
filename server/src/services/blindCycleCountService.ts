import { v4 as uuidv4 } from 'uuid';
import { mockInventoryBalances, InventoryBalance } from './inventoryStateService.js';
import { recordTransaction } from './transactionLedgerService.js';
import { eventBus } from './eventBus.js';

export type CycleCountMode = 
  | 'RACK' 
  | 'ZONE' 
  | 'AREA' 
  | 'LANE' 
  | 'LINE' 
  | 'BIN' 
  | 'LEVEL' 
  | 'MID' 
  | 'PALLET' 
  | 'MATERIAL' 
  | 'BATCH';

export type TargetState = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COUNTED' 
  | 'RECOUNT_REQUIRED' 
  | 'VERIFIED' 
  | 'COMPLETED' 
  | 'SKIPPED' 
  | 'INVALID';

export interface CycleCountSnapshot {
  snapshotId: string;
  cycleCountId: string;
  locationCode: string;
  materialCode: string;
  batchNumber?: string;
  midCode: string;
  systemQtyAtStart: number;
  uom: string;
  snapshotTimestamp: string;
}

export interface CountImpactEvent {
  impactId: string;
  cycleCountId: string;
  locationCode: string;
  movementType: string;
  quantity: number;
  timestamp: string;
}

export interface CycleCountTarget {
  targetId: string;
  cycleCountId: string;
  locationCode: string;
  expectedMaterialCode?: string;
  state: TargetState;
  counterAUserId?: string;
  counterBUserId?: string;
}

export interface CycleCountOrder {
  orderId: string;
  orderCode: string;
  mode: CycleCountMode;
  targetCriteria: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  snapshots: CycleCountSnapshot[];
  targets: CycleCountTarget[];
  impactEvents: CountImpactEvent[];
}

export interface PhysicalCountEntry {
  entryId: string;
  cycleCountId: string;
  targetId: string;
  locationCode: string;
  scannedCode: string; // MID or Material
  batchNumber?: string;
  physicalQty: number;
  uom: string;
  isLocationEmpty: boolean;
  counterUserId: string;
  counterUsername: string;
  inputMode: 'SCAN' | 'MANUAL';
  counterAttempt: 'COUNT_A' | 'COUNT_B';
  timestamp: string;
}

// In-Memory Storage for Cycle Count
export const mockCycleCountOrders: CycleCountOrder[] = [];
export const mockCountEntries: PhysicalCountEntry[] = [];

// 1. Create Cycle Count Order & Generate Snapshot at t_0
export const createCycleCountOrder = (params: {
  mode: CycleCountMode;
  targetCriteria: string;
  createdBy: string;
  correlationId: string;
}): CycleCountOrder => {
  const orderId = `cc-${Date.now()}`;
  const orderCode = `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Capture Inventory Snapshot at Start (t_0)
  const snapshots: CycleCountSnapshot[] = mockInventoryBalances.map(b => ({
    snapshotId: `snap-${uuidv4().substring(0, 8)}`,
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
  const targets: CycleCountTarget[] = snapshots.map(s => ({
    targetId: `tgt-${uuidv4().substring(0, 8)}`,
    cycleCountId: orderId,
    locationCode: s.locationCode,
    expectedMaterialCode: s.materialCode,
    state: 'NOT_STARTED'
  }));

  const newOrder: CycleCountOrder = {
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

  mockCycleCountOrders.push(newOrder);

  eventBus.publish('CycleCountStarted', { orderId, orderCode, mode: params.mode }, params.correlationId);

  return newOrder;
};

// 2. Get Blind Task Screen for Counter (MUTLAK HIDE SYSTEM QTY & VARIANCE)
export const getBlindTaskForCounter = (taskId: string) => {
  let foundTarget: CycleCountTarget | undefined;
  let foundOrder: CycleCountOrder | undefined;

  for (const order of mockCycleCountOrders) {
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

// 3. Record Blind Physical Count Entry
export const recordBlindPhysicalCount = (params: {
  cycleCountId: string;
  targetId: string;
  locationCode: string;
  scannedCode: string;
  batchNumber?: string;
  physicalQty: number;
  uom: string;
  isLocationEmpty: boolean;
  counterUserId: string;
  counterUsername: string;
  inputMode: 'SCAN' | 'MANUAL';
  counterAttempt?: 'COUNT_A' | 'COUNT_B';
  correlationId: string;
}): PhysicalCountEntry => {
  const entryId = `entry-${Date.now()}`;
  const entry: PhysicalCountEntry = {
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

  mockCountEntries.push(entry);

  // Update target state
  const order = mockCycleCountOrders.find(o => o.orderId === params.cycleCountId);
  if (order) {
    const target = order.targets.find(t => t.targetId === params.targetId);
    if (target) {
      target.state = 'COUNTED';
    }
  }

  eventBus.publish('CountRecorded', { entryId, locationCode: params.locationCode }, params.correlationId);

  return entry;
};

// 4. Dynamic Reconciliation Engine (Supervisor Only)
export const calculateDynamicReconciliation = (orderId: string) => {
  const order = mockCycleCountOrders.find(o => o.orderId === orderId);
  if (!order) return null;

  const entries = mockCountEntries.filter(e => e.cycleCountId === orderId);
  
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

// 5. Assign Independent Recount (Counter B)
export const assignIndependentRecount = (orderId: string, targetId: string, counterBUserId: string, correlationId: string) => {
  const order = mockCycleCountOrders.find(o => o.orderId === orderId);
  if (!order) return { success: false, error: 'Order SO tidak ditemukan.' };

  const target = order.targets.find(t => t.targetId === targetId);
  if (!target) return { success: false, error: 'Target SO tidak ditemukan.' };

  target.state = 'RECOUNT_REQUIRED';
  target.counterBUserId = counterBUserId;

  eventBus.publish('RecountRequested', { orderId, targetId, counterBUserId }, correlationId);

  return { success: true, message: `Recount Counter B berhasil dialokasikan untuk target '${targetId}'.` };
};
