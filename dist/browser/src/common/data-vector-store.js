"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.DataVectorStore = void 0;
// Importing from 'pouchDB' causes a global is undefined error in Angular 6 and its web workers. See https://github.com/pouchdb/pouchdb/issues/7263
var PouchDB = __importStar(require("pouchdb/dist/pouchdb"));
var DataVectorStore = /** @class */ (function () {
    function DataVectorStore(key) {
        this.key = key;
        this.initialize();
    }
    DataVectorStore.prototype.initialize = function () {
        this.db = new PouchDB(this.key);
    };
    DataVectorStore.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.destroy()];
                    case 1:
                        _a.sent();
                        this.initialize();
                        return [2 /*return*/];
                }
            });
        });
    };
    DataVectorStore.prototype.save = function (url, dataVectors, time, revision) {
        return __awaiter(this, void 0, void 0, function () {
            var docs, putDocs, response, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // The :time doc will be in a best-effort state subject to race conditions.
                        if (!time) {
                            time = new Date();
                        }
                        return [4 /*yield*/, this.db.allDocs({
                                startkey: this.dataID(url),
                                endkey: this.timeID(url),
                            })];
                    case 1:
                        docs = _a.sent();
                        if (revision && (!docs.rows[0] || docs.rows[0].value.rev !== revision)) {
                            throw {
                                status: 409,
                                name: 'conflict',
                                message: 'Revision mismatch conflict',
                                error: true,
                            };
                        }
                        putDocs = [
                            {
                                _id: this.dataID(url),
                                dataVectors: dataVectors,
                                time: time.getTime(),
                            },
                            {
                                _id: this.timeID(url),
                                time: time.getTime(),
                            },
                        ];
                        docs.rows.forEach(function (r, i) { return putDocs[i]._rev = r.value.rev; });
                        return [4 /*yield*/, this.db.bulkDocs(putDocs)];
                    case 2:
                        response = _a.sent();
                        errors = response.map(function (r, i) { return Object.assign({ id: putDocs[i]._id }, r); }).filter(function (r) { return r.error; });
                        if (errors.length) {
                            throw {
                                status: 500,
                                name: 'batcherror',
                                message: 'Batch update errors',
                                error: true,
                                errors: errors,
                            };
                        }
                        return [2 /*return*/, {
                                url: url,
                                revision: response[0].rev,
                                time: time,
                                dataVectors: dataVectors,
                            }];
                }
            });
        });
    };
    DataVectorStore.prototype.loadData = function (url, time) {
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(this.dataID(url))];
                    case 1:
                        doc = _a.sent();
                        if (time && new Date(doc.time) < time) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, doc ? doc.dataVectors : null];
                }
            });
        });
    };
    DataVectorStore.prototype.loadTime = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(this.timeID(url))];
                    case 1:
                        doc = _a.sent();
                        return [2 /*return*/, doc ? new Date(doc.time) : null];
                }
            });
        });
    };
    DataVectorStore.prototype.load = function (url, time, revision) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, error_1, storedTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get(this.dataID(url))];
                    case 1:
                        doc = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.name !== 'not_found') {
                            throw error_1;
                        }
                        return [2 /*return*/, null];
                    case 3:
                        if (revision && doc._rev !== revision) {
                            return [2 /*return*/, null];
                        }
                        storedTime = new Date(doc.time);
                        if (time && storedTime < time) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                url: url,
                                revision: doc._rev,
                                dataVectors: doc.dataVectors,
                                time: storedTime,
                            }];
                }
            });
        });
    };
    DataVectorStore.prototype.remove = function (url, revision) {
        return __awaiter(this, void 0, void 0, function () {
            var docs, deleteDocs, response, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.allDocs({
                            startkey: this.dataID(url),
                            endkey: this.timeID(url),
                        })];
                    case 1:
                        docs = _a.sent();
                        if (!docs.total_rows) {
                            return [2 /*return*/, false];
                        }
                        if (revision && docs.rows[0].value.rev !== revision) {
                            return [2 /*return*/, false];
                        }
                        deleteDocs = docs.rows.map(function (r) { return ({
                            _id: r.id,
                            _rev: r.value.rev,
                            _deleted: true,
                        }); });
                        return [4 /*yield*/, this.db.bulkDocs(deleteDocs)];
                    case 2:
                        response = _a.sent();
                        errors = response.map(function (r, i) { return Object.assign({ id: deleteDocs[i]._id }, r); }).filter(function (r) { return r.error; });
                        if (errors.length) {
                            throw {
                                status: 500,
                                name: 'batcherror',
                                message: 'Batch remove errors',
                                error: true,
                                errors: errors,
                            };
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    DataVectorStore.prototype.dataID = function (url) {
        return url + ' :data';
    };
    DataVectorStore.prototype.timeID = function (url) {
        return url + ' :time';
    };
    DataVectorStore.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get(key)];
                    case 1:
                        doc = _a.sent();
                        return [2 /*return*/, doc];
                    case 2:
                        e_1 = _a.sent();
                        if (e_1.name === 'not_found') {
                            return [2 /*return*/, null];
                        }
                        else {
                            throw e_1;
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DataVectorStore;
}());
exports.DataVectorStore = DataVectorStore;
//# sourceMappingURL=data-vector-store.js.map