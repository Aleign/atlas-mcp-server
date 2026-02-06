import { EventEmitter } from "events";
import { logger, requestContextService } from "../../utils/index.js"; // Updated import path
/**
 * Event types for database operations
 */
export var DatabaseEventType;
(function (DatabaseEventType) {
    DatabaseEventType["WRITE_OPERATION"] = "write_operation";
    DatabaseEventType["READ_OPERATION"] = "read_operation";
    DatabaseEventType["TRANSACTION_COMPLETE"] = "transaction_complete";
    DatabaseEventType["ERROR"] = "error";
})(DatabaseEventType || (DatabaseEventType = {}));
/**
 * Database event system to facilitate communication between services
 * Uses the publish-subscribe pattern to decouple components
 */
class DatabaseEventSystem {
    constructor() {
        this.emitter = new EventEmitter();
        // Set a higher limit for listeners to avoid warnings
        this.emitter.setMaxListeners(20);
        // Log all events in debug mode
        if (process.env.NODE_ENV === "development") {
            this.emitter.on(DatabaseEventType.WRITE_OPERATION, (details) => {
                const reqContext = requestContextService.createRequestContext({
                    operation: "DatabaseEvent.WRITE_OPERATION",
                    eventDetails: details,
                });
                logger.debug("Database write operation", reqContext);
            });
            this.emitter.on(DatabaseEventType.ERROR, (error) => {
                const reqContext = requestContextService.createRequestContext({
                    operation: "DatabaseEvent.ERROR",
                    eventError: error,
                });
                logger.debug("Database event error", reqContext);
            });
        }
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!DatabaseEventSystem.instance) {
            DatabaseEventSystem.instance = new DatabaseEventSystem();
        }
        return DatabaseEventSystem.instance;
    }
    /**
     * Subscribe to a database event
     * @param eventType Event type to subscribe to
     * @param listener Function to call when the event occurs
     */
    subscribe(eventType, listener) {
        this.emitter.on(eventType, listener);
    }
    /**
     * Unsubscribe from a database event
     * @param eventType Event type to unsubscribe from
     * @param listener Function to remove
     */
    unsubscribe(eventType, listener) {
        this.emitter.off(eventType, listener);
    }
    /**
     * Publish a database event
     * @param eventType Event type to publish
     * @param data Event data
     */
    publish(eventType, data) {
        this.emitter.emit(eventType, data);
    }
    /**
     * Subscribe to a database event only once
     * @param eventType Event type to subscribe to
     * @param listener Function to call when the event occurs
     */
    subscribeOnce(eventType, listener) {
        this.emitter.once(eventType, listener);
    }
}
// Export singleton instance
export const databaseEvents = DatabaseEventSystem.getInstance();
