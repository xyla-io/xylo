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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
var papaparse_1 = __importDefault(require("papaparse"));
var pako = __importStar(require("pako"));
var chunker_1 = require("./chunker");
var Loader = /** @class */ (function () {
    function Loader(store) {
        this.store = store;
    }
    /**
     * Stream a remote CSV file in chunks and store it in a local browser database.
     * As the rows are streamed they are broken up by column for convenient column-wise
     * access.
     */
    Loader.prototype.loadUncompressed = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var chunker;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('load');
                        return [4 /*yield*/, this.store.destroy()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                papaparse_1.default.parse(url, {
                                    download: true,
                                    chunk: function (results, parser) {
                                        var rows = results.data;
                                        // Always expect a header row and shift it out
                                        if (!chunker) {
                                            chunker = new chunker_1.Chunker(_this.store, rows.shift());
                                        }
                                        parser.pause();
                                        chunker.addRowChunk(rows, function () {
                                            parser.resume();
                                        });
                                    },
                                    complete: function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, this.store.writeManifest(chunker.columnNames, chunker.chunkIndex)];
                                                case 1:
                                                    _a.sent();
                                                    console.timeEnd('load');
                                                    resolve();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); },
                                });
                            })];
                }
            });
        });
    };
    Loader.prototype.fetchChunk = function (start) {
        return __awaiter(this, void 0, void 0, function () {
            var headers;
            var _this = this;
            return __generator(this, function (_a) {
                headers = new Headers();
                headers.append('Range', "bytes=" + start + "-" + (start + Loader.chunkSize - 1));
                fetch(this.download.url, {
                    headers: headers,
                }).then(function (response) {
                    var contentRange = response.headers.get('Content-Range');
                    var _a = contentRange.split(' ')[1].split('/'), range = _a[0], total = _a[1];
                    var _b = range.split('-'), rangeStart = _b[0], rangeEnd = _b[1];
                    _this.download.totalBytes = +total;
                    _this.download.downloadedBytes = +rangeEnd + 1;
                    return response.arrayBuffer();
                }).then(function (data) {
                    // @ts-ignore -- @types/pako doesn't have Z_ constants
                    var flag = pako.Z_SYNC_FLUSH;
                    var bytes = new Uint8Array(data);
                    _this.download.inflator.push(bytes, flag);
                });
                return [2 /*return*/];
            });
        });
    };
    Loader.prototype.downloadComplete = function () {
        var inflator = this.download.inflator;
        inflator.push([], true);
        console.log('done');
    };
    Loader.prototype.next = function (start) {
        console.log('next');
        this.download.next.dispatchEvent(new CustomEvent('next', { detail: { start: start } }));
    };
    Loader.prototype.load = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var loaderThis, chunker, tail, inflator;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('load');
                        loaderThis = this;
                        return [4 /*yield*/, this.store.destroy()];
                    case 1:
                        _a.sent();
                        tail = '';
                        inflator = new pako.Inflate();
                        this.download = {
                            url: url,
                            inflator: inflator,
                            buffer: [],
                            next: new EventTarget(),
                        };
                        this.download.next.addEventListener('next', function (ev) {
                            _this.fetchChunk(ev.detail.start);
                        });
                        inflator.onEnd = function (status) {
                            // loaderThis.next(loaderThis.download.downloadedBytes);
                            // Always expect a header row and shift it out
                            var text = this.chunks.reduce(function (txt, chunk) {
                                var decoded = new TextDecoder('utf-8').decode(chunk);
                                return txt + decoded;
                            }, tail);
                            this.chunks = [];
                            var rows = papaparse_1.default.parse(text).data;
                            if (!chunker) {
                                chunker = new chunker_1.Chunker(loaderThis.store, rows.shift());
                            }
                            var isDone = loaderThis.download.downloadedBytes < loaderThis.download.totalBytes;
                            if (!isDone) {
                                tail = rows.pop().join(',');
                            }
                            chunker.addRowChunk(rows).then(function () {
                                if (!isDone) {
                                    loaderThis.next(loaderThis.download.downloadedBytes);
                                }
                                else {
                                    chunker.flush().then(function () {
                                        loaderThis.store.writeManifest(chunker.columnNames, chunker.chunkIndex).then(function () {
                                            console.timeEnd('load');
                                            loaderThis.downloadComplete();
                                        });
                                    });
                                }
                            });
                        };
                        // inflator.onData = function (chunk: Uint8Array) {
                        // };
                        this.next(0);
                        return [2 /*return*/];
                }
            });
        });
    };
    Loader.chunkSize = 100000;
    return Loader;
}());
exports.Loader = Loader;
//# sourceMappingURL=loader.js.map