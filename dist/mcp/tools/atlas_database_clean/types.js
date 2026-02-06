import { z } from "zod";
import { ResponseFormat, createResponseFormatEnum, } from "../../../types/mcp.js";
/**
 * Schema for database clean operation
 * This operation requires an explicit acknowledgement to prevent accidental data loss
 */
export const AtlasDatabaseCleanSchema = z
    .object({
    acknowledgement: z
        .literal(true)
        .describe("Explicit acknowledgement to reset the entire database (must be set to TRUE)"),
    responseFormat: createResponseFormatEnum()
        .optional()
        .default(ResponseFormat.FORMATTED)
        .describe("Desired response format: 'formatted' (default string) or 'json' (raw object)"),
})
    .strict();
/**
 * Schema shape for tool registration
 */
export const AtlasDatabaseCleanSchemaShape = {
    acknowledgement: z
        .literal(true)
        .describe("Explicit acknowledgement to reset the entire database (must be set to TRUE)"),
    responseFormat: createResponseFormatEnum()
        .optional()
        .describe("Desired response format: 'formatted' (default string) or 'json' (raw object)"),
};
