"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicIdentifierOps = void 0;
var DynamicIdentifierOps = /** @class */ (function () {
    function DynamicIdentifierOps() {
    }
    DynamicIdentifierOps.generateIdentifier = function (fields) {
        return [
            fields.namespace,
            fields.sourceIdentifier,
            fields.sourceTag,
            fields.instanceIdentifier,
        ].filter(function (field) { return field !== undefined; }).join(DynamicIdentifierOps.fieldSeparator);
    };
    DynamicIdentifierOps.fieldSeparator = ':';
    return DynamicIdentifierOps;
}());
exports.DynamicIdentifierOps = DynamicIdentifierOps;
//# sourceMappingURL=dynamic-identifier.js.map