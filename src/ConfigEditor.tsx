import React, { ChangeEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onBaseURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      baseUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="WebSocket URL" tooltip="Base URL for MQTT WebSocket server">
            <Input value={jsonData.baseUrl || ''} placeholder="ws://localhost:9001/" onChange={this.onBaseURLChange} />
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}
