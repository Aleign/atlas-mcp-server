import neo4j from "neo4j-driver";
import { config } from "../../config/index.js";
import { logger, requestContextService } from "../../utils/index.js"; // Updated import path
import { exportDatabase } from "./index.js"; // Import the export function for backup trigger
import { databaseEvents, DatabaseEventType } from "./events.js";
/**
 * Neo4j connection management singleton
 * Responsible for creating and managing the Neo4j driver connection
 */
class Neo4jDriver {
    constructor() {
        this.driver = null;
        this.connectionPromise = null;
        this.transactionCounter = 0;
    }
    /**
     * Get the Neo4jDriver singleton instance
     */
    static getInstance() {
        if (!Neo4jDriver.instance) {
            Neo4jDriver.instance = new Neo4jDriver();
        }
        return Neo4jDriver.instance;
    }
    /**
     * Initialize the Neo4j driver connection
     * @returns Promise that resolves to the Neo4j driver
     */
    async initDriver() {
        if (this.driver) {
            return this.driver;
        }
        try {
            const { neo4jUri, neo4jUser, neo4jPassword } = config;
            if (!neo4jUri || !neo4jUser || !neo4jPassword) {
                throw new Error("Neo4j connection details are not properly configured");
            }
            const reqContext = requestContextService.createRequestContext({
                operation: "Neo4jDriver.initDriver",
            });
            logger.info("Initializing Neo4j driver connection", reqContext);
            this.driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword), {
                maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
                maxConnectionPoolSize: 50,
                connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
                disableLosslessIntegers: true, // Recommended for JS compatibility
            });
            // Verify connection
            await this.driver.verifyConnectivity();
            logger.info("Neo4j driver connection established successfully", reqContext);
            return this.driver;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // reqContext might not be defined if error occurs before its creation, so create one if needed
            const errorContext = requestContextService.createRequestContext({
                operation: "Neo4jDriver.initDriver.error",
            });
            logger.error("Failed to initialize Neo4j driver", error, {
                ...errorContext,
                detail: errorMessage,
            });
            throw new Error(`Failed to initialize Neo4j connection: ${errorMessage}`);
        }
    }
    /**
     * Get the Neo4j driver instance, initializing it if necessary
     * @returns Promise that resolves to the Neo4j driver
     */
    async getDriver() {
        if (!this.connectionPromise) {
            this.connectionPromise = this.initDriver();
        }
        return this.connectionPromise;
    }
    /**
     * Create a new Neo4j session
     * @param database Optional database name
     * @returns Promise that resolves to a new Neo4j session
     */
    async getSession(database) {
        const driver = await this.getDriver();
        // Use the default database configured for the driver instance
        // Neo4j Community Edition typically uses 'neo4j' or potentially 'system'
        // Passing undefined lets the driver use its default.
        return driver.session({
            database: database || undefined,
            defaultAccessMode: neo4j.session.WRITE,
        });
    }
    /**
     * Execute a query with a transaction
     * @param cypher Cypher query to execute
     * @param params Parameters for the query
     * @param database Optional database name
     * @returns Promise that resolves to the query result records
     */
    async executeQuery(cypher, params = {}, database) {
        const session = await this.getSession(database);
        try {
            const result = await session.executeWrite(async (tx) => {
                const queryResult = await tx.run(cypher, params);
                return queryResult.records;
            });
            // Publish write operation event
            // Publish write operation event
            this.publishWriteOperation({ query: cypher, params });
            // Removed: Trigger background backup after successful write
            // this.triggerBackgroundBackup(); // This was inefficient
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorContext = requestContextService.createRequestContext({
                operation: "Neo4jDriver.executeQuery",
                query: cypher,
                // params: params // Consider sanitizing or summarizing params
            });
            logger.error("Error executing Neo4j query", error, {
                ...errorContext,
                detail: errorMessage,
            });
            // Publish error event
            databaseEvents.publish(DatabaseEventType.ERROR, {
                timestamp: new Date().toISOString(),
                operation: "executeQuery",
                error: errorMessage,
                query: cypher,
            });
            throw error; // Re-throw the original error
        }
        finally {
            await session.close();
        }
    }
    /**
     * Execute a read-only query
     * @param cypher Cypher query to execute
     * @param params Parameters for the query
     * @param database Optional database name
     * @returns Promise that resolves to the query result records
     */
    async executeReadQuery(cypher, params = {}, database) {
        const session = await this.getSession(database);
        try {
            const result = await session.executeRead(async (tx) => {
                const queryResult = await tx.run(cypher, params);
                return queryResult.records;
            });
            // Publish read operation event
            databaseEvents.publish(DatabaseEventType.READ_OPERATION, {
                timestamp: new Date().toISOString(),
                query: cypher,
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorContext = requestContextService.createRequestContext({
                operation: "Neo4jDriver.executeReadQuery",
                query: cypher,
                // params: params // Consider sanitizing or summarizing params
            });
            logger.error("Error executing Neo4j read query", error, {
                ...errorContext,
                detail: errorMessage,
            });
            // Publish error event
            databaseEvents.publish(DatabaseEventType.ERROR, {
                timestamp: new Date().toISOString(),
                operation: "executeReadQuery",
                error: errorMessage,
                query: cypher,
            });
            throw error; // Re-throw the original error
        }
        finally {
            await session.close();
        }
    }
    /**
     * Publish a database write operation event
     * @param operation Details about the operation
     * @private
     */
    publishWriteOperation(operation) {
        this.transactionCounter++;
        databaseEvents.publish(DatabaseEventType.WRITE_OPERATION, {
            timestamp: new Date().toISOString(),
            transactionId: this.transactionCounter,
            operation,
        });
    }
    /**
     * Triggers a database backup in the background, including rotation logic.
     * Logs errors but does not throw to avoid interrupting the main flow.
     * @private
     */
    triggerBackgroundBackup() {
        const reqContext = requestContextService.createRequestContext({
            operation: "Neo4jDriver.triggerBackgroundBackup",
        });
        logger.debug("Triggering background database backup with rotation...", reqContext);
        // Run backup in the background without awaiting it
        exportDatabase()
            .then((backupPath) => {
            logger.info(`Background database backup successful: ${backupPath}`, {
                ...reqContext,
                backupPath,
            });
        })
            .catch((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error("Background database backup failed:", error, {
                ...reqContext,
                detail: errorMessage,
            });
            // Consider adding more robust error handling/notification if needed
        });
    }
    /**
     * Close the Neo4j driver connection
     */
    async close() {
        const reqContext = requestContextService.createRequestContext({
            operation: "Neo4jDriver.close",
        });
        if (this.driver) {
            try {
                await this.driver.close();
                this.driver = null;
                this.connectionPromise = null;
                logger.info("Neo4j driver connection closed", reqContext);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error("Error closing Neo4j driver connection", error, {
                    ...reqContext,
                    detail: errorMessage,
                });
                throw error; // Re-throw the error to propagate it
            }
        }
    }
}
// Export the singleton instance
export const neo4jDriver = Neo4jDriver.getInstance();
