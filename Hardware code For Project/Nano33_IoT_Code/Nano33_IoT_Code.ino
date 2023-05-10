#include <ArduinoJson.h>
#include <ArduinoMqttClient.h>
#include <WiFiNINA.h>
#include <RadioHead.h>
#include <RH_ASK.h>
#include <SPI.h>
RH_ASK driver;
char ssid[] = "Krish";        // your network SSID
char pass[] = "Krish132003";    // your network password

WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

const char broker[] = "broker.mqttdashboard.com";
int        port     = 1883;
const char topic[]  = "lecturehall/status";
bool hello = 0;

void setup() {
  Serial.begin(9600);
  driver.init();

  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  Serial.print("Connecting to WiFi network...");
  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("connected!");

  Serial.print("Connecting to MQTT broker...");
  mqttClient.connect(broker, port);

  while (!mqttClient.connected()) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("connected!");

  mqttClient.subscribe(topic);
}

void loop() {
  mqttClient.poll();

  while (mqttClient.available()) {
    String message = mqttClient.readString();

    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }

    const char* status = doc["status"];
    Serial.print("Status: ");
    Serial.println(status);
    const char *msg = status;
    driver.send((uint8_t *)msg, strlen(msg));
    driver.waitPacketSent();
    delay(1000);

  }
}
