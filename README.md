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

## How to set up and use

To run Grafana in a Docker container, with this plugin included:

```
docker run -d \
   -p 3000:3000 \
   --name=grafana \
   -e "GF_INSTALL_PLUGINS=https://github.com/svet-b/grafana-mqtt-datasource/archive/refs/heads/built.zip;ammpio-mqtt-datasource" \
   grafana/grafana
```

You can also download and install the plugin from the URL above, or by cloning this repo directly.

If going the Docker route, navigate to http://localhost:3000 in your web browser. Add the MQTT datasource via the usual Configuration > Data Sources > Add Data Source path. The only option to set is the WebSocket URL. For a broker running locally (see below) this could be ws://localhost:9001/.

You can use the data source in any panel type. The only option to set is the topic on which to subscribe. Note that currently, after setting (or updating) the topic, you will need to save and reload the dashboard in order for the change to be picked up.

As soon as any data is received on the topic, the value will be visualized. In this initial implemention, numerical values need to be published as text.

## Simple demonstration

Here we set up a local broker, from which we want to visualize data. The data we will publish is the ping time from our client to a host (e.g. www.grafana.com).

### Set up local Mosquitto broker with WebSockets

Create a file called `mosquitto.conf` with the following contents:

```
# mosquitto.conf
listener 1883
listener 9001
protocol websockets
socket_domain ipv4
allow_anonymous true
```

Spin up a Mosquitto broker in Docker using the above configuration:

```
docker run -d \
  -p 1883:1883 \
  -p 9001:9001 \
  --name=mosquitto \
  -v (pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf \
  eclipse-mosquitto
```

This will run on ws://localhost:9001 (WebSocket protocol) and mqtt://localhost:1883 (MQTT protocol), and not require authentication.

### Publish the ping delay for a host to the MQTT broker

The following Python script will ping a set host (in this case www.grafana.com) at fairly high frequency, and publish the result to the local broker, on the `ping` topic.

Install prerequisites:

```
pip install paho-mqtt ping3
```

Create script `ping_to_mqtt.py`:

```
# pip_to_mqtt.py
import paho.mqtt.client as mqtt
from time import sleep
from ping3 import ping

MQTT_HOST = 'localhost'
MQTT_PORT = 1883
MQTT_TOPIC = 'ping'

HOST_TO_PING = 'www.grafana.com'

client = mqtt.Client('pinger')
client.connect(MQTT_HOST, MQTT_PORT)
client.loop_start()

print(f"Publishing to {MQTT_HOST}:{MQTT_PORT} on topic '{MQTT_TOPIC}'")

while True:
    p = ping(HOST_TO_PING)
    print(p)
    r = client.publish(
        topic=MQTT_TOPIC,
        payload=bytearray(str(p), 'utf-8')
    )
    r.wait_for_publish()
    sleep(0.02)
```

Run script:

```
python3 ping_to_mqtt.py
```

(stop with Ctrl-C/Cmd-C)
