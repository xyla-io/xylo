import { Injectable } from '@angular/core';
import {
  Model,
  ColumnType,
  TemplateType,
  ComparisonOperator,
} from 'xylo';

@Injectable({
  providedIn: 'root'
})
export class XyloService {
  model: Model;

  constructor() {
    this.model = new Model();
  }

  async load() {
    const url = 'assets/demo_data.csv';
    await this.model.load({url, key: 'small'});

    // await this.model.compute({
    //   key: '30-days',
    //   columns: [
    //     {
    //       metadata: {
    //         identifier: 'spend',
    //         templateType: TemplateType.Column,
    //         columnType: ColumnType.Sum,
    //       },
    //       displayName: 'Spend',
    //       sumColumn: 'spend',
    //       options: {
    //         rowFilters: [
    //           {
    //             metadata: {
    //               templateType: TemplateType.RowFilter,
    //               identifier: 'channel_filter',
    //             },
    //             column: 'channel',
    //             operator: ComparisonOperator.Equal,
    //             value: 'Google',
    //           },
    //         ]
    //       },
    //     },
    //   ],
    //   options: {
    //     // rowFilters: [
    //     //   {
    //     //     metadata: {
    //     //       templateType: TemplateType.RowFilter,
    //     //       identifier: 'channel_filter_2',
    //     //     },
    //     //     column: 'channel',
    //     //     operator: ComparisonOperator.Equal,
    //     //     value: 'Apple',
    //     //   },
    //     // ],
    //     breakdowns: [
    //       {
    //         metadata: {
    //           templateType: TemplateType.Breakdown,
    //           identifier: 'breakdown_1',
    //         },
    //         displayName: 'Campaign',
    //         groupColumn: 'campaign_name',
    //         descendantIdentifiers: [
    //           'adset'
    //         ],
    //       }
    //     ],
    //   },
    // });
  }

  compute() {
  }

  unique() {
  }
}
