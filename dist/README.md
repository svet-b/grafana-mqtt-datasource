# MQTT Streaming Data Source for Grafana

Inspired by the superb [Redis streaming data source](https://github.com/RedisGrafana/grafana-redis-datasource), I thought it would be cool to be able to visualize MQTT data in real-time. What's more, since MQTT is a native "streaming" protocol - with data being pushed to subscribers as soon as it's published - it made even more sense to pair an MQTT data source with Grafana's new streaming visualization capabilities.

So far the functionality leve is "proof-of-concept". The client can subscribe to a single topic over an unauthenticated WebSocket connection, and expects to receive numerical values published as strings on that topic.

In fact shortly after creating this I came across https://github.com/diebietse/grafana-mqtt, which is pretty similar.

## To do

The near-term plan is to address the following issues:

- When topic is changed, re-subscribe to new topic immediately. Currently the user needs to save and refresh the dashboard.
- Enable parsing of other payload formats: JSON (via JSONata), CBOR, etc)
- Enable authentication (though probably without a backend plugin component, at least for the time being)

Some other enhancements:

- Move plotted values to the left (i.e. move time axis) even while no new data is being received
- Enable a dedicated timestamp field (rather than assume time = now)
- Support for multiple data series
- Detect and report connection errors (e.g. at time of initial datasource setup). This is non-trivial due to https://github.com/mqttjs/MQTT.js/issues/876 and the fact that `MqttClient.stream` is not exposed in TypeScript

## How to set up

## Simple test
