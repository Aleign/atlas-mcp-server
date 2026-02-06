import { z } from "zod";
// Base error codes that all tools can use
export var BaseErrorCode;
(function (BaseErrorCode) {
    BaseErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    BaseErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    BaseErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    BaseErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    BaseErrorCode["NOT_FOUND"] = "NOT_FOUND";
    BaseErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    BaseErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    BaseErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    BaseErrorCode["INITIALIZATION_FAILED"] = "INITIALIZATION_FAILED";
    BaseErrorCode["FORBIDDEN"] = "FORBIDDEN";
})(BaseErrorCode || (BaseErrorCode = {}));
// Project-specific error codes
export var ProjectErrorCode;
(function (ProjectErrorCode) {
    ProjectErrorCode["DUPLICATE_NAME"] = "DUPLICATE_NAME";
    ProjectErrorCode["INVALID_STATUS"] = "INVALID_STATUS";
    ProjectErrorCode["PROJECT_NOT_FOUND"] = "PROJECT_NOT_FOUND";
    ProjectErrorCode["DEPENDENCY_CYCLE"] = "DEPENDENCY_CYCLE";
    ProjectErrorCode["INVALID_DEPENDENCY"] = "INVALID_DEPENDENCY";
})(ProjectErrorCode || (ProjectErrorCode = {}));
// Task-specific error codes
export var TaskErrorCode;
(function (TaskErrorCode) {
    TaskErrorCode["TASK_NOT_FOUND"] = "TASK_NOT_FOUND";
    TaskErrorCode["INVALID_STATUS"] = "INVALID_STATUS";
    TaskErrorCode["INVALID_PRIORITY"] = "INVALID_PRIORITY";
    TaskErrorCode["INVALID_DEPENDENCY"] = "INVALID_DEPENDENCY";
    TaskErrorCode["DEPENDENCY_CYCLE"] = "DEPENDENCY_CYCLE";
})(TaskErrorCode || (TaskErrorCode = {}));
// Note-specific error codes
export var NoteErrorCode;
(function (NoteErrorCode) {
    NoteErrorCode["INVALID_TAGS"] = "INVALID_TAGS";
    NoteErrorCode["NOTE_NOT_FOUND"] = "NOTE_NOT_FOUND";
})(NoteErrorCode || (NoteErrorCode = {}));
// Link-specific error codes
export var LinkErrorCode;
(function (LinkErrorCode) {
    LinkErrorCode["INVALID_URL"] = "INVALID_URL";
    LinkErrorCode["LINK_NOT_FOUND"] = "LINK_NOT_FOUND";
    LinkErrorCode["DUPLICATE_URL"] = "DUPLICATE_URL";
})(LinkErrorCode || (LinkErrorCode = {}));
// Member-specific error codes
export var MemberErrorCode;
(function (MemberErrorCode) {
    MemberErrorCode["INVALID_ROLE"] = "INVALID_ROLE";
    MemberErrorCode["MEMBER_NOT_FOUND"] = "MEMBER_NOT_FOUND";
    MemberErrorCode["DUPLICATE_MEMBER"] = "DUPLICATE_MEMBER";
})(MemberErrorCode || (MemberErrorCode = {}));
// Skill-specific error codes
export var SkillErrorCode;
(function (SkillErrorCode) {
    SkillErrorCode["SKILL_NOT_FOUND"] = "SKILL_NOT_FOUND";
    SkillErrorCode["DEPENDENCY_NOT_FOUND"] = "DEPENDENCY_NOT_FOUND";
    SkillErrorCode["MISSING_PARAMETER"] = "MISSING_PARAMETER";
    SkillErrorCode["CIRCULAR_DEPENDENCY"] = "CIRCULAR_DEPENDENCY";
    SkillErrorCode["SKILL_EXECUTION_ERROR"] = "SKILL_EXECUTION_ERROR";
})(SkillErrorCode || (SkillErrorCode = {}));
// Database export/import error codes
export var DatabaseExportImportErrorCode;
(function (DatabaseExportImportErrorCode) {
    DatabaseExportImportErrorCode["EXPORT_ERROR"] = "EXPORT_ERROR";
    DatabaseExportImportErrorCode["IMPORT_ERROR"] = "IMPORT_ERROR";
    DatabaseExportImportErrorCode["FILE_ACCESS_ERROR"] = "FILE_ACCESS_ERROR";
    DatabaseExportImportErrorCode["INVALID_EXPORT_FORMAT"] = "INVALID_EXPORT_FORMAT";
    DatabaseExportImportErrorCode["RESET_FAILED"] = "RESET_FAILED";
    DatabaseExportImportErrorCode["INVALID_CONFIRMATION_CODE"] = "INVALID_CONFIRMATION_CODE";
    DatabaseExportImportErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
})(DatabaseExportImportErrorCode || (DatabaseExportImportErrorCode = {}));
// Base MCP error class
export class McpError extends Error {
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "McpError";
    }
    toResponse() {
        const content = {
            type: "text",
            text: `Error [${this.code}]: ${this.message}${this.details
                ? `\nDetails: ${JSON.stringify(this.details, null, 2)}`
                : ""}`,
        };
        return {
            content: [content],
            isError: true,
            _type: "tool_response",
        };
    }
}
// Error schema for validation
export const ErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
});
