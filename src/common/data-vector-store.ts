// Importing from 'pouchDB' causes a global is undefined error in Angular 6 and its web workers. See https://github.com/pouchdb/pouchdb/issues/7263
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { DataVector } from './parasite/transformable';

export interface StoredDataVectors {
  url: string;
  revision: string;
  dataVectors: DataVector[];
  time: Date;
}

export class DataVectorStore {
  db: PouchDB.Database;

  constructor(public key: string) {
    this.initialize();
  }

  private initialize() {
    this.db = new PouchDB(this.key);
  }
  
  async destroy() {
    await this.db.destroy();
    this.initialize();
  }

  async save(url: string, dataVectors: DataVector[], time?: Date, revision?: string): Promise<StoredDataVectors> {
    // The :time doc will be in a best-effort state subject to race conditions.
    if (!time) { time = new Date(); }
    const docs = await this.db.allDocs({
      startkey: this.dataID(url),
      endkey: this.timeID(url),
    });
    if (revision && (!docs.rows[0] || docs.rows[0].value.rev !== revision)) {
      throw { 
        status: 409,
        name: 'conflict',
        message: 'Revision mismatch conflict',
        error: true,
      };
    }
    const putDocs: Record<string, any>[] = [
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
    docs.rows.forEach((r, i) => putDocs[i]._rev = r.value.rev);
    const response = await this.db.bulkDocs(putDocs);
    const errors = response.map((r, i) => Object.assign({ id: putDocs[i]._id}, r)).filter(r => r.error);
    if (errors.length) {
      throw {
        status: 500,
        name: 'batcherror',
        message: 'Batch update errors',
        error: true,
        errors: errors,
      };
    }

    return {
      url: url,
      revision: response[0].rev,
      time: time,
      dataVectors: dataVectors,
    };
  }

  async loadData(url: string, time?: Date): Promise<DataVector[]|null> {
    const doc = await this.get(this.dataID(url));
    if (time && new Date(doc.time) < time) { return null; }
    return doc ? doc.dataVectors : null;
  }

  async loadTime(url: string): Promise<Date|null> {
    const doc = await this.get(this.timeID(url));
    return doc ? new Date(doc.time) : null;
  }

  async load(url: string, time?: Date, revision?: string): Promise<StoredDataVectors|null> {
    let doc;
    try {
      doc = await this.db.get(this.dataID(url));
    } catch (error) {
      if (error.name !== 'not_found') { throw error; }
      return null;
    }
    if (revision && doc._rev !== revision) { return null; }
    const storedTime = new Date(doc.time);
    if (time && storedTime < time) { return null; }
    return {
      url: url,
      revision: doc._rev,
      dataVectors: doc.dataVectors,
      time: storedTime,
    };
  }

  async remove(url, revision?: string): Promise<boolean> {
    const docs = await this.db.allDocs({
      startkey: this.dataID(url),
      endkey: this.timeID(url),
    });
    if (!docs.total_rows) { return false; }
    if (revision && docs.rows[0].value.rev !== revision) { return false; }
    const deleteDocs = docs.rows.map(r => ({
      _id: r.id,
      _rev: r.value.rev,
      _deleted: true,
    }));
    const response =await this.db.bulkDocs(deleteDocs);
    const errors = response.map((r, i) => Object.assign({ id: deleteDocs[i]._id}, r)).filter(r => r.error);
    if (errors.length) {
      throw {
        status: 500,
        name: 'batcherror',
        message: 'Batch remove errors',
        error: true,
        errors: errors,
      };
    }
    return true;
  }

  private dataID(url: string): string {
    return url + ' :data';
  }

  private timeID(url: string): string {
    return url + ' :time';
  }

  private async get(key: string): Promise<any> {
    try {
      const doc = await this.db.get(key);
      return doc;
    } catch (e) {
      if (e.name === 'not_found') {
        return null;
      } else {
        throw e;
      }
    }
  }

  //#region Transform

  // async transform(url: string, transforms: [string, [any]][], time?: Date): Promise<boolean> {
  //   const worker = new BackgroundWorker('transform');
  //   const result = await worker.run({});
  //   return false;
  // }

  //#endregion
}