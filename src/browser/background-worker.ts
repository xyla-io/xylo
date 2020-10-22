import { v4 as uuid } from 'uuid';
import { Runner } from '../common/interfaces/runner';

export enum WorkerType {
  Model = 'model',
}

export function isWorkerType(obj: any): obj is WorkerType {
  return Object.values(WorkerType).includes(obj);
}

export class BackgroundWorker implements Runner {
  private worker: Worker;
  private promises: Record<string, { resolve: Function, reject: Function }> = {};
  identifier: string;
  autoTerminate: boolean

  private static newWorker(workerType: WorkerType|string): Worker {
    const workerPath = isWorkerType(workerType) ? `${workerType}.worker.js` : workerType as string;
    return new Worker(workerPath, {type: 'module'});
  }

  /**
   * Create a new `Worker` (web worker) according to the type
   * of work needed to perform
   * @param workerType the type of the worker (file prefix)
   */
  constructor(workerType: WorkerType|string|Worker, name: string|null = null, autoTerminate: boolean = true) {
    this.identifier = (name ? name : String(workerType)) + '-' + uuid();
    this.autoTerminate = autoTerminate;
    this.worker = workerType instanceof Worker ? workerType : BackgroundWorker.newWorker(workerType);
    this.worker.onmessage = (event: MessageEvent) => {
      // console.log('background worker on message', event);
      if (!event.data && !this.promises[event.data.uuid]) { throw new Error('No valid UUID in message from background worker ' + this.identifier); }
      const data = event.data;
      if (data.success) {
        this.promises[data.uuid].resolve(data.result);
      } else {
        this.promises[data.uuid].reject(data.error);
      }
      delete this.promises[data.uuid];
      if (this.autoTerminate && !Object.keys(this.promises).length) { this.terminate(); }
    };
    this.worker.onerror = (error) => {
      console.error('Error in BackgroundWorker ' + this.identifier, error);
      throw error;
    };
  }

  /**
   * Initiate some background work
   */
  run<I, O>(workRequest: I): Promise<O> {
    const promiseId = uuid();
    return new Promise((resolve, reject) => {
      this.promises[promiseId] = { resolve, reject };
      this.worker.postMessage({ workRequest, uuid: promiseId});
    });
  }

  /**
   * Terminate all work
   */
  terminate() {
    console.log('Terminating BackgroundWorker ' + this.identifier);
    this.worker.terminate();
  }
}
