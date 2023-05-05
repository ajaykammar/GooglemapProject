#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);  // Create a web server on port 80
int motionSensorPin = D1;
int motionState = 0;

//
void setup() {
  // Connect to WiFi network
  WiFi.begin("AK", "admin@ajay");
    pinMode(motionSensorPin, INPUT);
  Serial.begin(115200);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Handle client requests
  server.on("/", handleRoot);

  // Start the server
  server.begin();
  Serial.println("Server started");
}

void loop() {
  motionState = digitalRead(motionSensorPin);
//  delay(500);
  server.handleClient();
}

void handleRoot() {
  if (motionState == LOW) {
    server.send(200, "text/plain", "Motion Detected.");
    Serial.println("alert particles detected in 1 mt ahead !!!!!!");
  } else {
    server.send(200, "text/plain", "No Motion Detected.");
     Serial.println("No Motion Detected.");
  }
}
