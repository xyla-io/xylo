"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnhancedTemplateMaster = exports.isTemplateMaster = void 0;
var template_1 = require("./template");
function isTemplateMaster(obj) {
    return obj && obj.metadata && obj.metadata.templateType === template_1.TemplateType.Master;
}
exports.isTemplateMaster = isTemplateMaster;
function isEnhancedTemplateMaster(obj) {
    return isTemplateMaster(obj)
        && obj.metadata.enhanced;
}
exports.isEnhancedTemplateMaster = isEnhancedTemplateMaster;
//# sourceMappingURL=master.js.map