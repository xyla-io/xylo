/// <reference lib="webworker" />

import { DataVectorStore, StoredDataVectors } from '../common/data-vector-store';
import { isXyloTranformWork, XyloTransformWork, XyloTransformWorkResult } from '../common/interfaces/transform-work-request';
import { WorkResult } from '../common/interfaces/work-request';
import { xyla } from '../../index';

addEventListener('message', listener);

export async function listener(event: MessageEvent) {
  if (!event.data.workRequest && !isXyloTranformWork(event.data.workRequest)) { return; }
  let workResult: WorkResult;
  try {
    const result = await doWork(event.data.workRequest);
    workResult = {
      uuid: event.data.uuid,
      success: true,
      result: result,
    }
  } catch (e) {
    workResult = {
      uuid: event.data.uuid,
      success: false,
      error: e.toString(),
    };
  }
  postMessage(workResult);
}

export async function doWork(work: XyloTransformWork): Promise<XyloTransformWorkResult> {
  console.log('work', work);
  const store = new DataVectorStore(work.key);
  console.log('store', store);
  const loaded = await store.load(work.url);
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
    return {
      revision: loaded.revision,
      transformCount: 0,
    };
  }

  const global = self as any;
  if (!global.xyla) {
    global.xyla = xyla;
  }
  const transformers = work.transforms.map(transform => {
    let transformer = transform.path.reduce((p, c) => p[c], global);
    if (transform.factoryParams) {
      transformer = transformer.apply(transformer, transform.factoryParams);
    }
    return transformer;
  });
  const dataVectors = xyla.tools.transformVectors(loaded.dataVectors, ...transformers);
  const stored = await store.save(work.url, dataVectors, loaded.time, loaded.revision);
  return {
    revision: stored.revision,
    transformCount: transformers.length,
  };
}
