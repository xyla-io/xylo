"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isXyloTranformWork = exports.XyloTransformWorkRequestType = void 0;
exports.XyloTransformWorkRequestType = 'xylo_transform_work_request';
;
;
;
function isXyloTranformWork(obj) {
    return obj && obj.WorkRequestType === exports.XyloTransformWorkRequestType;
}
exports.isXyloTranformWork = isXyloTranformWork;
//# sourceMappingURL=transform-work-request.js.map