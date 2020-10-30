"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformable = void 0;
var index_1 = require("../../../index");
var Transformable = /** @class */ (function () {
    function Transformable(host) {
        this.host = host;
    }
    Object.defineProperty(Transformable.prototype, "dataVectors", {
        get: function () { return this.host.dataVectors; },
        set: function (dataVectors) { this.host.dataVectors = dataVectors; },
        enumerable: false,
        configurable: true
    });
    Transformable.prototype.transform = function () {
        var _a;
        var transformers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            transformers[_i] = arguments[_i];
        }
        this.host.dataVectors = (_a = index_1.xyla.tools).transformVectors.apply(_a, __spreadArrays([this.host.dataVectors], transformers));
        return this;
    };
    return Transformable;
}());
exports.Transformable = Transformable;
//# sourceMappingURL=transformable.js.map