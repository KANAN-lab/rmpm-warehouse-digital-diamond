import { mockTransactionLedger, InventoryTransaction } from './transactionLedgerService.js';
import { mockInventoryBalances } from './inventoryStateService.js';

export type ExceptionType = 
  | 'WRONG_LOCATION' 
  | 'MISSING_PENDING_RECOUNT' 
  | 'UNEXPECTED_MATERIAL' 
  | 'DAMAGED_STOCK';

export type WrongLocationLevel = 
  | 'WRONG_WAREHOUSE' 
  | 'WRONG_ZONE' 
  | 'WRONG_AREA' 
  | 'WRONG_LANE' 
  | 'WRONG_RACK' 
  | 'WRONG_LEVEL' 
  | 'WRONG_BIN';

export interface WarehouseException {
  exceptionId: string;
  exceptionType: ExceptionType;
  wrongLocationLevel?: WrongLocationLevel;
  locationCode: string;
  expectedLocationCode?: string;
  midCode: string;
  materialCode: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED';
  reportedAt: string;
}

export interface TraceabilityNode {
  nodeId: string;
  label: string;
  type: 'RECEIVING' | 'PUTAWAY' | 'MOVEMENT' | 'COUNT' | 'CURRENT_STATE';
  timestamp: string;
  locationCode: string;
  operatorUsername: string;
}

export interface TraceabilityEdge {
  fromNodeId: string;
  toNodeId: string;
  action: string;
  quantity: number;
  uom: string;
}

export interface MaterialTraceabilityGraph {
  midCode: string;
  materialCode: string;
  materialName: string;
  nodes: TraceabilityNode[];
  edges: TraceabilityEdge[];
}

export const mockExceptions: WarehouseException[] = [
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
export const classifyWrongLocation = (actualLocationCode: string, expectedLocationCode: string): WrongLocationLevel => {
  const actualParts = actualLocationCode.split('-');
  const expectedParts = expectedLocationCode.split('-');

  if (actualParts[0] !== expectedParts[0]) return 'WRONG_ZONE';
  if (actualParts[1] !== expectedParts[1]) return 'WRONG_RACK';
  if (actualParts[2] !== expectedParts[2]) return 'WRONG_LEVEL';
  return 'WRONG_BIN';
};

// 2. Build Full End-to-End Node Graph Traceability for Material Tag MID
export const getMaterialTraceabilityGraph = (midCode: string): MaterialTraceabilityGraph | null => {
  const item = mockInventoryBalances.find(b => b.midCode === midCode);
  const transactions = mockTransactionLedger.filter(t => t.midCode === midCode);

  if (!item && transactions.length === 0) {
    return null;
  }

  const nodes: TraceabilityNode[] = [];
  const edges: TraceabilityEdge[] = [];

  let previousNodeId: string | null = null;

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
