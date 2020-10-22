import * as PouchDB from 'pouchdb/dist/pouchdb';
import {
  XyloInterface,
  LoadArgs,
  ComputeArgs,
} from './interfaces/xylo-interface';
import { TemplateColumn } from './interfaces';
import { Roller } from './roller';
import { Chunker } from './chunker';
import { Loader } from './loader';

export interface Manifest {
  _id: string;
  chunkCount: number;
  columnNames: string[];
}

export interface Slice {
  _id: string;
  name: string;
  vector: any[];
}

export class Store implements XyloInterface {

  db: PouchDB.Database;

  public static chunkDocId(chunkIndex: number, columnName: string) {
    return `#vector:${columnName}:#${String(chunkIndex).padStart(4, '0')}`;
  }

  public static manifestId() {
    return `#manifest`;
  }

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

  /**
   * Update a document in the specified database or add a new document if
   * one doesn't exist with the same _id
   * @param db the database to add the document to
   * @param doc the document (plain object) to update with an _id in it
   */
  private async upsert(doc: { _id: string, [x: string]: any }) {
    try {
      const existing = await this.db.get(doc._id);
      return this.db.put(Object.assign(existing, doc));
    } catch (error) {
      if (error.name !== 'not_found') { throw error; }
      return this.db.put(doc);
    }
  }

  /**
   * Add a new document to the specified database
   * @param db the database to add the document to
   * @param doc the document (plain object) to add with an _id in it
   */
  private async post(doc: { _id: string, [x: string]: any}) {
    return this.db.put(doc);
  }

  /**
   * Add a new document to the specified database
   * @param db the database to add the document to
   * @param  the document (plain object) to add with an _id in it
   */
  async writeManifest(columnNames, chunkCount) {
    console.log('writing manifest');
    return this.post({
      _id: Store.manifestId(),
      chunkCount,
      columnNames,
    });
  }

  /**
   * Write a chunk of data (as equal length column vectors)
   */
  async writeChunk(chunker: Chunker) {
    console.log('writing chunk', chunker.chunkIndex);
    const docs = chunker.columnNames.map((name, i) => {
      const _id = Store.chunkDocId(chunker.chunkIndex, name);
      return {
        _id,
        name,
        vector: chunker.vectors[i],
      };
    });
    return this.db.bulkDocs(docs);
  }

  /**
   * Get the manifest for the current database, which provides
   * information about the columns and chunk
   */
  getManifest(): Promise<Manifest> {
    return this.db.get(Store.manifestId());
  }

  async *chunks(columnNames: string[]) {
    const manifest = await this.getManifest();
    console.log('manifest', manifest);
    for (let i = 0; i < manifest.chunkCount; i++) {
      yield this.getChunk(i, columnNames);
    }
  }

  async getChunk(chunkIndex: number, columnNames: string[]) {
    console.log('reading chunk', chunkIndex);
    return this.db.allDocs({
      include_docs: true,
      keys: columnNames.map(name => Store.chunkDocId(chunkIndex, name)),
    });
  }

  async compute({ key, columns, options = {} }: ComputeArgs) {
    console.log('compute', columns, options);
    const roller = new Roller(columns, options);
    return roller.roll(this);
  }

  /**
   * Stream a remote CSV file in chunks and store it in a local browser database.
   * As the rows are streamed they are broken up by column for convenient column-wise
   * access.
   */
  async load({ url, key }: LoadArgs) {
    const loader = new Loader(this);
    return loader.load(url);
  }

}
