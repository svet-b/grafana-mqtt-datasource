import { DataQuery, DataSourceJsonData } from '@grafana/data';
import { DataTypeValue, ValueEncodingValue } from './constants';

export interface MyQuery extends DataQuery {
  topic: string;
  dataType: DataTypeValue;
  dataPath: string;
  valueEncoding: ValueEncodingValue;
}

export const defaultQuery: Partial<MyQuery> = {
  topic: '',
  dataType: DataTypeValue.BYTES,
  dataPath: '',
  valueEncoding: ValueEncodingValue.STRING,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  url?: string;
  username?: string;
  password?: string;
  clientId?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 * Not relevant here since there's no backend component, but leaving as a placeholder for now
 */
export interface MySecureJsonData {
  apiKey?: string;
}
