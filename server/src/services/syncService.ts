import { v4 as uuidv4 } from 'uuid';
import { recordBlindPhysicalCount } from './blindCycleCountService.js';
import { mockInventoryBalances } from './inventoryStateService.js';
import { eventBus } from './eventBus.js';

export interface OfflineQueueItem {
  id: string;
  cycleCountId: string;
  targetId: string;
  locationCode: string;
  scannedCode: string;
  physicalQty: number;
  uom: string;
  inputMode: 'SCAN' | 'MANUAL';
  timestamp: string;
}

export interface SyncConflictRecord {
  conflictId: string;
  cycleCountId: string;
  locationCode: string;
  scannedCode: string;
  pdaReportedQty: number;
  serverStateQty: number;
  pdaTimestamp: string;
  status: 'PENDING_REVIEW' | 'RESOLVED_ACCEPT_PDA' | 'RESOLVED_ACCEPT_SERVER';
  resolvedBy?: string;
  resolvedAt?: string;
}

export const mockSyncConflicts: SyncConflictRecord[] = [];

export const processOfflineSyncQueue = (
  items: OfflineQueueItem[],
  userId: string,
  username: string,
  correlationId: string
) => {
  const processed: string[] = [];
  const conflicts: SyncConflictRecord[] = [];

  for (const item of items) {
    const currentBalance = mockInventoryBalances.find(b => b.locationCode === item.locationCode);

    // Conflict check: If server state changed significantly after PDA offline timestamp
    if (currentBalance && currentBalance.lastMovementAt > item.timestamp) {
      const conflictRecord: SyncConflictRecord = {
        conflictId: `conflict-${uuidv4().substring(0, 8)}`,
        cycleCountId: item.cycleCountId,
        locationCode: item.locationCode,
        scannedCode: item.scannedCode,
        pdaReportedQty: item.physicalQty,
        serverStateQty: currentBalance.quantity,
        pdaTimestamp: item.timestamp,
        status: 'PENDING_REVIEW'
      };

      mockSyncConflicts.push(conflictRecord);
      conflicts.push(conflictRecord);

      eventBus.publish('SyncConflictDetected', conflictRecord, correlationId);
    } else {
      // Record physical count entry cleanly
      recordBlindPhysicalCount({
        cycleCountId: item.cycleCountId,
        targetId: item.targetId,
        locationCode: item.locationCode,
        scannedCode: item.scannedCode,
        physicalQty: item.physicalQty,
        uom: item.uom,
        isLocationEmpty: item.physicalQty === 0,
        counterUserId: userId,
        counterUsername: username,
        inputMode: item.inputMode,
        correlationId
      });

      processed.push(item.id);
    }
  }

  return {
    processedCount: processed.length,
    conflictCount: conflicts.length,
    processedIds: processed,
    conflicts
  };
};

export const resolveSyncConflict = (
  conflictId: string,
  resolution: 'ACCEPT_PDA' | 'ACCEPT_SERVER',
  supervisorUserId: string
) => {
  const conflict = mockSyncConflicts.find(c => c.conflictId === conflictId);
  if (!conflict) return { success: false, error: 'Konflik sync tidak ditemukan.' };

  conflict.status = resolution === 'ACCEPT_PDA' ? 'RESOLVED_ACCEPT_PDA' : 'RESOLVED_ACCEPT_SERVER';
  conflict.resolvedBy = supervisorUserId;
  conflict.resolvedAt = new Date().toISOString();

  return { success: true, conflict };
};
