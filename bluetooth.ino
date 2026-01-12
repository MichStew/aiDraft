/*
 * Purifier nRF52840 Sense - ACQD Puff Tracker Firmware
 * Firmware version 1.0
 *
 * BLE service exposes a puff counter characteristic that notifies the app
 * whenever a puff is detected.
 *
 * SIMULATION:
 * Grounding pin D1 triggers a puff event.
 */

#include "bluefruit.h"

// --- Pin for Simulation ---
// Connect a jumper wire from D1 to GND to trigger a puff event.
#define SIMULATE_PIN D1

// --- BLE UUIDs (must match the app) ---
#define PUFF_SERVICE_UUID "9fcefd20-3f2a-4d7b-9b42-9b2ea9f6b0a1"
#define PUFF_COUNT_UUID   "9fcefd21-3f2a-4d7b-9b42-9b2ea9f6b0a1"

// --- Puff Detection Settings ---
static const uint32_t kPuffDebounceMs = 800;

BLEService puffService(PUFF_SERVICE_UUID);
BLECharacteristic puffCountCharacteristic(PUFF_COUNT_UUID);

uint32_t puffCount = 0;
uint32_t lastPuffMs = 0;
bool bleConnected = false;

void registerPuff() {
  uint32_t now = millis();
  if (now - lastPuffMs < kPuffDebounceMs) {
    return;
  }
  lastPuffMs = now;
  puffCount++;

  puffCountCharacteristic.write((uint8_t *)&puffCount, sizeof(puffCount));
  if (Bluefruit.connected()) {
    puffCountCharacteristic.notify((uint8_t *)&puffCount, sizeof(puffCount));
  }

  Serial.print("Puff detected. Count: ");
  Serial.println(puffCount);

  digitalWrite(LED_BUILTIN, HIGH);
  delay(30);
  digitalWrite(LED_BUILTIN, LOW);
}

void onBLEConnected(uint16_t conn_handle) {
  Serial.println("Connected");
  bleConnected = true;
  digitalWrite(LED_BUILTIN, HIGH);
  delay(200);
  digitalWrite(LED_BUILTIN, LOW);
}

void onBLEDisconnected(uint16_t conn_handle, uint8_t reason) {
  Serial.print("Disconnected, reason = 0x");
  Serial.println(reason, HEX);
  bleConnected = false;
  digitalWrite(LED_BUILTIN, LOW);

  Bluefruit.Advertising.start(0);
}

void startAdvertising() {
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addService(puffService);
  Bluefruit.Advertising.addName();
  Bluefruit.Advertising.start(0);
  Serial.println("Waiting for connections...");
}

void setup() {
  Serial.begin(115200);
  // while (!Serial); // Uncomment if you want to wait for serial

  Serial.println("ACQD Puff Tracker (Bluefruit) Starting...");

  pinMode(SIMULATE_PIN, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  Bluefruit.begin();
  Bluefruit.setTxPower(4);
  Bluefruit.setName("Purifier-ACQD-01");

  Bluefruit.Periph.setConnectCallback(onBLEConnected);
  Bluefruit.Periph.setDisconnectCallback(onBLEDisconnected);

  puffService.begin();
  puffCountCharacteristic.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  puffCountCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  puffCountCharacteristic.setFixedLen(sizeof(puffCount));
  puffCountCharacteristic.begin();
  puffCountCharacteristic.write((uint8_t *)&puffCount, sizeof(puffCount));

  startAdvertising();
}

void loop() {
  static bool lastSimulatedState = true;
  bool simulatedState = digitalRead(SIMULATE_PIN) == LOW;

  if (simulatedState && !lastSimulatedState) {
    registerPuff();
  }
  lastSimulatedState = simulatedState;

  // --- This is where your REAL puff detection will go ---
  // When your sensor or TinyML model detects a puff, call:
  // registerPuff();
}
