import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  topic: string;
}

export const defaultQuery: Partial<MyQuery> = {
  topic: '',
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
