"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = void 0;
const logger_js_1 = require("../utils/logger.js");
class EventBus {
    handlers = new Map();
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
    }
    publish(eventType, payload, correlationId) {
        const event = {
            eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            eventType,
            timestamp: new Date().toISOString(),
            correlationId,
            payload
        };
        logger_js_1.logger.info(`[EVENT BUS] Published Event '${eventType}'`, {
            event_id: event.eventId,
            correlation_id: correlationId
        });
        const registered = this.handlers.get(eventType) || [];
        registered.forEach(handler => {
            try {
                handler(event);
            }
            catch (err) {
                logger_js_1.logger.error(`[EVENT BUS] Handler failed for event '${eventType}'`, {
                    error: err.message,
                    event_id: event.eventId
                });
            }
        });
    }
}
exports.eventBus = new EventBus();
