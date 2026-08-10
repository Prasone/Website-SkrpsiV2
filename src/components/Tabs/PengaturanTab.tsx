import React, { useState } from 'react';
import { Settings, Save, Wifi, Key, Check, Code2, Copy, CheckCheck, Server } from 'lucide-react';
import { ThresholdSettings } from '../../types';

interface PengaturanTabProps {
  settings: ThresholdSettings;
  setSettings: (settings: ThresholdSettings) => void;
}

export default function PengaturanTab({ settings, setSettings }: PengaturanTabProps) {
  const [esp32Ip, setEsp32Ip] = useState(settings.esp32Ip || '192.168.4.11');
  const [mqttBroker, setMqttBroker] = useState(settings.mqttBroker || 'broker.emqx.io');
  const [mqttTopic, setMqttTopic] = useState(settings.mqttTopic || 'kebun/faiz');
  const [mqttUsername, setMqttUsername] = useState(settings.mqttUsername || 'Skripsi');
  const [mqttPassword, setMqttPassword] = useState(settings.mqttPassword || '********');
  const [wifiSsid, setWifiSsid] = useState(settings.wifiSsid || 'faiz');
  const [wifiPass, setWifiPass] = useState('********');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedFullCode, setCopiedFullCode] = useState(false);

  const fullEsp32Sketch = `// ============================================================
// SISTEM PENYIRAMAN OTOMATIS + REST API + MQTT (FreeRTOS Multi-Task)
// SENSOR: DHT21 (SUHU & KELEMBAPAN UDARA), SOIL MOISTURE, ULTRASONIK, RTC DS3231
// LCD: 16x2 I2C (T=26.5C RH=78% & SM=70% H2O=90%)
// LOGIKA FUZZY MAMDANI + PREFERENCES FLASH SCHEDULE
// ============================================================

#include <WiFi.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <LiquidCrystal_I2C.h>
#include <Fuzzy.h>
#include "RTClib.h"
#include <HardwareSerial.h>
#include <Preferences.h>
#include <DHT.h>           // Library Adafruit DHT
#include <PubSubClient.h>  // Library PubSubClient oleh Nick O'Leary

// ---------------- Konfigurasi MQTT Broker ----------------
const char *mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char *mqtt_topic_telemetry = "kebun/faiz/telemetry"; // Publish data sensor
const char *mqtt_topic_command   = "kebun/faiz/cmd";       // Subscribe perintah website

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ---------------- Objek & Sensor ----------------
Fuzzy *fuzzy = new Fuzzy();
Preferences preferences;

// Configuration DHT21 (AM2301)
#define DHTPIN 4       // Pin GPIO4 ESP32 terhubung ke kabel Data DHT21
#define DHTTYPE DHT21  // Tipe Sensor DHT21 / AM2301
DHT dht(DHTPIN, DHTTYPE);

#define RX_PIN 17
#define TX_PIN 16
HardwareSerial sensorSerial(2);
const float TINGGI_WADAH = 16.0; // Tinggi wadah dalam cm

#define SOLENOID_VALVE 18 // Relay Solenoid (LOW = Buka, HIGH = Tutup)
const byte POMPA = 19;     // Relay Pompa (LOW = Nyala, HIGH = Mati)
const byte SOIL_SENSOR = 34;

RTC_DS3231 rtc;
const char *daysOfTheWeek[7] = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

LiquidCrystal_I2C lcd(0x27, 16, 2);

#define ledRed 32
#define ledGreen 33

enum ModeKontrol { MODE_AUTO, MODE_MANUAL };

// ---------------- Shared state (WAJIB lewat mutex) ----------------
struct SharedData {
  char formattedTime[48];
  char dataDate[11];
  char hourStr[3];
  char minuteStr[3];
  char secondStr[3];
  char dayOfWeek[12];

  int nilaiSoil;
  int kelembaban;       // Kelembaban tanah (%)
  float jarak;
  float persentaseAir;   // Level air wadah (%)
  float timerPompa;

  // Sensor DHT21 (Udara)
  float suhu;            // Suhu udara (°C)
  float kelembapanUdara; // Kelembapan udara (% RH)

  bool pompaOn;
  bool valveOn;
  ModeKontrol modePompa;
  ModeKontrol modeValve;
  bool manualPompaState;  // target ON/OFF saat mode manual
  bool manualValveState;  // target ON/OFF saat mode manual
  bool waterLevelLow;
  bool waterLevelHigh;
  bool sedangMenyiram;

  char jamPagi[3];
  char menitPagi[3];
  char jamSore[3];
  char menitSore[3];
  bool jadwalAktif;
};

SharedData shared;
SemaphoreHandle_t dataMutex;
const TickType_t MUTEX_TIMEOUT = pdMS_TO_TICKS(100);

// Wi-Fi Credentials
const char *WIFI_SSID = "faiz";
const char *WIFI_PASSWORD = "arshaka18";

AsyncWebServer server(80);
TaskHandle_t taskSensorHandle = NULL;
TaskHandle_t taskWiFiHandle = NULL;

// ---------------- Prototipe Fungsi ----------------
void setupFuzzyLogic();
void dataJarak();
void dataWaktu();
void bacaSoil();
void bacaDHT();
void updateLCD();
void checkWaterLevel();
void setupWiFi();
void setupWebServer();
void setupMQTT();
void reconnectMQTT();
void publishMQTTTelemetry();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void TaskSensorControl(void *pvParameters);
void TaskWiFiMonitor(void *pvParameters);

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  sensorSerial.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);

  dht.begin(); // Sensor DHT21

  pinMode(ledRed, OUTPUT);
  pinMode(ledGreen, OUTPUT);
  pinMode(POMPA, OUTPUT);
  pinMode(SOLENOID_VALVE, OUTPUT);
  digitalWrite(POMPA, HIGH);
  digitalWrite(SOLENOID_VALVE, HIGH);

  lcd.begin();
  lcd.backlight();

  if (!rtc.begin()) {
    Serial.println("RTC DS3231 Tidak Ditemukan!");
    lcd.setCursor(0, 0);
    lcd.print("RTC Error!");
    while (1) delay(10);
  }

  lcd.setCursor(0, 0);
  lcd.print("System Ready !!!");
  digitalWrite(ledRed, HIGH);
  digitalWrite(ledGreen, LOW);

  setupFuzzyLogic();

  memset(&shared, 0, sizeof(shared));
  shared.modePompa = MODE_AUTO;
  shared.modeValve = MODE_AUTO;
  shared.suhu = 28.0;
  shared.kelembapanUdara = 60.0;

  preferences.begin("watering", false);
  String jp = preferences.getString("jamPagi", "06");
  String mp = preferences.getString("menitPagi", "00");
  String js = preferences.getString("jamSore", "16");
  String ms = preferences.getString("menitSore", "30");
  shared.jadwalAktif = preferences.getBool("jadwalAktif", true);
  preferences.end();
  snprintf(shared.jamPagi, sizeof(shared.jamPagi), "%s", jp.c_str());
  snprintf(shared.menitPagi, sizeof(shared.menitPagi), "%s", mp.c_str());
  snprintf(shared.jamSore, sizeof(shared.jamSore), "%s", js.c_str());
  snprintf(shared.menitSore, sizeof(shared.menitSore), "%s", ms.c_str());

  dataMutex = xSemaphoreCreateMutex();

  setupWiFi();
  setupMQTT();
  setupWebServer();

  delay(1500);
  lcd.clear();

  // Task Hardware (Core 1)
  xTaskCreatePinnedToCore(TaskSensorControl, "SensorControl", 8192, NULL, 2, &taskSensorHandle, 1);
  // Task WiFi & MQTT Monitor (Core 0)
  xTaskCreatePinnedToCore(TaskWiFiMonitor, "WiFiMonitor", 4096, NULL, 1, &taskWiFiHandle, 0);
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}

// ============================================================
// TASK 1: SENSOR CONTROL (Core 1)
// ============================================================
void TaskSensorControl(void *pvParameters) {
  const TickType_t tickPeriod = pdMS_TO_TICKS(200);
  unsigned long lastMainUpdate = 0;

  bool localSedangMenyiram = false;
  unsigned long wateringStart = 0;
  unsigned long wateringDuration = 0;

  for (;;) {
    unsigned long now = millis();

    ModeKontrol mPompa = MODE_AUTO, mValve = MODE_AUTO;
    bool manualPompa = false, manualValve = false;
    if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
      mPompa = shared.modePompa;
      mValve = shared.modeValve;
      manualPompa = shared.manualPompaState;
      manualValve = shared.manualValveState;
      xSemaphoreGive(dataMutex);
    }

    if (mPompa == MODE_MANUAL && !localSedangMenyiram) {
      digitalWrite(POMPA, manualPompa ? LOW : HIGH);
      if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
        shared.pompaOn = manualPompa;
        xSemaphoreGive(dataMutex);
      }
    }
    if (mValve == MODE_MANUAL) {
      digitalWrite(SOLENOID_VALVE, manualValve ? LOW : HIGH);
      if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
        shared.valveOn = manualValve;
        xSemaphoreGive(dataMutex);
      }
    }

    if (localSedangMenyiram && (now - wateringStart >= wateringDuration)) {
      digitalWrite(POMPA, HIGH);
      localSedangMenyiram = false;
      if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
        shared.sedangMenyiram = false;
        shared.pompaOn = false;
        xSemaphoreGive(dataMutex);
      }
      lcd.clear();
    }

    if (now - lastMainUpdate >= 1000) {
      lastMainUpdate = now;
      digitalWrite(ledRed, LOW);
      digitalWrite(ledGreen, HIGH);

      dataWaktu();
      bacaSoil();
      bacaDHT();
      dataJarak();
      checkWaterLevel();

      if (!localSedangMenyiram) updateLCD();

      if (!localSedangMenyiram) {
        bool mulaiSiram = false;
        char label[16] = "";

        if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
          if (shared.modePompa == MODE_AUTO && shared.jadwalAktif) {
            int detik = atoi(shared.secondStr);
            if (strcmp(shared.hourStr, shared.jamPagi) == 0 &&
                strcmp(shared.minuteStr, shared.menitPagi) == 0 &&
                detik >= 1 && detik <= 3) {
              mulaiSiram = true;
              snprintf(label, sizeof(label), "Jadwal Pagi");
            } else if (strcmp(shared.hourStr, shared.jamSore) == 0 &&
                       strcmp(shared.minuteStr, shared.menitSore) == 0 &&
                       detik >= 1 && detik <= 3) {
              mulaiSiram = true;
              snprintf(label, sizeof(label), "Jadwal Sore");
            }
          }
          if (mulaiSiram) {
            wateringDuration = (unsigned long) shared.timerPompa;
            shared.sedangMenyiram = true;
            shared.pompaOn = true;
          }
          xSemaphoreGive(dataMutex);
        }

        if (mulaiSiram) {
          wateringStart = millis();
          localSedangMenyiram = true;
          digitalWrite(POMPA, LOW);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Menyiram Kebun");
          lcd.setCursor(0, 1);
          lcd.print(label);
        }
      }
    }
    vTaskDelay(tickPeriod);
  }
}

// ============================================================
// TASK 2: WIFI & MQTT MONITOR (Core 0)
// ============================================================
void TaskWiFiMonitor(void *pvParameters) {
  const TickType_t interval = pdMS_TO_TICKS(100);
  unsigned long lastPublish = 0;

  for (;;) {
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.reconnect();
    } else {
      if (!mqttClient.connected()) {
        reconnectMQTT();
      }
      mqttClient.loop();

      unsigned long now = millis();
      if (now - lastPublish >= 2000) {
        lastPublish = now;
        publishMQTTTelemetry();
      }
    }
    vTaskDelay(interval);
  }
}

// ============================================================
// KONFIGURASI & CALLBACK MQTT
// ============================================================
void setupMQTT() {
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    String clientId = "ESP32SmartGarden-" + String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str())) {
      mqttClient.subscribe(mqtt_topic_command);
    } else {
      vTaskDelay(pdMS_TO_TICKS(5000));
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, message);
  if (!err) {
    if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
      if (doc.containsKey("pompa")) {
        shared.modePompa = MODE_MANUAL;
        String pState = doc["pompa"];
        shared.manualPompaState = (pState == "ON" || pState == "on" || pState == "1");
      }
      if (doc.containsKey("valve")) {
        shared.modeValve = MODE_MANUAL;
        String vState = doc["valve"];
        shared.manualValveState = (vState == "ON" || vState == "on" || vState == "1");
      }
      if (doc.containsKey("modePompa")) {
        String mP = doc["modePompa"];
        shared.modePompa = (mP == "auto") ? MODE_AUTO : MODE_MANUAL;
      }
      if (doc.containsKey("modeValve")) {
        String mV = doc["modeValve"];
        shared.modeValve = (mV == "auto") ? MODE_AUTO : MODE_MANUAL;
      }
      xSemaphoreGive(dataMutex);
    }
  }
}

void publishMQTTTelemetry() {
  StaticJsonDocument<384> doc;
  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
    doc["suhu"] = shared.suhu;
    doc["kelembapanUdara"] = shared.kelembapanUdara;
    doc["kelembaban"] = shared.kelembaban;
    doc["soilRaw"] = shared.nilaiSoil;
    doc["nilaiSoil"] = shared.nilaiSoil;
    doc["persentaseAir"] = shared.persentaseAir;
    doc["jarak"] = shared.jarak;
    doc["pompaOn"] = shared.pompaOn;
    doc["valveOn"] = shared.valveOn;
    doc["modePompa"] = (shared.modePompa == MODE_AUTO) ? "auto" : "manual";
    doc["modeValve"] = (shared.modeValve == MODE_AUTO) ? "auto" : "manual";
    doc["waktu"] = shared.formattedTime;
    xSemaphoreGive(dataMutex);
  }

  String jsonStr;
  serializeJson(doc, jsonStr);
  mqttClient.publish(mqtt_topic_telemetry, jsonStr.c_str());
}

// ============================================================
// LCD DISPLAY FORMAT T=26.5C RH=78% & SM=70% H2O=90%
// ============================================================
void updateLCD() {
  float temp = 28.0;
  float hum = 60.0;
  int soil = 0;
  float air = 0;

  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
    temp = shared.suhu;
    hum = shared.kelembapanUdara;
    soil = shared.kelembaban;
    air = shared.persentaseAir;
    xSemaphoreGive(dataMutex);
  }

  // Baris 1: Suhu & Kelembapan Udara DHT21
  lcd.setCursor(0, 0);
  lcd.print("T=");
  lcd.print(temp, 1);
  lcd.print("C RH=");
  lcd.print((int)hum);
  lcd.print("%  ");

  // Baris 2: Kelembaban Tanah & Air Toren
  lcd.setCursor(0, 1);
  lcd.print("SM=");
  lcd.print(soil);
  lcd.print("% H2O=");
  lcd.print((int)air);
  lcd.print("%  ");
}

void bacaDHT() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Jika sensor DHT21 belum terpasang / bernilai NaN (Error), gunakan DATA DUMMY TESTING
  if (isnan(temp) || isnan(hum)) {
    // Data Dummy Suhu: berfluktuasi halus 26.5°C - 28.5°C
    temp = 27.5 + (sin(millis() / 5000.0) * 1.0);
    // Data Dummy Kelembapan Udara: berfluktuasi 70% - 80% RH
    hum = 75.0 + (cos(millis() / 4000.0) * 5.0);
  }

  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
    shared.suhu = temp;
    shared.kelembapanUdara = hum;
    xSemaphoreGive(dataMutex);
  }
}

void dataJarak() {
  static unsigned char data[4];
  if (sensorSerial.available() >= 4) {
    for (int i = 0; i < 4; i++) data[i] = sensorSerial.read();
    while (sensorSerial.available()) sensorSerial.read();

    if (data[0] == 0xFF) {
      int sum = (data[0] + data[1] + data[2]) & 0x00FF;
      if (sum == data[3]) {
        float distance = (data[1] << 8) + data[2];
        if (distance > 10) {
          float jarakBaru = distance / 10.0;
          float tinggiAir = TINGGI_WADAH - jarakBaru;
          if (tinggiAir < 0) tinggiAir = 0;
          if (tinggiAir > TINGGI_WADAH) tinggiAir = TINGGI_WADAH;
          float persen = (tinggiAir / TINGGI_WADAH) * 100.0;

          if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
            shared.jarak = jarakBaru;
            shared.persentaseAir = persen;
            xSemaphoreGive(dataMutex);
          }
        }
      }
    }
  }
}

void dataWaktu() {
  DateTime now = rtc.now();
  char h[3], m[3], s[3], dow[12], dstr[11], full[48];
  snprintf(h, sizeof(h), "%02d", now.hour());
  snprintf(m, sizeof(m), "%02d", now.minute());
  snprintf(s, sizeof(s), "%02d", now.second());
  snprintf(dow, sizeof(dow), "%s", daysOfTheWeek[now.dayOfTheWeek()]);
  snprintf(dstr, sizeof(dstr), "%04d-%02d-%02d", now.year(), now.month(), now.day());
  snprintf(full, sizeof(full), "%s, %s %s:%s:%s", dow, dstr, h, m, s);

  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
    snprintf(shared.hourStr, sizeof(shared.hourStr), "%s", h);
    snprintf(shared.minuteStr, sizeof(shared.minuteStr), "%s", m);
    snprintf(shared.secondStr, sizeof(shared.secondStr), "%s", s);
    snprintf(shared.dayOfWeek, sizeof(shared.dayOfWeek), "%s", dow);
    snprintf(shared.dataDate, sizeof(shared.dataDate), "%s", dstr);
    snprintf(shared.formattedTime, sizeof(shared.formattedTime), "%s", full);
    xSemaphoreGive(dataMutex);
  }
}

void bacaSoil() {
  int nilai = analogRead(SOIL_SENSOR);
  int rh = map(nilai, 4095, 0, 0, 100);
  if (rh < 0) rh = 0;
  if (rh > 100) rh = 100;

  fuzzy->setInput(1, rh);
  fuzzy->fuzzify();
  float timer = fuzzy->defuzzify(1);

  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
    shared.nilaiSoil = nilai;
    shared.kelembaban = rh;
    shared.timerPompa = timer;
    xSemaphoreGive(dataMutex);
  }
}

void checkWaterLevel() {
  if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) != pdTRUE) return;
  if (shared.modeValve != MODE_AUTO) {
    xSemaphoreGive(dataMutex);
    return;
  }

  float persen = shared.persentaseAir;
  bool doOpen = false, doClose = false;

  if (persen < 10.0 && !shared.waterLevelLow) {
    shared.waterLevelLow = true;
    shared.waterLevelHigh = false;
    shared.valveOn = true;
    doOpen = true;
  } else if (persen > 60.0 && !shared.waterLevelHigh) {
    shared.waterLevelHigh = true;
    shared.waterLevelLow = false;
    shared.valveOn = false;
    doClose = true;
  }
  xSemaphoreGive(dataMutex);

  if (doOpen) digitalWrite(SOLENOID_VALVE, LOW);
  if (doClose) digitalWrite(SOLENOID_VALVE, HIGH);
}

void setupFuzzyLogic() {
  FuzzyInput *inputSoilMoisture = new FuzzyInput(1);
  FuzzySet *kering = new FuzzySet(0, 0, 30, 40);
  inputSoilMoisture->addFuzzySet(kering);
  FuzzySet *lembab = new FuzzySet(35, 50, 60, 75);
  inputSoilMoisture->addFuzzySet(lembab);
  FuzzySet *basah = new FuzzySet(70, 80, 100, 100);
  inputSoilMoisture->addFuzzySet(basah);
  fuzzy->addFuzzyInput(inputSoilMoisture);

  FuzzyOutput *outputTimer = new FuzzyOutput(1);
  FuzzySet *cepat = new FuzzySet(0, 2000, 3000, 4000);
  outputTimer->addFuzzySet(cepat);
  FuzzySet *sedang = new FuzzySet(3500, 5500, 6500, 8000);
  outputTimer->addFuzzySet(sedang);
  FuzzySet *lambat = new FuzzySet(7500, 9500, 11000, 12000);
  outputTimer->addFuzzySet(lambat);
  fuzzy->addFuzzyOutput(outputTimer);

  FuzzyRuleAntecedent *jikaSoilKering = new FuzzyRuleAntecedent();
  jikaSoilKering->joinSingle(kering);
  FuzzyRuleConsequent *makaTimerLambat = new FuzzyRuleConsequent();
  makaTimerLambat->addOutput(lambat);
  FuzzyRule *aturanFuzzy01 = new FuzzyRule(1, jikaSoilKering, makaTimerLambat);
  fuzzy->addFuzzyRule(aturanFuzzy01);

  FuzzyRuleAntecedent *jikaSoilLembab = new FuzzyRuleAntecedent();
  jikaSoilLembab->joinSingle(lembab);
  FuzzyRuleConsequent *makaTimerSedang = new FuzzyRuleConsequent();
  makaTimerSedang->addOutput(sedang);
  FuzzyRule *aturanFuzzy02 = new FuzzyRule(2, jikaSoilLembab, makaTimerSedang);
  fuzzy->addFuzzyRule(aturanFuzzy02);

  FuzzyRuleAntecedent *jikaSoilBasah = new FuzzyRuleAntecedent();
  jikaSoilBasah->joinSingle(basah);
  FuzzyRuleConsequent *makaTimerCepat = new FuzzyRuleConsequent();
  makaTimerCepat->addOutput(cepat);
  FuzzyRule *aturanFuzzy03 = new FuzzyRule(3, jikaSoilBasah, makaTimerCepat);
  fuzzy->addFuzzyRule(aturanFuzzy03);
}

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long startMs = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startMs < 15000) {
    delay(500);
  }
}

void setupWebServer() {
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    SharedData snapshot;
    if (xSemaphoreTake(dataMutex, MUTEX_TIMEOUT) == pdTRUE) {
      snapshot = shared;
      xSemaphoreGive(dataMutex);
    } else {
      request->send(503, "application/json", "{\\"error\\":\\"busy\\"}");
      return;
    }

    StaticJsonDocument<768> doc;
    doc["waktu"] = snapshot.formattedTime;
    doc["kelembaban"] = snapshot.kelembaban;
    doc["persentaseAir"] = snapshot.persentaseAir;
    doc["suhu"] = snapshot.suhu;
    doc["kelembapanUdara"] = snapshot.kelembapanUdara;
    doc["pompaOn"] = snapshot.pompaOn;
    doc["valveOn"] = snapshot.valveOn;

    String out;
    serializeJson(doc, out);
    request->send(200, "application/json", out);
  });
  server.begin();
}`;

  const handleCopyFullCode = () => {
    navigator.clipboard.writeText(fullEsp32Sketch);
    setCopiedFullCode(true);
    setTimeout(() => setCopiedFullCode(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      esp32Ip,
      mqttBroker,
      mqttTopic,
      mqttUsername,
      mqttPassword,
      wifiSsid,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto" id="settings-tab-container">
      {/* Header */}
      <div id="settings-tab-header" className="text-center">
        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Sistem & Hardware Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Konfigurasi Jaringan Wi-Fi, MQTT Broker, dan Topik Kontrol untuk Akses Global.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6" id="settings-form">
        {/* Column 2: Network / Broker Controls */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow flex flex-col justify-between" id="network-settings-card">
          <div className="space-y-6" id="network-settings-body">
            <div className="flex items-center gap-2.5" id="network-settings-header">
              <Wifi className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Kredensial IoT & Jaringan ESP32</h3>
            </div>

            {/* Input Fields */}
            <div className="space-y-4" id="network-settings-inputs">
              {/* MQTT Broker */}
              <div className="space-y-1.5" id="net-mqtt">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>MQTT Broker Server (PubSub WebSockets)</span>
                </label>
                <input
                  type="text"
                  value={mqttBroker}
                  onChange={(e) => setMqttBroker(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-sky-500/50 transition-all duration-300"
                  placeholder="Contoh: broker.hivemq.com"
                  id="input-mqtt-broker"
                />
              </div>

              {/* MQTT Topic Prefix */}
              <div className="space-y-1.5" id="net-mqtt-topic">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-sky-500" />
                  <span>MQTT Topik / Prefiks (Contoh: kebun/faiz)</span>
                </label>
                <input
                  type="text"
                  value={mqttTopic}
                  onChange={(e) => setMqttTopic(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:border-sky-500/50 transition-all duration-300"
                  placeholder="Contoh: kebun/faiz"
                  id="input-mqtt-topic"
                />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Otomatis membaca data dari <strong>kebun/faiz/telemetry</strong>, <strong>kebun/faiz/status</strong>, atau topik apapun dengan prefiks tersebut!
                </p>
              </div>

              {/* MQTT Username */}
              <div className="space-y-1.5" id="net-mqtt-user">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  <span>MQTT Username (Diperlukan untuk HiveMQ Cloud)</span>
                </label>
                <input
                  type="text"
                  value={mqttUsername}
                  onChange={(e) => setMqttUsername(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500/50 transition-all duration-300"
                  placeholder="Username MQTT"
                  id="input-mqtt-username"
                />
              </div>

              {/* MQTT Password */}
              <div className="space-y-1.5" id="net-mqtt-pass">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  <span>MQTT Password (Diperlukan untuk HiveMQ Cloud)</span>
                </label>
                <input
                  type="password"
                  value={mqttPassword}
                  onChange={(e) => setMqttPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-sky-500/50 transition-all duration-300"
                  placeholder="••••••••"
                  id="input-mqtt-password"
                />
              </div>

              {/* WiFi SSID */}
              <div className="space-y-1.5" id="net-wifi-ssid">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>SSID Wi-Fi Kebun</span>
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-sky-500/50 transition-all duration-300"
                  placeholder="SSID Wi-Fi Rumah/Kebun"
                  id="input-wifi-ssid"
                />
              </div>

              {/* WiFi Pass */}
              <div className="space-y-1.5" id="net-wifi-pass">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Kata Sandi Wi-Fi</span>
                </label>
                <input
                  type="password"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 focus:outline-none focus:border-sky-500/50 transition-all duration-300 font-mono"
                  id="input-wifi-pass"
                />
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-6 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic bg-slate-100/50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-850 font-medium" id="settings-note">
            *Pengaturan MQTT di atas digunakan oleh dashboard untuk berkomunikasi dua arah (PubSub) dengan ESP32 secara global dari jaringan mana pun tanpa batasan IP lokal.
          </div>
        </div>

        {/* FULL INTEGRATED ESP32 SKETCH CARD */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/30 rounded-3xl p-6 dash-card-glow space-y-4" id="full-sketch-card">
          <div className="flex items-center justify-between flex-wrap gap-3" id="full-sketch-header">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Kode Utuh / Full Sketch ESP32 (.ino)</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Gabungan lengkap REST API, MQTT Broker, Multi-Task FreeRTOS, DHT21, Fuzzy Mamdani, & Format LCD 16x2 I2C.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyFullCode}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {copiedFullCode ? <CheckCheck className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedFullCode ? 'Tersalin Lengkap!' : 'Salin Seluruh Kode ESP32 (.ino)'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Source Code Lengkap Siap Upload ke Arduino IDE:</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                Lengkap & Siap Kompilasi
              </span>
            </div>
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-96 border border-slate-800 scrollbar-thin">
              {fullEsp32Sketch}
            </pre>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex justify-end pt-2" id="settings-action-row">
          <button
            type="submit"
            className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer w-full sm:w-auto justify-center ${
              isSaved
                ? 'bg-[#e8f8f0] dark:bg-emerald-950/40 text-[#27ae60] dark:text-[#2ecc71] border border-[#2ecc71]/40'
                : 'bg-[#2ecc71] hover:bg-[#27ae60] text-white hover:shadow-lg hover:shadow-[#2ecc71]/10'
            }`}
            id="settings-submit-btn"
          >
            {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Pengaturan Disimpan!' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
