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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
var PouchDB = __importStar(require("pouchdb/dist/pouchdb"));
var roller_1 = require("./roller");
var loader_1 = require("./loader");
var Store = /** @class */ (function () {
    function Store(key) {
        this.key = key;
        this.initialize();
    }
    Store.chunkDocId = function (chunkIndex, columnName) {
        return "#vector:" + columnName + ":#" + String(chunkIndex).padStart(4, '0');
    };
    Store.manifestId = function () {
        return "#manifest";
    };
    Store.prototype.initialize = function () {
        this.db = new PouchDB(this.key);
    };
    Store.prototype.destroy = function () {
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
    /**
     * Update a document in the specified database or add a new document if
     * one doesn't exist with the same _id
     * @param db the database to add the document to
     * @param doc the document (plain object) to update with an _id in it
     */
    Store.prototype.upsert = function (doc) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get(doc._id)];
                    case 1:
                        existing = _a.sent();
                        return [2 /*return*/, this.db.put(Object.assign(existing, doc))];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.name !== 'not_found') {
                            throw error_1;
                        }
                        return [2 /*return*/, this.db.put(doc)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a new document to the specified database
     * @param db the database to add the document to
     * @param doc the document (plain object) to add with an _id in it
     */
    Store.prototype.post = function (doc) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.put(doc)];
            });
        });
    };
    /**
     * Add a new document to the specified database
     * @param db the database to add the document to
     * @param  the document (plain object) to add with an _id in it
     */
    Store.prototype.writeManifest = function (columnNames, chunkCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('writing manifest');
                return [2 /*return*/, this.post({
                        _id: Store.manifestId(),
                        chunkCount: chunkCount,
                        columnNames: columnNames,
                    })];
            });
        });
    };
    /**
     * Write a chunk of data (as equal length column vectors)
     */
    Store.prototype.writeChunk = function (chunker) {
        return __awaiter(this, void 0, void 0, function () {
            var docs;
            return __generator(this, function (_a) {
                console.log('writing chunk', chunker.chunkIndex);
                docs = chunker.columnNames.map(function (name, i) {
                    var _id = Store.chunkDocId(chunker.chunkIndex, name);
                    return {
                        _id: _id,
                        name: name,
                        vector: chunker.vectors[i],
                    };
                });
                return [2 /*return*/, this.db.bulkDocs(docs)];
            });
        });
    };
    /**
     * Get the manifest for the current database, which provides
     * information about the columns and chunk
     */
    Store.prototype.getManifest = function () {
        return this.db.get(Store.manifestId());
    };
    Store.prototype.chunks = function (columnNames) {
        return __asyncGenerator(this, arguments, function chunks_1() {
            var manifest, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, __await(this.getManifest())];
                    case 1:
                        manifest = _a.sent();
                        console.log('manifest', manifest);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < manifest.chunkCount)) return [3 /*break*/, 6];
                        return [4 /*yield*/, __await(this.getChunk(i, columnNames))];
                    case 3: return [4 /*yield*/, _a.sent()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Store.prototype.getChunk = function (chunkIndex, columnNames) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('reading chunk', chunkIndex);
                return [2 /*return*/, this.db.allDocs({
                        include_docs: true,
                        keys: columnNames.map(function (name) { return Store.chunkDocId(chunkIndex, name); }),
                    })];
            });
        });
    };
    Store.prototype.compute = function (_a) {
        var key = _a.key, columns = _a.columns, _b = _a.options, options = _b === void 0 ? {} : _b;
        return __awaiter(this, void 0, void 0, function () {
            var roller;
            return __generator(this, function (_c) {
                console.log('compute', columns, options);
                roller = new roller_1.Roller(columns, options);
                return [2 /*return*/, roller.roll(this)];
            });
        });
    };
    /**
     * Stream a remote CSV file in chunks and store it in a local browser database.
     * As the rows are streamed they are broken up by column for convenient column-wise
     * access.
     */
    Store.prototype.load = function (_a) {
        var url = _a.url, key = _a.key;
        return __awaiter(this, void 0, void 0, function () {
            var loader;
            return __generator(this, function (_b) {
                loader = new loader_1.Loader(this);
                return [2 /*return*/, loader.load(url)];
            });
        });
    };
    return Store;
}());
exports.Store = Store;
//# sourceMappingURL=store.js.map