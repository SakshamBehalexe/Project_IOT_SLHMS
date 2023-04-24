#include <Adafruit_GFX.h>
#include <Adafruit_LEDBackpack.h>
#include <Wire.h>
#include <RTClib.h>
#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>

// Define the LED matrix size
Adafruit_64x64 matrix = Adafruit_64x64();

// Initialize the real-time clock
RTC_DS3231 rtc;

// Initialize the DHT22 temperature and humidity sensor
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// WiFi and MQTT credentials
const char* ssid = "SSID";
const char* password = "PASSWORD";
const char* mqtt_server = "your_MQTT_broker_server";
const char* mqtt_username = "your_MQTT_broker_username";
const char* mqtt_password = "your_MQTT_broker_password";
const char* mqtt_topic = "your_MQTT_topic";

// Initialize the WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  matrix.begin();  // Initialize the LED matrix
  matrix.setRotation(1); // Rotate the display 90 degrees
  matrix.setTextSize(1); // Set the text size to 1
  matrix.setTextColor(matrix.Color333(0, 7, 0)); // Set the text color to green
  matrix.setTextWrap(false); // Disable text wrapping

  // Initialize the real-time clock
  rtc.begin();

  // Initialize the DHT22 temperature and humidity sensor
  dht.begin();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }

  // Connect to MQTT broker
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  while (!client.connected()) {
    if (client.connect("ESP32Client", mqtt_username, mqtt_password)) {
      client.subscribe(mqtt_topic);
    } else {
      delay(1000);
    }
  }
}

void loop() {
  // Check for new MQTT messages
  client.loop();

  // Get the current time from the RTC
  DateTime now = rtc.now();

  // Get the temperature and humidity from the DHT22 sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Clear the display
  matrix.clearDisplay();

  // Display the scrolling text or the MQTT message
  if (mqtt_message != "") {
    matrix.setCursor(-20, 0); // Set the text position
    matrix.print(mqtt_message); // Print the MQTT message
  } else {
    matrix.setCursor(-20, 0); // Set the text position
    matrix.print("SAMPLE TEXT "); // Print the scrolling text
  }

  // Display the clock
  matrix.setCursor(10, 20); // Set the text position
  matrix.print(now.hour(), DEC);
  matrix.print(':');
  if (now.minute() < 10) {
    matrix.print('0');
  }
  matrix.print(now.minute(), DEC);

  // Display the temperature and humidity
  matrix.setCursor(10, 40); // Set the text position
  matrix.print("Temp: ");
  matrix.print(temperature);
  matrix.print((char)247); // Print the degree symbol
  matrix.print("C  Humid: ");

  matrix.print(humidity);
  matrix.print('%');

  // Display the contents of the display buffer
  matrix.display();

  // Delay for a short period of time to control the scroll speed
  delay(50);
}
