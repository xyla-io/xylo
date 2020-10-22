import { Store, Slice } from './store';
import { Chunker } from './chunker';

type Actor = (
  index: number,
  columnVectors: Record<string, any[]>,
  actions: IterationActions
) => ActionResult;

export interface Actors {
  filtering: Actor[];
  grouping: Actor[];
  collecting: Actor[];
}

export interface IterationActions {
  removeRow: Function;
  groupBy: Function;
}

export enum ActionKey {
  None = 'none',
  RemoveRow = 'removeRow',
  GroupBy = 'groupBy',
}

export interface ActionResult {
  actionKey: ActionKey;
  [x: string]: any;
}

export class Looper {

  private static actions: IterationActions = {

    removeRow: (rowIndex: number, columnVectors: Record<string, any[]>): ActionResult => {
      Object.keys(columnVectors).forEach(key => {
        columnVectors[key].splice(rowIndex, 1);
      });
      return { actionKey: ActionKey.RemoveRow };
    },

    groupBy: (rowIndex: number, columnVectors: Record<string, any[]>): ActionResult => {
      return { actionKey: ActionKey.GroupBy };
    }

  };

  private runActors(rowIndex: number, columnVectors: Record<string, any[]>, actors: Actor[]): number {
    for (const f of actors) {
      const actionResult = f(rowIndex, columnVectors, Looper.actions);
      if (actionResult) {
        switch (actionResult.actionKey) {
        // Do not increment the index if the row was removed
        case ActionKey.RemoveRow: return rowIndex;
        }
      }
    }
    return rowIndex + 1;
  }

  async loop(inputStore: Store, columnNames: string[], options) {
    const resultStore = new Store(`${inputStore.key}_result`);
    await resultStore.destroy();
    const resultChunker = new Chunker(resultStore, columnNames);

    let chunkIndex = 0;
    for await (const chunk of inputStore.chunks(columnNames)) {
      let tracker;
      const columnVectors = {};

      for (const { doc } of chunk.rows) {
        const column = doc as any;
        // The tracker can be any of the column vectors since they
        // must all remain of equal length
        tracker = column.vector;
        columnVectors[column.name] = column.vector;
      }
      console.log('before', chunkIndex, tracker.length);

      // Run all actors on every row
      let rowIndex = 0;
      while (rowIndex < tracker.length) {
        rowIndex = this.runActors(rowIndex, columnVectors, options);
      }
      // Store the results
      await resultChunker.addColumnVectors(columnVectors);
      chunkIndex += 1;

      console.log(columnVectors['channel'].reduce((s, x) => { s.add(x); return s; }, new Set()));
      console.log('after', chunkIndex, tracker.length);
    }
    await resultStore.writeManifest(columnNames, chunkIndex);
  }

}
