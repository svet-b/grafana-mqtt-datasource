import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Input, Button } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  /**
   * Change handler for text field
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  createTextFieldHandler = (name: keyof MyQuery) => (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, [name]: event.target.value });
  };

  onTopicChange = this.createTextFieldHandler('topic');

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { topic } = query;
    const { onRunQuery } = this.props;

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
        <Button onClick={onRunQuery}>Run</Button>
      </>
    );
  }
}
