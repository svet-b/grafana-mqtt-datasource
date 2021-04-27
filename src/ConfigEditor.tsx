import React, { SyntheticEvent, PureComponent } from 'react';
import { InlineFieldRow, InlineField, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export const onUpdateDatasourceJsonDataOption = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K
) => (event: SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
  updateDatasourcePluginJsonDataOption(props, key, event.currentTarget.value);
};

export const updateDatasourcePluginJsonDataOption = <J, S, K extends keyof J>(
  props: DataSourcePluginOptionsEditorProps<J, S>,
  key: K,
  val: any
) => {
  const config = props.options;

  props.onOptionsChange({
    ...config,
    jsonData: {
      ...config.jsonData,
      [key]: val,
    },
  });
};

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="WebSocket URL" tooltip="Base URL for MQTT WebSocket server">
            <Input
              value={jsonData.url || ''}
              placeholder="ws://localhost:9001/"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'url')}
            />
          </InlineField>
        </InlineFieldRow>
        <h5>Options</h5>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="Username">
            <Input
              value={jsonData.username || undefined}
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'username')}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="Password">
            <Input
              value={jsonData.password || undefined}
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'password')}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField labelWidth={20} label="Client ID" tooltip="Client ID passed to MQTT broker">
            <Input
              value={jsonData.clientId || undefined}
              placeholder="mqttjs_abcd1234"
              onChange={onUpdateDatasourceJsonDataOption(this.props, 'clientId')}
            />
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}
