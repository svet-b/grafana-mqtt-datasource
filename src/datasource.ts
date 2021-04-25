import defaults from 'lodash/defaults';
import { Observable, merge } from 'rxjs';

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

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  baseUrl: string;
  mqttClient: MqttClient;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.jsonData.baseUrl || 'ws://localhost:9001';
    this.mqttClient = connect(this.baseUrl);
    // Track pool of websockets
    // this.wsList = {};

    // const onConnectFunction = (client: MqttClient, topic: string) => {
    //   console.log('client connected:');
    //   client.subscribe(topic, { qos: 0 });
    //   client.publish('topic', 'wss secure connection demo...!', { qos: 0, retain: false });
    // };
    // this.mqttClient.on('connect', onConnectFunction);

    // this.mqttClient.on('message', function (topic, message, packet) {
    //   console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic);
    // });
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const streams = options.targets.map((target) => {
      const query = defaults(target, defaultQuery);

      // const onConnectFunction = (client: MqttClient, topic: string) => {
      //   console.log('client connected:');
      //   client.subscribe(topic, { qos: 0 });
      //   // client.publish('topic', 'wss secure connection demo...!', { qos: 0, retain: false });
      // };

      // const onMessageFunction = (topic: string, message: string) => {
      //   console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic);
      // };

      // this.mqttClient.on('connect', () => onConnectFunction(this.mqttClient, query.topic));
      this.mqttClient.on('connect', () => {
        console.info(`Successfully connected to ${this.baseUrl}`);
        this.mqttClient.subscribe(query.topic);
        console.info(`Successfully subscribed to ${query.topic}`);
      });

      return new Observable<DataQueryResponse>((subscriber) => {
        const frame = new CircularDataFrame({
          append: 'tail',
          capacity: 1000,
        });

        frame.refId = query.refId;
        frame.addField({ name: 'time', type: FieldType.time });
        frame.addField({ name: 'value', type: FieldType.number });

        // const intervalId = setInterval(() => {
        //   frame.add({ time: Date.now(), value: Math.random() });

        //   subscriber.next({
        //     data: [frame],
        //     key: query.refId,
        //     state: LoadingState.Streaming,
        //   });
        // }, 500);

        this.mqttClient.on('message', function (topic, message) {
          // message is Buffer
          const msg = message.toString();
          const value = parseFloat(msg);
          console.log(`Received message ${message.toString()} on topic ${topic}`);
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

  async testDatasource(): Promise<any> {
    let baseUrl = this.baseUrl;
    let promise = new Promise(function (resolve, reject) {
      let mqttClient = connect(baseUrl);
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
