"use strict";
/// <reference lib="webworker" />
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doWork = exports.listener = void 0;
var data_vector_store_1 = require("../common/data-vector-store");
var transform_work_request_1 = require("../common/interfaces/transform-work-request");
var index_1 = require("../../index");
addEventListener('message', listener);
function listener(event) {
    return __awaiter(this, void 0, void 0, function () {
        var workResult, result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!event.data.workRequest && !transform_work_request_1.isXyloTranformWork(event.data.workRequest)) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, doWork(event.data.workRequest)];
                case 2:
                    result = _a.sent();
                    workResult = {
                        uuid: event.data.uuid,
                        success: true,
                        result: result,
                    };
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    workResult = {
                        uuid: event.data.uuid,
                        success: false,
                        error: e_1.toString(),
                    };
                    return [3 /*break*/, 4];
                case 4:
                    postMessage(workResult);
                    return [2 /*return*/];
            }
        });
    });
}
exports.listener = listener;
function doWork(work) {
    return __awaiter(this, void 0, void 0, function () {
        var store, loaded, global, transformers, dataVectors, stored;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('work', work);
                    store = new data_vector_store_1.DataVectorStore(work.key);
                    console.log('store', store);
                    return [4 /*yield*/, store.load(work.url)];
                case 1:
                    loaded = _b.sent();
                    console.log('worker retrieved performance rows', loaded);
                    if (!loaded || (work.revision && loaded.revision !== work.revision)) {
                        throw {
                            status: 404,
                            name: 'notfound',
                            message: 'No data found to transform',
                            error: true,
                        };
                    }
                    if (!work.transforms.length) {
                        return [2 /*return*/, {
                                revision: loaded.revision,
                                transformCount: 0,
                            }];
                    }
                    global = self;
                    if (!global.xyla) {
                        global.xyla = index_1.xyla;
                    }
                    transformers = work.transforms.map(function (transform) {
                        var transformer = transform.path.reduce(function (p, c) { return p[c]; }, global);
                        if (transform.factoryParams) {
                            transformer = transformer.apply(transformer, transform.factoryParams);
                        }
                        return transformer;
                    });
                    dataVectors = (_a = index_1.xyla.tools).transformVectors.apply(_a, __spreadArrays([loaded.dataVectors], transformers));
                    return [4 /*yield*/, store.save(work.url, dataVectors, loaded.time, loaded.revision)];
                case 2:
                    stored = _b.sent();
                    return [2 /*return*/, {
                            revision: stored.revision,
                            transformCount: transformers.length,
                        }];
            }
        });
    });
}
exports.doWork = doWork;
//# sourceMappingURL=transform.worker.js.map