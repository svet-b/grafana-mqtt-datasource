import defaults from 'lodash/defaults';
import _ from 'lodash';

import { Observable, Subscriber, merge } from 'rxjs';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  CircularDataFrame,
  FieldType,
  LoadingState,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
import { connect, MqttClient } from 'mqtt';
import { DataTypeValue, ValueEncodingValue } from './constants';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url: string;
  mqttOptions: any;
  mqttClient: MqttClient;
  activeSubs: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.jsonData.url || 'ws://localhost:9001/';
    this.mqttOptions = {
      username: instanceSettings.jsonData.username,
      password: instanceSettings.jsonData.password,
      clientId: instanceSettings.jsonData.clientId,
    };
    this.mqttClient = connect(this.url, this.mqttOptions);
    this.activeSubs = '';
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const streams = options.targets.map((target) => {
      const query = defaults(target, defaultQuery);
      if (!this.mqttClient.connected) {
        // This is not a frivolous reconnect - it's necessary to reinitialize
        // the client if a Subscription tear-down event has previously occurred
        this.mqttClient.reconnect();
      }

      this.mqttClient.on('connect', () => {
        console.log(`Successfully connected to ${this.url}`);
      });

      if (this.activeSubs !== query.topic) {
        this.mqttClient.unsubscribe(this.activeSubs);
        this.mqttClient.subscribe(query.topic);
        this.activeSubs = query.topic;
        console.log(`Subscribed to ${query.topic}`);
      }

      return new Observable<DataQueryResponse>((subscriber) => {
        subscriber.add(() => {
          this.disconnect(query, subscriber);
        });

        const frame = new CircularDataFrame({
          append: 'tail',
          capacity: 1000,
        });

        frame.refId = query.refId;
        frame.addField({ name: 'time', type: FieldType.time });
        frame.addField({ name: 'value', type: FieldType.number });

        this.mqttClient.on('message', function (topic, message) {
          // message is Buffer
          console.log(`Received message ${message.toString()} on topic ${topic}`);
          let value = null;
          try {
            value = parseMessageValue(message, query);
          } catch (e) {
            console.error(`Error parsing message: ${e}`);
            value = null;
          }
          frame.add({ time: Date.now(), value: value });
          subscriber.next({
            data: [frame],
            key: query.refId,
            state: LoadingState.Streaming,
          });
        });

        return;
      });
    });

    return merge(...streams);
  }

  private disconnect(query: MyQuery, subscriber: Subscriber<DataQueryResponse>) {
    console.log(`Closing MQTT connection to ${this.url}`);
    this.mqttClient.end();
  }

  async testDatasource(): Promise<any> {
    let mqttClient = this.mqttClient;
    let promise = new Promise(function (resolve, reject) {
      mqttClient.reconnect();
      // This doesn't actually work; see e.g. https://github.com/mqttjs/MQTT.js/issues/876
      mqttClient.on('error', function (event) {
        reject({
          status: 'error',
          message: `MQTT WebSocket Connection Error: ${JSON.stringify(event)}`,
        });
      });
      mqttClient.on('connect', function (event) {
        resolve({
          status: 'success',
          message: `MQTT WebSocket Connection Successful: ${JSON.stringify(event)}`,
        });
      });
    });
    promise.then(
      function (result) {
        return result;
      },
      function (error) {
        return error;
      }
    );
    return promise;
  }
}

function parseMessageValue(message: Buffer, query: MyQuery): number | null {
  function toArrayBuffer(buf: Buffer): ArrayBuffer {
    let ab = new ArrayBuffer(buf.length);
    let view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }

  if (query.dataType === DataTypeValue.JSON) {
    const parsedMessage = JSON.parse(message.toString());
    return _.get(parsedMessage, query.dataPath);
  } else if (query.dataType === DataTypeValue.BYTES) {
    if (query.valueEncoding === ValueEncodingValue.STRING) {
      return parseFloat(message.toString());
    } else {
      let view = new DataView(toArrayBuffer(message));
      switch (query.valueEncoding) {
        case ValueEncodingValue.FLOAT32:
          return view.getFloat32(0, false);
        case ValueEncodingValue.FLOAT64:
          return view.getFloat64(0, false);
        case ValueEncodingValue.INT16:
          return view.getInt16(0, false);
        case ValueEncodingValue.INT32:
          return view.getInt32(0, false);
      }
    }
  }
  return null;
}
