import { createToolResponse } from "../../../types/mcp.js"; // Import the new response creator
/**
 * Formatter for single project creation responses
 */
export class SingleProjectFormatter {
    format(data) {
        // Extract project properties from Neo4j structure or direct data
        const projectData = data.properties || data;
        const { name, id, status, taskType, createdAt, description, urls, completionRequirements, outputFormat, updatedAt, } = projectData;
        // Create a summary section
        const summary = `Project Created Successfully\n\n` +
            `Project: ${name || "Unnamed Project"}\n` +
            `ID: ${id || "Unknown ID"}\n` +
            `Status: ${status || "Unknown Status"}\n` +
            `Type: ${taskType || "Unknown Type"}\n` +
            `Created: ${createdAt ? new Date(createdAt).toLocaleString() : "Unknown Date"}\n`;
        // Create a comprehensive details section
        const fieldLabels = {
            id: "ID",
            name: "Name",
            description: "Description",
            status: "Status",
            urls: "URLs",
            completionRequirements: "Completion Requirements",
            outputFormat: "Output Format",
            taskType: "Task Type",
            createdAt: "Created At",
            updatedAt: "Updated At",
            // Neo4j specific fields
            properties: "Raw Properties",
            identity: "Neo4j Identity",
            labels: "Neo4j Labels",
            elementId: "Neo4j Element ID",
            // Fields from ProjectResponse that might not be in projectData directly if it's just properties
            dependencies: "Dependencies", // Assuming ProjectResponse might have this
        };
        let details = `Project Details:\n`;
        // Build details as key-value pairs for relevant fields
        const relevantKeys = [
            "id",
            "name",
            "description",
            "status",
            "taskType",
            "completionRequirements",
            "outputFormat",
            "urls",
            "createdAt",
            "updatedAt",
        ];
        relevantKeys.forEach((key) => {
            if (projectData[key] !== undefined && projectData[key] !== null) {
                let value = projectData[key];
                if (Array.isArray(value)) {
                    value =
                        value.length > 0
                            ? value
                                .map((item) => typeof item === "object" ? JSON.stringify(item) : item)
                                .join(", ")
                            : "None";
                }
                else if (typeof value === "string" &&
                    (key === "createdAt" || key === "updatedAt")) {
                    try {
                        value = new Date(value).toLocaleString();
                    }
                    catch (e) {
                        /* Keep original if parsing fails */
                    }
                }
                details += `  ${fieldLabels[key] || key}: ${value}\n`;
            }
        });
        return `${summary}\n${details}`;
    }
}
/**
 * Formatter for bulk project creation responses
 */
export class BulkProjectFormatter {
    format(data) {
        const { success, message, created, errors } = data;
        const summary = `${success && errors.length === 0 ? "Projects Created Successfully" : "Project Creation Completed"}\n\n` +
            `Status: ${success && errors.length === 0 ? "✅ Success" : errors.length > 0 ? "⚠️ Partial Success / Errors" : "✅ Success (No items or no errors)"}\n` +
            `Summary: ${message}\n` +
            `Created: ${created.length} project(s)\n` +
            `Errors: ${errors.length} error(s)\n`;
        let createdSection = "";
        if (created.length > 0) {
            createdSection = `\n--- Created Projects (${created.length}) ---\n\n`;
            createdSection += created
                .map((project, index) => {
                const projectData = project.properties || project;
                return (`${index + 1}. ${projectData.name || "Unnamed Project"} (ID: ${projectData.id || "N/A"})\n` +
                    `   Type: ${projectData.taskType || "N/A"}\n` +
                    `   Status: ${projectData.status || "N/A"}\n` +
                    `   Created: ${projectData.createdAt ? new Date(projectData.createdAt).toLocaleString() : "N/A"}`);
            })
                .join("\n\n");
        }
        let errorsSection = "";
        if (errors.length > 0) {
            errorsSection = `\n--- Errors Encountered (${errors.length}) ---\n\n`;
            errorsSection += errors
                .map((errorItem, index) => {
                const projectName = errorItem.project?.name ||
                    `Input project at index ${errorItem.index}`;
                return (`${index + 1}. Error for project: "${projectName}"\n` +
                    `   Error Code: ${errorItem.error.code}\n` +
                    `   Message: ${errorItem.error.message}` +
                    (errorItem.error.details
                        ? `\n   Details: ${JSON.stringify(errorItem.error.details)}`
                        : ""));
            })
                .join("\n\n");
        }
        return `${summary}${createdSection}${errorsSection}`.trim();
    }
}
/**
 * Create a formatted, human-readable response for the atlas_project_create tool
 *
 * @param data The raw project creation response data (SingleProjectResponse or BulkProjectResponse)
 * @param isError Whether this response represents an error condition (primarily for single responses)
 * @returns Formatted MCP tool response with appropriate structure
 */
export function formatProjectCreateResponse(data, isError = false) {
    const isBulkResponse = data.hasOwnProperty("success") &&
        data.hasOwnProperty("created") &&
        data.hasOwnProperty("errors");
    let formattedText;
    let finalIsError;
    if (isBulkResponse) {
        const formatter = new BulkProjectFormatter();
        const bulkData = data;
        formattedText = formatter.format(bulkData);
        finalIsError = !bulkData.success || bulkData.errors.length > 0;
    }
    else {
        const formatter = new SingleProjectFormatter();
        // For single response, the 'data' is the project object itself.
        // 'isError' must be determined by the caller if an error occurred before this point.
        // If 'data' represents a successfully created project, isError should be false.
        formattedText = formatter.format(data);
        finalIsError = isError;
    }
    return createToolResponse(formattedText, finalIsError);
}
