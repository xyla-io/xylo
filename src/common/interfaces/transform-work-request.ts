import { WorkRequest } from "./work-request";

export const XyloTransformWorkRequestType = 'xylo_transform_work_request';

export interface XyloTransformWorkTransform {
  path: string[];
  factoryParams?: any[];
};

export interface XyloTransformWork extends WorkRequest {
  workRequestType: 'xylo_transform_work_request';
  key: string;
  url: string;
  revision?: string;
  transforms: XyloTransformWorkTransform[];
};

export interface XyloTransformWorkResult {
  revision: string;
  transformCount: number;
};

export function isXyloTranformWork(obj: any): obj is XyloTransformWork {
  return obj && obj.WorkRequestType === XyloTransformWorkRequestType;
}