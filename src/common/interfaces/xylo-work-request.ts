import { WorkRequest } from './work-request';

export interface ModelWork extends WorkRequest {
  dbName: string;
  key: string;
  [x: string]: any;
}
