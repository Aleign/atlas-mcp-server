/**
 * Common type definitions for the Neo4j service
 */
/**
 * Relationship types used in the Neo4j database
 */
export var RelationshipTypes;
(function (RelationshipTypes) {
    RelationshipTypes["CONTAINS_TASK"] = "CONTAINS_TASK";
    RelationshipTypes["CONTAINS_KNOWLEDGE"] = "CONTAINS_KNOWLEDGE";
    RelationshipTypes["DEPENDS_ON"] = "DEPENDS_ON";
    RelationshipTypes["ASSIGNED_TO"] = "ASSIGNED_TO";
    RelationshipTypes["CITES"] = "CITES";
    RelationshipTypes["RELATED_TO"] = "RELATED_TO";
    RelationshipTypes["HAS_TYPE"] = "HAS_TYPE";
    RelationshipTypes["BELONGS_TO_DOMAIN"] = "BELONGS_TO_DOMAIN";
    RelationshipTypes["BELONGS_TO_PROJECT"] = "BELONGS_TO_PROJECT";
})(RelationshipTypes || (RelationshipTypes = {}));
/**
 * Node labels used in the Neo4j database
 */
export var NodeLabels;
(function (NodeLabels) {
    NodeLabels["Project"] = "Project";
    NodeLabels["Task"] = "Task";
    NodeLabels["Knowledge"] = "Knowledge";
    NodeLabels["User"] = "User";
    NodeLabels["TaskType"] = "TaskType";
    NodeLabels["Domain"] = "Domain";
    NodeLabels["Citation"] = "Citation";
})(NodeLabels || (NodeLabels = {}));
/**
 * Specific types for project dependencies stored within the DEPENDS_ON relationship properties.
 */
export var ProjectDependencyType;
(function (ProjectDependencyType) {
    ProjectDependencyType["REQUIRES"] = "requires";
    ProjectDependencyType["EXTENDS"] = "extends";
    ProjectDependencyType["IMPLEMENTS"] = "implements";
    ProjectDependencyType["REFERENCES"] = "references";
})(ProjectDependencyType || (ProjectDependencyType = {}));
