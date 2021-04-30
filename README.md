# MQTT Streaming Data Source for Grafana

Inspired by the superb [Redis streaming data source](https://github.com/RedisGrafana/grafana-redis-datasource), I thought it would be cool to be able to visualize MQTT data in real-time. What's more, since MQTT is a native "streaming" protocol - with data being pushed to subscribers as soon as it's published - it made even more sense to pair an MQTT data source with Grafana's new streaming visualization capabilities.

https://user-images.githubusercontent.com/12831860/116016275-2379ca00-a60a-11eb-816e-6e1590103999.mov

The client can subscribe to a single topic over an optionally authenticated WebSockets connection. It expects to receive values that have been encoded in one of the following ways into MQTT payloads:
- JSON storage (with support for traversal to a specific path)
- Number stored as binary: either in UTF-8 encoded string, IEEE-754 float, or integer

Shortly after creating this I came across https://github.com/diebietse/grafana-mqtt, which for a start was pretty similar, though currently this implementation is more full-featured.

## To do

Some planned enhancements:

- Continuously move plotted values to the left (i.e. update time axis) even if new data is being received
- Enable a dedicated timestamp field (rather than assume time = now for all payloads)
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

Assuming you've gone down the Docker route, navigate to http://localhost:3000 in your web browser. Add the MQTT datasource via the usual Configuration > Data Sources > Add Data Source path. The only option to set is the WebSocket URL. For a broker running locally (see below) this could be ws://localhost:9001/.

You can use the data source in any panel type. The only option to set is the topic on which to subscribe.

As soon as any data is received on the topic, the value will be visualized. In this initial implemention, numerical values need to be published as text.

## Simple demonstration

Here we set up a local broker, and we publish data to it, in a way that can be visualized in Grafana using the plugin. The data we will publish is the ping time from our host to the www.grafana.com server.

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
   -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf \
   eclipse-mosquitto
```

This will run on ws://localhost:9001 (WebSocket protocol) and mqtt://localhost:1883 (MQTT protocol), and does not require authentication.

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

(stop with Ctrl-C/Cmd-C). You can see the script running in the screencast above.
