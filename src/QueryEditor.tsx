import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Select, Input, Button } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

import { DataType, DataTypeValue, ValueEncoding } from './constants';

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

  /**
   * Change handler for select field
   *
   * @param {ChangeEvent<HTMLInputElement>} event Event
   */
  createSelectFieldHandler<ValueType>(name: keyof MyQuery) {
    return (val: SelectableValue<ValueType>) => {
      this.props.onChange({ ...this.props.query, [name]: val.value });
    };
  }

  onTopicChange = this.createTextFieldHandler('topic');
  onDataTypeChange = this.createSelectFieldHandler<string>('dataType');
  onDataPathChange = this.createTextFieldHandler('dataPath');
  onValueEncodingChange = this.createSelectFieldHandler('valueEncoding');

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { topic, dataType, dataPath, valueEncoding } = query;
    const { onRunQuery } = this.props;

    return (
      <>
        <InlineFieldRow>
          <InlineField
            labelWidth={20}
            label="Topic"
            tooltip="MQTT topic to subscribe to. Wildcards are allowed (though payloads on all topics will appear as one series. Please click <Subscribe> to apply any changes."
          >
            <Input value={topic || ''} width={80} onChange={this.onTopicChange} />
          </InlineField>
          <Button size={'md'} onClick={onRunQuery}>
            Subscribe
          </Button>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="Payload type">
            <Select options={DataType} value={dataType} width={40} onChange={this.onDataTypeChange} />
          </InlineField>
        </InlineFieldRow>
        {dataType === DataTypeValue.JSON && (
          <InlineFieldRow>
            <InlineField
              labelWidth={20}
              label="Data path"
              tooltip="Path of value in JSON object, parsed using lodash _get()"
            >
              <Input value={dataPath || ''} width={80} placeholder="a.b[0]" onChange={this.onDataPathChange} />
            </InlineField>
          </InlineFieldRow>
        )}
        {dataType === DataTypeValue.BYTES && (
          <InlineFieldRow>
            <InlineField
              labelWidth={20}
              label="Value envoding"
              tooltip="How the numerical value is encoded as a binary payload"
            >
              <Select options={ValueEncoding} value={valueEncoding} width={40} onChange={this.onValueEncodingChange} />
            </InlineField>
          </InlineFieldRow>
        )}
      </>
    );
  }
}
