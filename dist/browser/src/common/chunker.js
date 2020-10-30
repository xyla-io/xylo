"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chunker = void 0;
/**
 * A 2D matrix. Insert rows, store as columns.
 * ```
 * [
 *  [ 0, 1, 2 ], // column 1
 *  [ 0, 1, 2 ], // column 2
 *  [ 0, 1, 2 ], // column 3
 * ]
 * ```
 */
var Chunker = /** @class */ (function () {
    function Chunker(store, columnNames) {
        this.store = store;
        this.columnNames = columnNames;
        this.chunkIndex = 0;
        this.clear();
    }
    /**
     * Transpose an array of rows into column vectors and store
     * them as a chunk
     */
    Chunker.prototype.addRowChunk = function (rows, cb, flush) {
        if (cb === void 0) { cb = (function () { }); }
        if (flush === void 0) { flush = true; }
        return __awaiter(this, void 0, void 0, function () {
            var i, row, j;
            return __generator(this, function (_a) {
                for (i = 0; i < rows.length; i++) {
                    row = rows[i];
                    for (j = 0; j < row.length; j++) {
                        this.vectors[j].push(row[j]);
                    }
                }
                if (flush) {
                    return [2 /*return*/, this.writeChunk(cb)];
                }
                return [2 /*return*/];
            });
        });
    };
    Chunker.prototype.flush = function () {
        return this.writeChunk();
    };
    /**
     * Store a record of column vectors as a chunk
     */
    Chunker.prototype.addColumnVectors = function (columnVectors, cb) {
        for (var i = 0; i < this.columnNames.length; i++) {
            this.vectors[i] = columnVectors[this.columnNames[i]];
        }
        return this.writeChunk();
    };
    Chunker.prototype.writeChunk = function (cb) {
        var _this = this;
        if (cb === void 0) { cb = (function () { }); }
        return this.store.writeChunk(this)
            .then(function () {
            _this.chunkIndex++;
            _this.clear();
            cb();
        });
    };
    Chunker.prototype.clear = function () {
        this.vectors = this.columnNames.map(function () { return []; });
    };
    return Chunker;
}());
exports.Chunker = Chunker;
//# sourceMappingURL=chunker.js.map