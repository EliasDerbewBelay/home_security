#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// ---------------- WIFI ----------------
const char* ssid = "Redmi 10C";
const char* password = "Dark1994--";

// ---------------- STATIC IP ----------------
IPAddress local_IP(10, 232, 223, 222);
IPAddress gateway(10, 232, 223, 148);
IPAddress subnet(255, 255, 255, 0);

// ---------------- ULTRASONIC ----------------
#define TRIG D5
#define ECHO D6

// ---------------- BUZZER ----------------
#define BUZZER D1

ESP8266WebServer server(80);

long duration;
float distance;

// Detection threshold
float thresholdDistance = 100.0;

// ------------------------------------------------

void handleRoot() {

  String json = "{";

  json += "\"distance\":";
  json += String(distance);
  json += ",";

  json += "\"buzzer\":";

  if (distance > 0 && distance <= thresholdDistance) {

    json += "\"ON\"";

  } else {

    json += "\"OFF\"";
  }

  json += "}";

  server.send(200, "application/json", json);
}

// ------------------------------------------------

void setup() {

  Serial.begin(115200);

  // Ultrasonic Pins
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  // Buzzer Pin
  pinMode(BUZZER, OUTPUT);

  digitalWrite(BUZZER, LOW);

  // Configure Static IP
  WiFi.config(local_IP, gateway, subnet);

  // Connect WiFi
  WiFi.begin(ssid, password);

  Serial.println();
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");

  Serial.print("ESP8266 IP Address: ");
  Serial.println(WiFi.localIP());

  // Start API Server
  server.on("/", handleRoot);

  server.begin();

  Serial.println("HTTP Server Started");
}

// ------------------------------------------------

void loop() {

  // -------- Ultrasonic Reading --------
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH);

  distance = duration * 0.034 / 2;

  // -------- Serial Monitor --------
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // -------- Buzzer Logic --------
  if (distance > 0 && distance <= thresholdDistance) {

    digitalWrite(BUZZER, HIGH);

  } else {

    digitalWrite(BUZZER, LOW);
  }

  // Handle API Requests
  server.handleClient();

  delay(200);
}
