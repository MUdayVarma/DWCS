import paho.mqtt.client as mqtt
import time
import random
import json

# MQTT broker details
broker = "test.mosquitto.org"
port = 1883
topic = "iot/sensor/data"

# Create an MQTT client instance
client = mqtt.Client()

# Connect to the broker
client.connect(broker, port)

while True:
    data = {
        "deviceId": "sensor-001",
        "value": random.randint(10, 1000)
    }
    #print(data)
    validjsondata = json.dumps(data)
    #print(validjsondata)
    client.publish(topic, str(validjsondata))
    print(f"Published: {validjsondata}") #to topic {topic}
    time.sleep(5)