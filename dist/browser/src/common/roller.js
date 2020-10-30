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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roller = void 0;
var row_filter_1 = require("./aggregation/row-filter");
var store_1 = require("./store");
var chunker_1 = require("./chunker");
// TODO: can we replace with nest or other D3 collection?
// export interface DataSetGroup {
//   groupKey: string;
//   groupValue: string;
//   dataSet: DataSet;
// }
var Roller = /** @class */ (function () {
    function Roller(columns, options) {
        if (options === void 0) { options = {}; }
        this.columns = columns;
        var columnNameSet = new Set();
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            for (var _a = 0, _b = ['sumColumn', 'numeratorColumn', 'denominatorColumn']; _a < _b.length; _a++) {
                var key = _b[_a];
                if (column[key]) {
                    columnNameSet.add(column[key]);
                }
            }
        }
        this.breakdowns = options.breakdowns || [];
        for (var _c = 0, _d = this.breakdowns; _c < _d.length; _c++) {
            var breakdown = _d[_c];
            columnNameSet.add(breakdown.groupColumn);
        }
        this.rowFilters = [].concat.apply([], __spreadArrays([options.rowFilters || []], [].concat.apply([], columns.map(function (column) { return (column.options.rowFilters || []); }))));
        for (var _e = 0, _f = this.rowFilters; _e < _f.length; _e++) {
            var filter = _f[_e];
            columnNameSet.add(filter.column);
        }
        this.columnNames = Array.from(columnNameSet);
    }
    Roller.prototype.removeRow = function (rowIndex) {
        var _this = this;
        Object.keys(this.columnVectors).forEach(function (key) {
            _this.columnVectors[key].splice(rowIndex, 1);
        });
    };
    Roller.prototype.iteration = function (rowIndex) {
        for (var _i = 0, _a = this.rowFilters; _i < _a.length; _i++) {
            var filter = _a[_i];
            var value = this.columnVectors[filter.column][rowIndex];
            var keep = row_filter_1.RowFilterOps.operations[filter.operator](value, filter.value);
            if (!keep) {
                return rowIndex;
            }
        }
        for (var _b = 0, _c = this.breakdowns; _b < _c.length; _b++) {
            var breakdown = _c[_b];
            var groupValue = this.columnVectors[breakdown.groupColumn][rowIndex];
        }
        return rowIndex + 1;
    };
    Roller.prototype.roll = function (store, options) {
        var e_1, _a;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var resultStore, resultChunker, chunkIndex, _b, _c, chunk, tracker, _i, _d, doc, column, rowIndex, e_1_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        resultStore = new store_1.Store(store.key + "_result");
                        return [4 /*yield*/, resultStore.destroy()];
                    case 1:
                        _e.sent();
                        resultChunker = new chunker_1.Chunker(resultStore, this.columnNames);
                        chunkIndex = 0;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 8, 9, 14]);
                        _b = __asyncValues(store.chunks(this.columnNames));
                        _e.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _e.sent(), !_c.done)) return [3 /*break*/, 7];
                        chunk = _c.value;
                        tracker = void 0;
                        this.columnVectors = {};
                        for (_i = 0, _d = chunk.rows; _i < _d.length; _i++) {
                            doc = _d[_i].doc;
                            column = doc;
                            // The tracker can be any of the column vectors since they
                            // must all remain of equal length
                            tracker = column.vector;
                            this.columnVectors[column.name] = column.vector;
                        }
                        console.log('before', chunkIndex, tracker.length);
                        rowIndex = 0;
                        while (rowIndex < tracker.length) {
                            rowIndex = this.iteration(rowIndex);
                        }
                        // Store the results
                        return [4 /*yield*/, resultChunker.addColumnVectors(this.columnVectors)];
                    case 5:
                        // Store the results
                        _e.sent();
                        chunkIndex += 1;
                        console.log(this.columnVectors['channel'].reduce(function (s, x) { s.add(x); return s; }, new Set()));
                        console.log('after', chunkIndex, tracker.length);
                        _e.label = 6;
                    case 6: return [3 /*break*/, 3];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _e.trys.push([9, , 12, 13]);
                        if (!(_c && !_c.done && (_a = _b.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, _a.call(_b)];
                    case 10:
                        _e.sent();
                        _e.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14: return [4 /*yield*/, resultStore.writeManifest(this.columnNames, chunkIndex)];
                    case 15:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Roller.rowNameColumn = 'rowName';
    return Roller;
}());
exports.Roller = Roller;
//# sourceMappingURL=roller.js.map