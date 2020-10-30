"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTemplateCollection = exports.isTemplateDeck = exports.isTemplateGroup = exports.isBlockTemplate = exports.TemplateType = void 0;
var TemplateType;
(function (TemplateType) {
    // Top-level template
    TemplateType["Query"] = "query";
    // Master Template
    // (Points to a Query)
    TemplateType["Master"] = "master";
    // Contains a set of Block templates and layout information
    TemplateType["DashboardContent"] = "dashboard_content";
    // Block Templates
    // (Points to Master)
    TemplateType["BigNumber"] = "big_number";
    TemplateType["BreakdownTable"] = "breakdown_table";
    // Group Templates
    // (Contains a set of Block templates that share the same parent template)
    TemplateType["Group"] = "group";
    // Deck Templates
    // (Contains a list of Block templates that share the same template type
    TemplateType["Deck"] = "deck";
    // Internal Templates
    // (Used to compose Block and Master Templates)
    TemplateType["Breakdown"] = "breakdown";
    TemplateType["Column"] = "column";
    TemplateType["ColumnCategory"] = "column_category";
    TemplateType["DynamicColumnCategory"] = "dynamic_column_category";
    TemplateType["RowFilter"] = "row_filter";
    TemplateType["VariableRowFilter"] = "variable_row_filter";
})(TemplateType = exports.TemplateType || (exports.TemplateType = {}));
function isBlockTemplate(obj) {
    return obj && obj.metadata
        && obj.metadata.templateType
        && obj.metadata.parentPath
        && typeof obj.metadata.parentVersion === 'number';
}
exports.isBlockTemplate = isBlockTemplate;
function isTemplateGroup(obj) {
    return obj && obj.metadata
        && obj.metadata.templateType === TemplateType.Group
        && obj.structure
        && obj.structure.templates;
}
exports.isTemplateGroup = isTemplateGroup;
function isTemplateDeck(obj) {
    return obj && obj.metadata
        && obj.metadata.templateType === TemplateType.Deck
        && obj.structure
        && obj.structure.templates;
}
exports.isTemplateDeck = isTemplateDeck;
function isTemplateCollection(obj) {
    return isTemplateDeck(obj) || isTemplateGroup(obj);
}
exports.isTemplateCollection = isTemplateCollection;
//# sourceMappingURL=template.js.map