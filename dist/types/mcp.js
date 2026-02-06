import { z } from "zod";
// Atlas Platform Enums
export const ProjectStatus = {
    ACTIVE: "active",
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
    ARCHIVED: "archived",
};
export const TaskStatus = {
    BACKLOG: "backlog",
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    COMPLETED: "completed",
};
export const PriorityLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
};
export const TaskType = {
    RESEARCH: "research",
    GENERATION: "generation",
    ANALYSIS: "analysis",
    INTEGRATION: "integration",
};
export const KnowledgeDomain = {
    TECHNICAL: "technical",
    BUSINESS: "business",
    SCIENTIFIC: "scientific",
};
// Zod enum creators - these functions create Zod enums from our constant objects
export const createProjectStatusEnum = () => {
    return z.enum(Object.values(ProjectStatus));
};
export const createTaskStatusEnum = () => {
    return z.enum(Object.values(TaskStatus));
};
export const createPriorityLevelEnum = () => {
    return z.enum(Object.values(PriorityLevel));
};
export const createTaskTypeEnum = () => {
    return z.enum(Object.values(TaskType));
};
export const createKnowledgeDomainEnum = () => {
    return z.enum(Object.values(KnowledgeDomain));
};
export var ResponseFormat;
(function (ResponseFormat) {
    ResponseFormat["FORMATTED"] = "formatted";
    ResponseFormat["JSON"] = "json";
})(ResponseFormat || (ResponseFormat = {}));
export function createResponseFormatEnum() {
    return z.nativeEnum(ResponseFormat);
}
// Project-specific schemas
export const ProjectInputSchema = {
    name: z.string().min(1),
    description: z.string().optional(),
    status: createProjectStatusEnum().default(ProjectStatus.ACTIVE),
};
export const UpdateProjectInputSchema = {
    id: z.string(),
    updates: z.object(ProjectInputSchema).partial(),
};
export const ProjectIdInputSchema = {
    projectId: z.string(),
};
// Helper functions
export const createToolResponse = (text, isError) => ({
    content: [
        {
            type: "text",
            text,
            _type: "text",
        },
    ],
    isError,
    _type: "tool_response",
});
export const createResourceResponse = (uri, text, mimeType) => ({
    contents: [
        {
            uri,
            text,
            mimeType,
            _type: "resource_content",
        },
    ],
    _type: "resource_response",
});
export const createPromptResponse = (text, role = "assistant") => ({
    messages: [
        {
            role,
            content: {
                type: "text",
                text,
                _type: "prompt_content",
            },
            _type: "prompt_message",
        },
    ],
    _type: "prompt_response",
});
