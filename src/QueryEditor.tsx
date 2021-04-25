import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onTopicChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, topic: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { topic } = query;

    return (
      <>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Topic"
            tooltip="MQTT topic to subscribe to. NOTE: As of now, updating this requires you to save and reload the dashboard)"
          >
            <Input value={topic || ''} width={100} onChange={this.onTopicChange} />
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}
