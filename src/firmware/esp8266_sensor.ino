#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// ---------------- WIFI ----------------
const char* ssid = "Redmi 10C";
const char* password = "Dark1994--";

// ---------------- STATIC IP ----------------
// Configured for the user's static IP requirement: http://10.21.123.222/
IPAddress local_IP(10, 21, 123, 222);
IPAddress gateway(10, 21, 123, 1);      // Android hotspot default gateway
IPAddress subnet(255, 255, 255, 0);

// ---------------- PINS ----------------
#define FSR_PIN   A0
#define TRIG      D5
#define ECHO      D6
#define BUZZER    D1

// ---------------- THRESHOLDS ----------------
#define THRESHOLD_KG 10.0
#define THRESHOLD_CM 100.0
#define FSR_10KG_RAW 700

ESP8266WebServer server(80);

// ---------------- VARIABLES ----------------
long duration;
float distance = 0;
float mass_kg = 0;
bool buzzerState = false;
bool systemArmed = true;

// ------------------------------------------------
// HTTP API
// ------------------------------------------------
void handleRoot() {
  // Check if armed query parameter is provided to sync with the mobile app
  if (server.hasArg("armed")) {
    String armedArg = server.arg("armed");
    Serial.print("HTTP Request -> armed: ");
    Serial.println(armedArg);
    if (armedArg == "1" || armedArg == "true") {
      systemArmed = true;
    } else if (armedArg == "0" || armedArg == "false") {
      systemArmed = false;
      // Immediately turn off buzzer when disarmed
      digitalWrite(BUZZER, LOW);
      buzzerState = false;
    }
  }

  String json = "{";
  json += "\"distance_cm\":";
  json += String(distance, 2);
  json += ",";
  json += "\"weight_kg\":";
  json += String(mass_kg, 2);
  json += ",";
  json += "\"buzzer\":\"";
  json += buzzerState ? "ON" : "OFF";
  json += "\",";
  json += "\"armed\":";
  json += systemArmed ? "true" : "false";
  json += "}";

  // Send CORS headers to prevent network errors in the app
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// ------------------------------------------------
// ULTRASONIC FUNCTION
// ------------------------------------------------
float getDistanceCM() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.034 / 2;
}

// ------------------------------------------------
// SETUP
// ------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=================================");
  Serial.println("ESP8266 SYSTEM STARTING");
  Serial.println("=================================");

  // ---------- PIN MODES ----------
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);

  digitalWrite(BUZZER, LOW);

  // ---------- WIFI MODE ----------
  WiFi.mode(WIFI_STA);

  // ---------- CONFIGURE STATIC IP ----------
  Serial.print("Configuring static IP: ");
  Serial.println(local_IP);
  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("Static IP Configuration Failed!");
  }

  // ---------- CONNECT WIFI ----------
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    timeout++;

    // timeout after 20 seconds
    if (timeout > 40) {
      Serial.println();
      Serial.println("WiFi Connection Failed!");
      Serial.print("WiFi Status Code: ");
      Serial.println(WiFi.status());
      return;
    }
  }

  // ---------- WIFI CONNECTED ----------
  Serial.println();
  Serial.println("=================================");
  Serial.println("WiFi Connected Successfully!");
  Serial.print("ESP8266 IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("=================================");

  // ---------- START SERVER ----------
  server.on("/", handleRoot);
  server.begin();

  Serial.println("HTTP Server Started");
  Serial.println("Ready for Client Requests");
}

// ------------------------------------------------
// LOOP
// ------------------------------------------------
unsigned long lastExecutionTime = 0;

void loop() {
  // ---------- CHECK WIFI ----------
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected!");
    delay(1000);
    return;
  }

  // ---------- HANDLE CLIENT ----------
  // Keep this at the root of loop without delays to process app requests immediately
  server.handleClient();

  // ---------- NON-BLOCKING SENSOR & LOGGING INTERVAL ----------
  // Read sensors and print every 500ms without using delay()
  unsigned long currentMillis = millis();
  if (currentMillis - lastExecutionTime >= 500) {
    lastExecutionTime = currentMillis;

    // ---------- FSR ----------
    int rawValue = analogRead(FSR_PIN);
    mass_kg = ((float)rawValue / FSR_10KG_RAW) * THRESHOLD_KG;

    // ---------- ULTRASONIC ----------
    distance = getDistanceCM();

    // ---------- CONDITIONS ----------
    bool fsrTriggered = (mass_kg >= THRESHOLD_KG);
    bool ultraTriggered = (distance > 0 && distance <= THRESHOLD_CM);

    // ---------- BUZZER ----------
    if (systemArmed && (fsrTriggered || ultraTriggered)) {
      digitalWrite(BUZZER, HIGH);
      buzzerState = true;
    } else {
      digitalWrite(BUZZER, LOW);
      buzzerState = false;
    }

    // ---------- SERIAL OUTPUT ----------
    Serial.print("Weight: ");
    Serial.print(mass_kg, 2);
    Serial.print(" kg");

    Serial.print(" | Distance: ");
    Serial.print(distance);
    Serial.print(" cm");

    Serial.print(" | Buzzer: ");
    Serial.print(buzzerState ? "ON" : "OFF");

    Serial.print(" | Armed: ");
    Serial.println(systemArmed ? "YES" : "NO");
  }
}
