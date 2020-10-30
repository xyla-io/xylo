"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XyloNoDataSetException = void 0;
/**
 * Thrown when a requested DataSet can not be found.
 */
var XyloNoDataSetException = /** @class */ (function (_super) {
    __extends(XyloNoDataSetException, _super);
    /**
     * @param key the key of the data set that could not be found
     * @example ```ts
     * throw new XyloNoDataSetException('goals');
     * ```
     */
    function XyloNoDataSetException(key) {
        var _this = _super.call(this, 'No DataSet named ' + key + ' found in Model') || this;
        _this.key = key;
        return _this;
    }
    return XyloNoDataSetException;
}(Error));
exports.XyloNoDataSetException = XyloNoDataSetException;
//# sourceMappingURL=exceptions.js.map