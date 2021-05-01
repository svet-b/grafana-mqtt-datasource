import { SelectableValue } from '@grafana/data';

/**
 * Default Streaming Capacity
 */
export const DefaultStreamingCapacity = 1000;

/**
 * Data Type Values
 */
export enum DataTypeValue {
  JSON = 'json',
  BYTES = 'bytes',
}

/**
 * Data Types
 */
export const DataType: Array<SelectableValue<DataTypeValue>> = [
  {
    label: 'JSON',
    value: DataTypeValue.JSON,
  },
  {
    label: 'Raw value',
    value: DataTypeValue.BYTES,
  },
];

/**
 * Value Encoding Values
 */
export enum ValueEncodingValue {
  STRING = 'string',
  FLOAT32 = 'float32',
  FLOAT64 = 'float64',
  INT16 = 'int16',
  INT32 = 'int32',
  UNDEFINED = '',
}

/**
 * Value Encodings
 */
export const ValueEncoding: Array<SelectableValue<ValueEncodingValue>> = [
  {
    label: 'Number as string (UTF-8 encoded)',
    value: ValueEncodingValue.STRING,
  },
  {
    label: 'IEEE-754 single-presicion float (32-bit)',
    value: ValueEncodingValue.FLOAT32,
  },
  {
    label: 'IEEE-754 double-presicion float (64-bit)',
    value: ValueEncodingValue.FLOAT64,
  },
  {
    label: 'Integer (16-bit)',
    value: ValueEncodingValue.INT16,
  },
  {
    label: 'Integer (32-bit)',
    value: ValueEncodingValue.INT32,
  },
];
