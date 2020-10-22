import { Store } from './store';

/**
 * A 2D matrix. Insert rows, store as columns.
 * ```
 * [
 *  [ 0, 1, 2 ], // column 1
 *  [ 0, 1, 2 ], // column 2
 *  [ 0, 1, 2 ], // column 3
 * ]
 * ```
 */
export class Chunker {

  chunkIndex = 0;
  vectors: any[][];

  constructor(private store: Store, public columnNames: string[]) {
    this.clear();
  }

  /**
   * Transpose an array of rows into column vectors and store
   * them as a chunk
   */
  public async addRowChunk(rows: any[][], cb: () => void = (() => {}), flush = true): Promise<any> {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.length; j++) {
        this.vectors[j].push(row[j]);
      }
    }
    if (flush) {
      return this.writeChunk(cb);
    }
  }

  public flush() {
    return this.writeChunk();
  }

  /**
   * Store a record of column vectors as a chunk
   */
  public addColumnVectors(columnVectors: Record<string, any[]>, cb?: () => void): Promise<any> {
    for (let i = 0; i < this.columnNames.length; i++) {
      this.vectors[i] = columnVectors[this.columnNames[i]];
    }
    return this.writeChunk();
  }

  private writeChunk(cb: () => void = (() => {})): Promise<any> {
    return this.store.writeChunk(this)
    .then(() => {
      this.chunkIndex++;
      this.clear();
      cb();
    });
  }

  private clear() {
    this.vectors = this.columnNames.map(() => []);
  }

}
