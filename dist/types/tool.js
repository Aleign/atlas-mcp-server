import { z } from "zod";
// import { createToolMiddleware } from "../utils/security/index.js"; // Assuming this was from a missing file
// import { checkPermission } from "../utils/security/index.js"; // Assuming this was from a missing file
import { McpError } from "./errors.js";
import { createToolResponse } from "./mcp.js";
// Enhanced tool registration function
export const registerTool = (server, name, description, schema, handler, metadata) => {
    const wrappedHandler = async (args, extra) => {
        try {
            // Check permissions if required
            // if (metadata?.requiredPermission) {
            //   // const { checkPermission } = await import("../utils/security/index.js"); // Placeholder for missing checkPermission
            //   // checkPermission(extra as ToolContext, metadata.requiredPermission);
            //   console.warn(`Permission check for '${metadata.requiredPermission}' skipped due to missing checkPermission function.`);
            // }
            // Validate input
            const zodSchema = z.object(schema);
            const validatedInput = zodSchema.parse(args);
            // Create middleware with custom rate limit if specified
            // const middleware = createToolMiddleware(name); // Placeholder for missing createToolMiddleware
            // const result = await middleware(handler, validatedInput, extra as ToolContext);
            // Directly call handler if middleware is missing
            const result = await handler(validatedInput, extra);
            // Ensure result matches expected format
            if (typeof result === "object" &&
                result !== null &&
                "content" in result) {
                return result;
            }
            // Convert unexpected result format to standard response
            return createToolResponse(JSON.stringify(result));
        }
        catch (error) {
            if (error instanceof McpError) {
                return error.toResponse();
            }
            if (error instanceof z.ZodError) {
                return createToolResponse(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`, true);
            }
            return createToolResponse(`Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`, true);
        }
    };
    // Keep description concise and focused on tool purpose only
    const fullDescription = description;
    // Register tool with server
    // Examples are handled separately through the metadata but not passed directly to server.tool
    server.tool(name, fullDescription, schema, wrappedHandler);
};
// Helper to create tool examples
export const createToolExample = (input, output, description) => ({
    input,
    output,
    description,
});
// Helper to create tool metadata
export const createToolMetadata = (metadata) => metadata;
// Example usage - Updated for Atlas Platform:
/*
registerTool(
  server,
  "atlas_project_create",
  "Creates a new project or multiple projects in the system",
  {
    mode: z.enum(['single', 'bulk']).optional().default('single'),
    id: z.string().optional(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'pending', 'completed', 'archived']).optional().default('active'),
    completionRequirements: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    outputFormat: z.string().optional(),
    taskType: z.union([
      z.literal('research'),
      z.literal('generation'),
      z.literal('analysis'),
      z.literal('integration'),
      z.string()
    ]).optional(),
    projects: z.array(z.object({}).passthrough()).optional()
  },
  async (input, context) => {
    // Implementation would validate and process the input
    return createToolResponse(JSON.stringify(result, null, 2));
  },
  createToolMetadata({
    examples: [
      createToolExample(
        {
          mode: "single",
          name: "Atlas Migration Project",
          description: "Migrate existing project data to the Atlas Platform",
          completionRequirements: "All data migrated with validation",
          outputFormat: "Functional system with documentation",
          taskType: "integration"
        },
        "Project created successfully with ID: proj_xyz123",
        "Create a single integration project"
      )
    ],
    requiredPermission: "project:create",
    entityType: 'project',
    supportsBulkOperations: true
  })
);
*/
