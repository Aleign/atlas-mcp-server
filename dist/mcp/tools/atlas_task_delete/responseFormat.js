import { createToolResponse } from "../../../types/mcp.js"; // Import the new response creator
/**
 * Formatter for individual task removal responses
 */
export class SingleTaskDeleteFormatter {
    format(data) {
        return (`Task Removal\n\n` +
            `Result: ${data.success ? "✅ Success" : "❌ Failed"}\n` +
            `Task ID: ${data.id}\n` +
            `Message: ${data.message}\n`);
    }
}
/**
 * Formatter for batch task removal responses
 */
export class BulkTaskDeleteFormatter {
    format(data) {
        const { success, message, deleted, errors } = data;
        const summary = `Task Cleanup Operation\n\n` +
            `Status: ${success && errors.length === 0 ? "✅ Complete Success" : errors.length > 0 ? "⚠️ Partial Success / Errors" : "✅ Success (No items or no errors)"}\n` +
            `Summary: ${message}\n` +
            `Removed: ${deleted.length} task(s)\n` +
            `Errors: ${errors.length} error(s)\n`;
        let deletedSection = "";
        if (deleted.length > 0) {
            deletedSection = `\n--- Removed Tasks (${deleted.length}) ---\n\n`;
            deletedSection += deleted.map((id) => `- ${id}`).join("\n");
        }
        let errorsSection = "";
        if (errors.length > 0) {
            errorsSection = `\n--- Errors Encountered (${errors.length}) ---\n\n`;
            errorsSection += errors
                .map((errorItem, index) => {
                return (`${index + 1}. Failed to remove ID: ${errorItem.taskId}\n` +
                    `   Error Code: ${errorItem.error.code}\n` +
                    `   Message: ${errorItem.error.message}` +
                    (errorItem.error.details
                        ? `\n   Details: ${JSON.stringify(errorItem.error.details)}`
                        : ""));
            })
                .join("\n\n");
        }
        return `${summary}${deletedSection}${errorsSection}`.trim();
    }
}
/**
 * Create a human-readable formatted response for the atlas_task_delete tool
 *
 * @param data The structured task removal operation results (SingleTaskDeleteResponse or BulkTaskDeleteResponse)
 * @param isError This parameter is effectively ignored as success is determined from data.success. Kept for signature consistency if needed.
 * @returns Formatted MCP tool response with appropriate structure
 */
export function formatTaskDeleteResponse(data, isError = false) {
    const isBulkResponse = data.hasOwnProperty("deleted") &&
        Array.isArray(data.deleted) &&
        data.hasOwnProperty("errors");
    let formattedText;
    let finalIsError;
    if (isBulkResponse) {
        const formatter = new BulkTaskDeleteFormatter();
        const bulkData = data;
        formattedText = formatter.format(bulkData);
        finalIsError = !bulkData.success || bulkData.errors.length > 0;
    }
    else {
        const formatter = new SingleTaskDeleteFormatter();
        const singleData = data;
        formattedText = formatter.format(singleData);
        finalIsError = !singleData.success;
    }
    return createToolResponse(formattedText, finalIsError);
}
