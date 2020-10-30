"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contextual = exports.isContextualCrate = exports.ContextualKey = void 0;
var ContextualKey;
(function (ContextualKey) {
    ContextualKey["Crate"] = "iocrate";
    ContextualKey["Context"] = "iocontext";
    ContextualKey["String"] = "str";
})(ContextualKey = exports.ContextualKey || (exports.ContextualKey = {}));
function isContextualCrate(value) {
    return typeof value === 'object' && Object.keys(value) == [ContextualKey.Crate] && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
}
exports.isContextualCrate = isContextualCrate;
var Contextual = /** @class */ (function () {
    function Contextual(host) {
        this.host = host;
        this.contextStack = [];
    }
    Contextual.crate = function (uncrated) {
        var _a;
        return _a = {},
            _a[ContextualKey.Crate] = uncrated,
            _a;
    };
    Object.defineProperty(Contextual.prototype, "context", {
        get: function () { return this.host.context; },
        set: function (context) { this.host.context = context; },
        enumerable: false,
        configurable: true
    });
    Contextual.prototype.register = function (context) {
        Object.assign(this.context, context);
        return this;
    };
    Contextual.prototype.push = function (clear) {
        if (clear === void 0) { clear = false; }
        var oldContext = this.context;
        var newContext = {};
        if (!clear) {
            Object.assign(newContext, oldContext);
        }
        this.contextStack.push(oldContext);
        this.context = newContext;
        return this;
    };
    Contextual.prototype.pop = function () {
        console.assert(!!this.contextStack.length, 'Attempt to pop context with no context stack.');
        this.context = this.contextStack.pop();
        return this;
    };
    Contextual.prototype.uncrate = function (crated) {
        var _this = this;
        if (isContextualCrate(crated)) {
            return crated[ContextualKey.Crate];
        }
        if (typeof crated === 'string') {
            var realm = crated.split('.', 1).pop();
            switch (realm) {
                case ContextualKey.String: return crated.substr(ContextualKey.String.length + 1);
                case ContextualKey.Context:
                    var components = crated.split('.').slice(1);
                    var value = components.reduce(function (v, c) { return v === null || v === undefined ? null : v[c]; }, this.context);
                    return value;
            }
        }
        else if (typeof crated === 'object') {
            var uncrated_1 = {};
            Object.keys(crated).forEach(function (key) { return uncrated_1[key] = _this.uncrate[crated[key]]; });
            return uncrated_1;
        }
        else if (Array.isArray(crated)) {
            return crated.map(function (v) { return _this.uncrate(v); });
        }
        else {
            return crated;
        }
    };
    return Contextual;
}());
exports.Contextual = Contextual;
//# sourceMappingURL=contextual.js.map