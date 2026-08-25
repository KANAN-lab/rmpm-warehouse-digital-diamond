import { logger } from '../utils/logger.js';

export type DomainEventType = 
  | 'InventoryReceived'
  | 'InventoryPutAway'
  | 'InventoryPicked'
  | 'InventoryBatched'
  | 'InventoryReplenished'
  | 'InventoryMoved'
  | 'CycleCountStarted'
  | 'CountRecorded'
  | 'CountCompleted'
  | 'RecountRequested'
  | 'WrongLocationDetected'
  | 'VarianceDetected'
  | 'AdjustmentApproved'
  | 'LayoutPublished'
  | 'SyncConflictDetected'
  | 'MasterDataUpdated';

export interface DomainEvent<T = any> {
  eventId: string;
  eventType: DomainEventType;
  timestamp: string;
  correlationId: string;
  payload: T;
}

type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

class EventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map();

  public subscribe<T = any>(eventType: DomainEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  public publish<T = any>(eventType: DomainEventType, payload: T, correlationId: string): void {
    const event: DomainEvent<T> = {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      timestamp: new Date().toISOString(),
      correlationId,
      payload
    };

    logger.info(`[EVENT BUS] Published Event '${eventType}'`, {
      event_id: event.eventId,
      correlation_id: correlationId
    });

    const registered = this.handlers.get(eventType) || [];
    registered.forEach(handler => {
      try {
        handler(event);
      } catch (err: any) {
        logger.error(`[EVENT BUS] Handler failed for event '${eventType}'`, {
          error: err.message,
          event_id: event.eventId
        });
      }
    });
  }
}

export const eventBus = new EventBus();
