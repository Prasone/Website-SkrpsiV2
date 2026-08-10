export type Tab = 'dashboard' | 'monitoring' | 'jadwal' | 'kontrol' | 'pengaturan';

export interface WateringSchedule {
  pagi: string;
  sore: string;
  aktif: boolean;
}

export type ControlMode = 'auto' | 'manual';

export interface DeviceState {
  mode: ControlMode;
  status: boolean;
}

export interface SensorData {
  kelembaban: number; // in % (soil moisture)
  waterLevel: number; // in %
  adc: number;       // raw ADC (1000 - 4095)
  distance: number;  // in cm
  suhu: number;      // in °C (ambient temperature)
  kelembapanUdara: number; // in % (air humidity)
}

export interface HistoryPoint {
  time: string;
  kelembaban: number;
  waterLevel: number;
  suhu?: number;
  kelembapanUdara?: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface ThresholdSettings {
  esp32Ip: string;
  mqttBroker: string;
  mqttTopic: string;
  mqttUsername?: string;
  mqttPassword?: string;
  wifiSsid: string;
}
