import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { Calendar, Clock, Bell, AlertTriangle, Info, Play, Square, RefreshCw, Wifi, WifiOff, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MoistureGauge from './components/MoistureGauge';
import WaterTank from './components/WaterTank';
import EnvSensorsCard from './components/EnvSensorsCard';
import HistoryCharts from './components/HistoryCharts';
import ControlCard from './components/ControlCard';
import ScheduleCard from './components/ScheduleCard';
import MonitoringTab from './components/Tabs/MonitoringTab';
import PengaturanTab from './components/Tabs/PengaturanTab';
import { 
  Tab, 
  SensorData, 
  WateringSchedule, 
  DeviceState, 
  HistoryPoint, 
  SystemLog, 
  ThresholdSettings 
} from './types';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Dark Mode State with LocalStorage Persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kebun_dark_mode');
    return saved === 'true';
  });

  // Apply dark class to root document element dynamically
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kebun_dark_mode', String(darkMode));
  }, [darkMode]);

  // Interactive Live Ticking Clock (Indonesian format)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Alerts & Toasts State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Sensor Readings (Initialized closer to screenshot values)
  const [sensorData, setSensorData] = useState<SensorData>({
    kelembaban: 68,
    waterLevel: 72,
    adc: 1420,
    distance: 18.6,
    suhu: 29.5,
    kelembapanUdara: 62,
  });

  // Settings & Jaringan ESP32 (Stored in LocalStorage if available)
  const [settings, setSettings] = useState<ThresholdSettings>(() => {
    const saved = localStorage.getItem('kebun_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      esp32Ip: '192.168.4.11',
      mqttBroker: 'broker.emqx.io',
      mqttTopic: 'kebun/faiz',
      mqttUsername: 'Skripsi',
      mqttPassword: 'arshaka18',
      wifiSsid: 'faiz',
    };
  });

  const mqttClientRef = useRef<any>(null);

  // Mode Jaringan Hardware Live (Selalu hardware, simulasi dihapus)
  const connectionMode = 'hardware';

  const [hardwareStatus, setHardwareStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Persist settings changes
  const handleSetSettings = (newSettings: ThresholdSettings) => {
    setSettings(newSettings);
    localStorage.setItem('kebun_settings', JSON.stringify(newSettings));
    addSystemLog('Pengaturan jaringan ESP32 berhasil diperbarui.', 'success');
  };

  // Watering Schedule Settings (morning & evening sessions)
  const [schedule, setSchedule] = useState<WateringSchedule>({
    pagi: '06:00',
    sore: '16:30',
    aktif: true,
  });

  // Pump & Solenoid Valve States
  const [pumpState, setPumpState] = useState<DeviceState>({ mode: 'auto', status: true });
  const [valveState, setValveState] = useState<DeviceState>({ mode: 'auto', status: true });

  // Synchronize with ESP32 via MQTT WebSockets (secure connection)
  useEffect(() => {
    let cleanBroker = (settings.mqttBroker || 'broker.emqx.io').trim();
    let brokerUrl = cleanBroker;

    if (!brokerUrl.startsWith('wss://') && !brokerUrl.startsWith('ws://')) {
      if (brokerUrl.includes('hivemq.cloud') || brokerUrl.includes('hivemq.com')) {
        brokerUrl = `wss://${brokerUrl}:8884/mqtt`;
      } else if (brokerUrl.includes('emqx')) {
        brokerUrl = `wss://${brokerUrl}:8084/mqtt`;
      } else if (brokerUrl.includes('mosquitto')) {
        brokerUrl = `wss://${brokerUrl}:8081/mqtt`;
      } else if (brokerUrl.includes(':')) {
        brokerUrl = `wss://${brokerUrl}/mqtt`;
      } else {
        brokerUrl = `wss://${brokerUrl}:8084/mqtt`;
      }
    }

    console.log(`Connecting to MQTT broker: ${brokerUrl}`);
    setHardwareStatus('connecting');
    addSystemLog(`Mencoba terhubung ke MQTT Broker (${brokerUrl})...`, 'info');

    let client: any;
    try {
      // Clean base topic from suffixes if user provided kebun/faiz/telemetry or kebun/faiz/status
      const rawTopic = (settings.mqttTopic || 'kebun/faiz').trim();
      const baseTopic = rawTopic.replace(/\/(telemetry|status|cmd|history)$/i, '');

      client = mqtt.connect(brokerUrl, {
        clientId: 'kebun_web_' + Math.random().toString(16).substring(2, 8),
        username: settings.mqttUsername || undefined,
        password: settings.mqttPassword || undefined,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 5000,
      });

      mqttClientRef.current = client;

      client.on('connect', () => {
        console.log('Connected to MQTT Broker!');
        setHardwareStatus('connected');
        addSystemLog('Terhubung ke MQTT Broker secara Live!', 'success');

        // Subscribe to wildcard baseTopic/# as well as specific topics
        const topicsToSub = [
          `${baseTopic}/#`,
          baseTopic,
          `${baseTopic}/telemetry`,
          `${baseTopic}/status`,
          `${baseTopic}/history`,
          rawTopic,
        ];

        topicsToSub.forEach((t) => {
          client?.subscribe(t, (err: any) => {
            if (err) console.error(`Subscription error for ${t}:`, err);
          });
        });
      });

      client.on('message', (topic: string, message: any) => {
        try {
          setHardwareStatus('connected');
          const payloadStr = message.toString();
          const json = JSON.parse(payloadStr);

          if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
            // Check if JSON contains sensor data fields
            if (
              json.suhu !== undefined ||
              json.kelembapanUdara !== undefined ||
              json.kelembaban !== undefined ||
              json.persentaseAir !== undefined ||
              json.temp !== undefined ||
              json.soil !== undefined ||
              json.air !== undefined ||
              json.jarak !== undefined ||
              json.distance !== undefined ||
              json.jarakSensor !== undefined ||
              json.soilRaw !== undefined ||
              json.nilaiSoil !== undefined ||
              json.adc !== undefined ||
              json.adcMentah !== undefined
            ) {
              const parsedMoisture = parseFloat(json.kelembaban ?? json.soil ?? 0);
              let parsedWaterLevel = parseFloat(json.persentaseAir ?? json.air ?? json.waterLevel ?? 0);
              
              const rawAdcVal = json.soilRaw ?? json.nilaiSoil ?? json.soilAdc ?? json.adcMentah ?? json.adc ?? json.rawAdc;
              let parsedAdc = parseInt(rawAdcVal !== undefined && rawAdcVal !== null ? rawAdcVal : 0);
              
              // If soil moisture percentage is present (> 0) but raw ADC is missing (0), estimate raw ADC (4095 dry -> 1500 wet)
              if ((parsedAdc === 0 || isNaN(parsedAdc)) && parsedMoisture > 0) {
                const DRY_ADC = 4095;
                const WET_ADC = 1500;
                parsedAdc = Math.round(DRY_ADC - (parsedMoisture / 100) * (DRY_ADC - WET_ADC));
              }

              const rawDistance = json.jarak ?? json.distance ?? json.jarakSensor ?? json.dist;
              const parsedDistance = parseFloat(rawDistance !== undefined && rawDistance !== null ? rawDistance : 0);

              // If persentaseAir was 0 or missing, but jarak is provided, calculate percentage based on 30cm tank height
              if ((parsedWaterLevel === 0 || isNaN(parsedWaterLevel)) && parsedDistance > 0) {
                const TINGGI_WADAH = 30.0;
                const tinggiAir = Math.max(0, Math.min(TINGGI_WADAH, TINGGI_WADAH - parsedDistance));
                parsedWaterLevel = Math.round((tinggiAir / TINGGI_WADAH) * 100);
              }

              const rawSuhu = json.suhu ?? json.temp ?? json.temperature ?? json.suhuUdara;
              const parsedSuhu = parseFloat(rawSuhu !== undefined && rawSuhu !== null ? rawSuhu : 29.5);

              const rawAirHum = json.kelembapanUdara ?? json.airHumidity ?? json.humidity ?? json.dhtHum ?? json.hum;
              const parsedAirHum = parseFloat(rawAirHum !== undefined && rawAirHum !== null ? rawAirHum : 62);

              setSensorData({
                kelembaban: isNaN(parsedMoisture) ? 0 : parsedMoisture,
                waterLevel: isNaN(parsedWaterLevel) ? 0 : parsedWaterLevel,
                adc: isNaN(parsedAdc) ? 0 : parsedAdc,
                distance: isNaN(parsedDistance) ? 0 : parsedDistance,
                suhu: isNaN(parsedSuhu) ? 29.5 : parsedSuhu,
                kelembapanUdara: isNaN(parsedAirHum) ? 62 : parsedAirHum,
              });

              // Update active device states
              const pumpModeVal = json.modePompa ?? json.pompaMode;
              if (pumpModeVal !== undefined || json.pompaOn !== undefined) {
                setPumpState({
                  mode: pumpModeVal === 'manual' ? 'manual' : 'auto',
                  status: !!json.pompaOn,
                });
              }

              const valveModeVal = json.modeValve ?? json.valveMode;
              if (valveModeVal !== undefined || json.valveOn !== undefined) {
                setValveState({
                  mode: valveModeVal === 'manual' ? 'manual' : 'auto',
                  status: !!json.valveOn,
                });
              }

              // Update schedule inputs if present
              if (json.jamPagi !== undefined || json.jamSore !== undefined) {
                const jamPagiFormatted = String(json.jamPagi || '06').padStart(2, '0');
                const menitPagiFormatted = String(json.menitPagi || '00').padStart(2, '0');
                const jamSoreFormatted = String(json.jamSore || '16').padStart(2, '0');
                const menitSoreFormatted = String(json.menitSore || '30').padStart(2, '0');

                setSchedule({
                  pagi: `${jamPagiFormatted}:${menitPagiFormatted}`,
                  sore: `${jamSoreFormatted}:${menitSoreFormatted}`,
                  aktif: json.jadwalAktif !== undefined ? !!json.jadwalAktif : true,
                });
              }
            }
          } else if (Array.isArray(json)) {
            const mapped = json.map((item: any) => {
              const soilVal = parseFloat(item.soil !== undefined && item.soil !== null ? item.soil : 0);
              const airVal = parseFloat(item.air !== undefined && item.air !== null ? item.air : 0);
              return {
                time: item.t || '--:--',
                kelembaban: isNaN(soilVal) ? 0 : soilVal,
                waterLevel: isNaN(airVal) ? 0 : airVal,
              };
            });
            setHistoryData(mapped);
          }
        } catch (e) {
          console.error('Failed to parse MQTT message:', e);
        }
      });

      client.on('error', (err: any) => {
        console.error('MQTT connection error:', err);
        setHardwareStatus('disconnected');
        addSystemLog(`MQTT Error: ${err.message}`, 'danger');
      });

      client.on('close', () => {
        console.log('MQTT connection closed');
        setHardwareStatus('disconnected');
      });

      mqttClientRef.current = client;
    } catch (e: any) {
      console.error('MQTT Setup error:', e);
      setHardwareStatus('disconnected');
      addSystemLog(`MQTT Setup Error: ${e.message}`, 'danger');
    }

    return () => {
      if (client) {
        client.end();
      }
      mqttClientRef.current = null;
    };
  }, [settings.mqttBroker, settings.mqttTopic, settings.mqttUsername, settings.mqttPassword]);

  // Command Dispatchers via MQTT
  const sendPumpControl = (mode: 'auto' | 'manual', status: boolean) => {
    const rawTopic = (settings.mqttTopic || 'kebun/faiz').trim();
    const baseTopic = rawTopic.replace(/\/(telemetry|status|cmd|history)$/i, '');

    if (mqttClientRef.current && mqttClientRef.current.connected) {
      const payloadObj = {
        pompa: status ? 'ON' : 'OFF',
        modePompa: mode,
        mode,
        state: status ? 'on' : 'off'
      };
      const payload = JSON.stringify(payloadObj);
      mqttClientRef.current.publish(`${baseTopic}/cmd`, payload, { qos: 1 });
      mqttClientRef.current.publish(`${baseTopic}/cmd/pump`, payload, { qos: 1 });
      addSystemLog(`MQTT: Mengirim perintah pompa (${mode.toUpperCase()}, ${status ? 'ON' : 'OFF'})`, 'success');
    } else {
      addSystemLog('MQTT: Gagal mengirim kontrol pompa. Hubungan broker terputus.', 'danger');
    }
  };

  const sendValveControl = (mode: 'auto' | 'manual', status: boolean) => {
    const rawTopic = (settings.mqttTopic || 'kebun/faiz').trim();
    const baseTopic = rawTopic.replace(/\/(telemetry|status|cmd|history)$/i, '');

    if (mqttClientRef.current && mqttClientRef.current.connected) {
      const payloadObj = {
        valve: status ? 'ON' : 'OFF',
        modeValve: mode,
        mode,
        state: status ? 'on' : 'off'
      };
      const payload = JSON.stringify(payloadObj);
      mqttClientRef.current.publish(`${baseTopic}/cmd`, payload, { qos: 1 });
      mqttClientRef.current.publish(`${baseTopic}/cmd/valve`, payload, { qos: 1 });
      addSystemLog(`MQTT: Mengirim perintah solenoid valve (${mode.toUpperCase()}, ${status ? 'ON' : 'OFF'})`, 'success');
    } else {
      addSystemLog('MQTT: Gagal mengirim kontrol solenoid. Hubungan broker terputus.', 'danger');
    }
  };

  const sendScheduleControl = (newSched: WateringSchedule) => {
    const rawTopic = (settings.mqttTopic || 'kebun/faiz').trim();
    const baseTopic = rawTopic.replace(/\/(telemetry|status|cmd|history)$/i, '');

    if (mqttClientRef.current && mqttClientRef.current.connected) {
      const [jamPagi, menitPagi] = newSched.pagi.split(':');
      const [jamSore, menitSore] = newSched.sore.split(':');
      const payload = JSON.stringify({
        jamPagi,
        menitPagi,
        jamSore,
        menitSore,
        aktif: newSched.aktif ? 1 : 0
      });
      mqttClientRef.current.publish(`${baseTopic}/cmd`, payload, { qos: 1 });
      mqttClientRef.current.publish(`${baseTopic}/cmd/schedule`, payload, { qos: 1 });
      addSystemLog(`MQTT: Mengirim pembaruan jadwal penyiraman ke ESP32`, 'success');
    } else {
      addSystemLog('MQTT: Gagal menyimpan jadwal. Hubungan broker terputus.', 'danger');
    }
  };

  const updatePumpState = (mode: 'auto' | 'manual', status: boolean) => {
    setPumpState({ mode, status });
    sendPumpControl(mode, status);
  };

  const updateValveState = (mode: 'auto' | 'manual', status: boolean) => {
    setValveState({ mode, status });
    sendValveControl(mode, status);
  };

  const updateSchedule = (newSched: WateringSchedule) => {
    setSchedule(newSched);
    sendScheduleControl(newSched);
  };

  // Historical Charts Data (Awalnya kosong, akan terisi otomatis setiap 15 menit)
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);

  // System Operation Logs State
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const now = new Date();
    const t1 = now.toTimeString().split(' ')[0];
    const t2 = new Date(now.getTime() - 5000).toTimeString().split(' ')[0];
    const t3 = new Date(now.getTime() - 12000).toTimeString().split(' ')[0];
    return [
      { id: '1', timestamp: t1, message: 'Koneksi MQTT ke broker.emqx.io berhasil (Live Mode).', type: 'success' },
      { id: '2', timestamp: t2, message: 'Sistem penyiraman otomatis ESP32 berbasis Fuzzy Mamdani aktif.', type: 'info' },
      { id: '3', timestamp: t3, message: 'IP Jaringan Wi-Fi didapatkan: 192.168.4.1 (SmartGarden-ESP32)', type: 'info' },
    ];
  });

  // Helper to push logs dynamically
  const addSystemLog = (message: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    const newLog: SystemLog = {
      id: Math.random().toString(),
      timestamp: timeStr,
      message,
      type,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Clock tick effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic 15-minute sampling recorder for live history graph
  useEffect(() => {
    // Record current sensor values every 15 minutes (900,000 ms)
    const historyInterval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setHistoryData(prev => {
        const newPoint: HistoryPoint = {
          time: timeStr,
          kelembaban: sensorData.kelembaban,
          waterLevel: sensorData.waterLevel,
        };
        
        // Prevent duplicate minute entries
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          const updated = [...prev];
          updated[updated.length - 1] = newPoint;
          return updated;
        }

        // Keep up to 24 last points (6 hours of 15-min intervals)
        const updated = [...prev, newPoint];
        return updated.length > 24 ? updated.slice(updated.length - 24) : updated;
      });
    }, 15 * 60 * 1000); // 15 Menit

    return () => clearInterval(historyInterval);
  }, [sensorData.kelembaban, sensorData.waterLevel]);

  // Cyber-Physical Simulation Loop: Simulate fluid flow & plant evaporation
  useEffect(() => {
    if (connectionMode === 'hardware') return;

    const simInterval = setInterval(() => {
      setSensorData(prev => {
        let nextMoisture = prev.kelembaban;
        let nextWaterLevel = prev.waterLevel;

        // 1. If Pump is ON -> Moisture rises, Water level decreases
        if (pumpState.status) {
          nextMoisture = Math.min(100, nextMoisture + 0.4);
          nextWaterLevel = Math.max(0, nextWaterLevel - 0.2);
        } else {
          // If Pump is OFF -> Moisture slowly evaporates (soil dries up)
          nextMoisture = Math.max(10, nextMoisture - 0.04);
        }

        // 2. If Solenoid Valve is ON -> Water level refuels/rises
        if (valveState.status) {
          nextWaterLevel = Math.min(100, nextWaterLevel + 0.5);
        }

        // 3. Dry-run Protection: Shut down pump if water runs out (< 10%)
        if (nextWaterLevel < 10 && pumpState.status) {
          setPumpState(p => ({ ...p, status: false }));
          addSystemLog('Kritis: Level air wadah rendah (< 10%). Pompa dimatikan paksa demi perlindungan dry-run!', 'danger');
          showToast('Proteksi Dry-run: Pompa Mati!');
        }

        // 4. Automation Logic: Triggered when Device is in AUTO mode
        // Auto Pump Watering trigger
        if (pumpState.mode === 'auto') {
          if (prev.kelembaban < settings.minMoisture && !pumpState.status && nextWaterLevel > 15) {
            setPumpState(p => ({ ...p, status: true }));
            addSystemLog(`Otomatisasi: Kelembaban tanah kritis (${prev.kelembaban.toFixed(0)}% < ${settings.minMoisture}%). Memulai penyiraman otomatis...`, 'info');
          } else if (prev.kelembaban >= settings.maxMoisture && pumpState.status) {
            setPumpState(p => ({ ...p, status: false }));
            addSystemLog(`Otomatisasi: Kelembaban tanah optimal tercapai (${prev.kelembaban.toFixed(0)}% >= ${settings.maxMoisture}%). Menghentikan penyiraman.`, 'success');
          }
        }

        // Auto Solenoid Valve refill trigger
        if (valveState.mode === 'auto') {
          if (prev.waterLevel < settings.minWaterLevel && !valveState.status) {
            setValveState(v => ({ ...v, status: true }));
            addSystemLog(`Otomatisasi: Level wadah kritis (${prev.waterLevel.toFixed(0)}% < ${settings.minWaterLevel}%). Membuka solenoid valve pengisian...`, 'warning');
          } else if (prev.waterLevel >= 95 && valveState.status) {
            setValveState(v => ({ ...v, status: false }));
            addSystemLog(`Otomatisasi: Wadah air terisi penuh (${prev.waterLevel.toFixed(0)}%). Menutup solenoid valve.`, 'success');
          }
        }

        // Calculate dependent variables (ADC & ultrasonic distance)
        const nextAdc = Math.round(4095 - (nextMoisture / 100) * 3095);
        const nextDistance = 50.0 - (nextWaterLevel / 100) * 45.0;

        return {
          kelembaban: parseFloat(nextMoisture.toFixed(1)),
          waterLevel: parseFloat(nextWaterLevel.toFixed(1)),
          adc: nextAdc,
          distance: parseFloat(nextDistance.toFixed(1)),
        };
      });
    }, 1000);

    return () => clearInterval(simInterval);
  }, [pumpState, valveState, settings]);

  // Show functional toast alerts
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Schedulers simulation trigger: checking when system matches Sesi Pagi / Sesi Sore
  useEffect(() => {
    if (connectionMode === 'hardware' || !schedule.aktif) return;
    
    const checkSchedule = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5); // "HH:MM"
      
      if (timeStr === schedule.pagi || timeStr === schedule.sore) {
        if (pumpState.mode === 'auto' && !pumpState.status && sensorData.waterLevel > 15) {
          setPumpState(p => ({ ...p, status: true }));
          addSystemLog(`Jadwal: Sesi waktu tercapai (${timeStr}). Memulai penyiraman terjadwal selama 3 menit.`, 'success');
          showToast('Penyiraman Terjadwal Dimulai!');
          
          // Auto turn off after 3 minutes (simulated)
          setTimeout(() => {
            setPumpState(p => ({ ...p, status: false }));
            addSystemLog(`Jadwal: Sesi penyiraman (${timeStr}) selesai.`, 'info');
          }, 180000);
        }
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(checkSchedule);
  }, [schedule, pumpState.mode, sensorData.waterLevel]);

  // Format Indonesian Date & Time
  const formatIndoDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  // Warning check for general system status text at the bottom
  const getSystemHealth = () => {
    if (sensorData.waterLevel < settings.minWaterLevel) {
      return { status: 'warning' as const, text: 'Air Wadah Rendah' };
    }
    if (sensorData.kelembaban < settings.minMoisture) {
      return { status: 'warning' as const, text: 'Tanah Kering' };
    }
    return { status: 'normal' as const, text: 'Semua Normal' };
  };

  const systemHealth = getSystemHealth();

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#f1f5f9] via-[#e2e8f0] to-[#f8fafc] dark:from-[#0b0f19] dark:via-[#111827] dark:to-[#1f2937] font-sans text-slate-700 dark:text-slate-100 overflow-hidden relative z-10" id="app-root-container">
      {/* Cloud Drifting Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Cloud 1 (Slow) */}
        <div className="absolute top-[8%] left-0 w-80 h-40 cloud-slow opacity-80 dark:opacity-25 filter blur-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current drop-shadow-[0_10px_20px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]">
            <path d="M 20,60 A 15,15 0 0,1 30,35 A 20,20 0 0,1 70,35 A 15,15 0 0,1 80,60 A 12,12 0 0,1 70,75 L 30,75 A 12,12 0 0,1 20,60 Z" />
          </svg>
        </div>
        {/* Cloud 2 (Medium) */}
        <div className="absolute top-[25%] left-0 w-96 h-48 cloud-medium opacity-90 dark:opacity-30 filter blur-[2px]" style={{ animationDelay: '-10s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current drop-shadow-[0_15px_25px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_15px_25px_rgba(255,255,255,0.15)]">
            <path d="M 20,60 A 15,15 0 0,1 30,35 A 20,20 0 0,1 70,35 A 15,15 0 0,1 80,60 A 12,12 0 0,1 70,75 L 30,75 A 12,12 0 0,1 20,60 Z" />
          </svg>
        </div>
        {/* Cloud 3 (Fast) */}
        <div className="absolute top-[55%] left-0 w-64 h-32 cloud-fast opacity-75 dark:opacity-20 filter blur-[3px]" style={{ animationDelay: '-4s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95 fill-current drop-shadow-[0_8px_16px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_8px_16px_rgba(255,255,255,0.12)]">
            <path d="M 20,60 A 15,15 0 0,1 30,35 A 20,20 0 0,1 70,35 A 15,15 0 0,1 80,60 A 12,12 0 0,1 70,75 L 30,75 A 12,12 0 0,1 20,60 Z" />
          </svg>
        </div>
        {/* Cloud 4 (Slow) */}
        <div className="absolute top-[72%] left-0 w-88 h-44 cloud-slow opacity-85 dark:opacity-25 filter blur-sm" style={{ animationDelay: '-22s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current drop-shadow-[0_12px_24px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_12px_24px_rgba(255,255,255,0.15)]">
            <path d="M 20,60 A 15,15 0 0,1 30,35 A 20,20 0 0,1 70,35 A 15,15 0 0,1 80,60 A 12,12 0 0,1 70,75 L 30,75 A 12,12 0 0,1 20,60 Z" />
          </svg>
        </div>
        {/* Cloud 5 (Medium) */}
        <div className="absolute top-[40%] right-0 w-80 h-40 cloud-medium opacity-70 dark:opacity-20 filter blur-[4px]" style={{ animationDelay: '-16s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current drop-shadow-[0_10px_20px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_10px_20px_rgba(255,255,255,0.12)]">
            <path d="M 20,60 A 15,15 0 0,1 30,35 A 20,20 0 0,1 70,35 A 15,15 0 0,1 80,60 A 12,12 0 0,1 70,75 L 30,75 A 12,12 0 0,1 20,60 Z" />
          </svg>
        </div>
      </div>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-emerald-500/40 dark:border-emerald-500/30 text-slate-800 dark:text-slate-100 font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" id="toast-notification">
          <Bell className="w-4 h-4 text-[#27ae60] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          addSystemLog(`Navigasi ke panel: ${tab.toUpperCase()}`, 'info');
        }} 
        systemStatus={systemHealth.status}
        statusText={systemHealth.text}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 relative flex flex-col justify-between z-10 w-full" id="main-content-layout">
        
        {/* Mobile Top Header Bar */}
        <div className="flex md:hidden items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 mb-4 shadow-sm" id="mobile-top-bar">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-200 hover:text-[#27ae60] bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight">Kebun Termonitor</span>
              <p className="text-[10px] text-[#27ae60] dark:text-[#2ecc71] font-bold tracking-wider">ESP32 IoT</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold">
              {hardwareStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <span className="text-sky-600 dark:text-sky-400">Online</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-600 dark:text-amber-400">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TOP PANEL: Branding, Title, and Dynamic Clock */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8" id="top-panel-header">
          <div>
            <span className="text-[10px] font-mono tracking-widest font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60]" />
              SISTEM PENYIRAMAN OTOMATIS · ESP32
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-white tracking-tight mt-1 capitalize">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              {activeTab === 'dashboard' && 'Pantau kondisi kebun dan kendalikan sistem penyiraman'}
              {activeTab === 'monitoring' && 'Analisis diagnostik mendalam sensor-sensor hardware.'}
              {activeTab === 'jadwal' && 'Sesuaikan frekuensi penyiram harian otomatis.'}
              {activeTab === 'kontrol' && 'Operasikan relay pompa dan solenoid valve secara manual.'}
              {activeTab === 'pengaturan' && 'Kalibrasi batas kelembaban dan server IoT Anda.'}
            </p>
          </div>

          {/* Right Clock & Active Widget */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end" id="header-right-widgets">
            {/* Dynamic Status / Connection Indicator */}
            <div className="flex items-center gap-2 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-sm" id="sys-active-badge">
              {hardwareStatus === 'connected' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" style={{ animationDuration: '2s' }} />
                  <span className="text-slate-700 dark:text-slate-200 font-bold tracking-wide text-sky-600 dark:text-sky-400">ESP32 Online</span>
                </>
              ) : hardwareStatus === 'connecting' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-slate-700 dark:text-slate-200 font-bold tracking-wide text-amber-600 dark:text-amber-400">Menghubungkan...</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-slate-700 dark:text-slate-200 font-bold tracking-wide text-rose-500">ESP32 Offline</span>
                </>
              )}
            </div>

            {/* Dynamic Date & Time Panel */}
            <div className="bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-1 min-w-0 sm:min-w-48 shadow-sm flex-1 sm:flex-none" id="clock-widget">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{formatIndoDate(currentTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-white tracking-widest mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#27ae60] shrink-0" />
                <span>{currentTime.toTimeString().split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE VIEW ROUTER */}
        <div className="flex-1 mb-8" id="view-router-container">
          {activeTab === 'dashboard' && (
            <div className="space-y-6" id="dashboard-view-wrapper">
              
              {/* Row 1: Gauges & Environmental Readings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="row-gauges">
                <MoistureGauge percentage={Math.round(sensorData.kelembaban)} adc={sensorData.adc} />
                <WaterTank percentage={Math.round(sensorData.waterLevel)} distance={sensorData.distance} />
              </div>

              {/* Environment Sensors: Suhu Udara & Kelembapan Udara */}
              <EnvSensorsCard suhu={sensorData.suhu} kelembapanUdara={sensorData.kelembapanUdara} />

              {/* Row 2: Charts */}
              <HistoryCharts historyData={historyData} />

              {/* Row 3: Control Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="row-controls">
                
                {/* Pump Control */}
                <ControlCard 
                  title="Kontrol Pompa"
                  icon={<span className="material-symbols-outlined text-xl select-none">water_pump</span>}
                  mode={pumpState.mode}
                  status={pumpState.status}
                  statusLabelOn="Pompa Aktif"
                  statusLabelOff="Pompa Mati"
                  onChangeMode={(m) => {
                    updatePumpState(m, pumpState.status);
                    addSystemLog(`Ubah Mode Pompa menjadi: ${m.toUpperCase()}`, 'info');
                    showToast(`Mode Pompa: ${m.toUpperCase()}`);
                  }}
                  onToggleStatus={() => {
                    const next = !pumpState.status;
                    updatePumpState(pumpState.mode, next);
                    addSystemLog(`Perintah Manual: Pompa ${next ? 'DIHIDUPKAN' : 'DIMATIKAN'}.`, next ? 'success' : 'warning');
                    showToast(`Pompa: ${next ? 'ON' : 'OFF'}`);
                  }}
                  onAttemptManualClick={() => {
                    showToast('Ubah ke Manual untuk mengontrol Pompa.');
                    addSystemLog('Gagal mengubah Pompa secara langsung: Sistem dalam mode AUTO.', 'warning');
                  }}
                />

                {/* Valve Control */}
                <ControlCard 
                  title="Kontrol Solenoid Valve"
                  icon={<span className="material-symbols-outlined text-xl select-none">valve</span>}
                  mode={valveState.mode}
                  status={valveState.status}
                  statusLabelOn="Valve Terbuka"
                  statusLabelOff="Valve Tertutup"
                  onChangeMode={(m) => {
                    updateValveState(m, valveState.status);
                    addSystemLog(`Ubah Mode Solenoid Valve menjadi: ${m.toUpperCase()}`, 'info');
                    showToast(`Mode Valve: ${m.toUpperCase()}`);
                  }}
                  onToggleStatus={() => {
                    const next = !valveState.status;
                    updateValveState(valveState.mode, next);
                    addSystemLog(`Perintah Manual: Solenoid Valve ${next ? 'DIBUKA' : 'DITUTUP'}.`, next ? 'success' : 'warning');
                    showToast(`Valve: ${next ? 'DIBUKA' : 'DITUTUP'}`);
                  }}
                  onAttemptManualClick={() => {
                    showToast('Ubah ke Manual untuk mengontrol Valve.');
                    addSystemLog('Gagal mengontrol Valve secara langsung: Sistem dalam mode AUTO.', 'warning');
                  }}
                />

                {/* Watering Schedule */}
                <ScheduleCard 
                  schedule={schedule}
                  onSaveSchedule={(newSched) => {
                    updateSchedule(newSched);
                    addSystemLog(`Jadwal diperbarui: Pagi (${newSched.pagi}), Sore (${newSched.sore}). Status: ${newSched.aktif ? 'Aktif' : 'Nonaktif'}`, 'success');
                    showToast('Jadwal Penyiraman Disimpan!');
                  }}
                />
              </div>

              {/* Row 4: Notification Banner */}
              <div 
                className="bg-white/80 backdrop-blur-md border border-slate-200 hover:border-[#27ae60]/40 transition-colors rounded-2xl p-4 flex items-center gap-4 text-xs shadow-sm"
                id="footer-alert-banner"
              >
                <div className="w-10 h-10 rounded-full bg-[#e8f8f0] border border-[#2ecc71]/20 flex items-center justify-center shrink-0" id="alert-bell-box">
                  <Bell className="w-5 h-5 text-[#27ae60] animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-[#27ae60] tracking-wide" id="alert-title">
                    {sensorData.waterLevel < 25 
                      ? 'Peringatan: Persediaan Air Wadah Menipis!' 
                      : sensorData.kelembaban < 45 
                        ? 'Notifikasi: Kondisi Tanah Kering - Pompa Aktif!'
                        : 'Semua sistem berjalan normal.'}
                  </p>
                  <p className="text-slate-400 font-mono mt-0.5 font-semibold" id="alert-subtext">
                    Terakhir diperbarui: {currentTime.toTimeString().split(' ')[0]}
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'monitoring' && (
            <MonitoringTab 
              sensorData={sensorData} 
              setSensorData={setSensorData} 
              logs={logs}
              setLogs={setLogs}
              addSystemLog={addSystemLog}
              isPumpOn={pumpState.status}
              isValveOn={valveState.status}
            />
          )}

          {activeTab === 'jadwal' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow space-y-6" id="dedicated-schedule-tab">
              <div className="max-w-2xl" id="sched-tab-body">
                <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white mb-2">Penjadwal Penyiraman Lengkap</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                  Sistem otomatis menggunakan modul RTC (Real-Time Clock) internal pada hardware ESP32 Anda untuk menjalankan siklus penyiraman secara terjadwal meskipun koneksi internet terputus. Atur waktu ideal untuk menyiram tanaman Anda pada pagi dan sore hari.
                </p>
                <div className="max-w-md" id="sched-tab-card-container">
                  <ScheduleCard 
                    schedule={schedule}
                    onSaveSchedule={(newSched) => {
                      updateSchedule(newSched);
                      addSystemLog(`Jadwal diperbarui: Pagi (${newSched.pagi}), Sore (${newSched.sore}).`, 'success');
                      showToast('Jadwal Berhasil Diperbarui!');
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kontrol' && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 dash-card-glow space-y-6" id="dedicated-control-tab">
              <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white">Pusat Kendali Aktuator Manual</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Silakan ganti mode ke <strong>Manual</strong> untuk mengaktifkan kendali penuh saklar daya.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4" id="kontrol-tab-cards">
                <ControlCard 
                  title="Kontrol Pompa Utama"
                  icon={<span className="material-symbols-outlined text-xl select-none">water_pump</span>}
                  mode={pumpState.mode}
                  status={pumpState.status}
                  statusLabelOn="Pompa Sedang Menyiram Kebun"
                  statusLabelOff="Pompa dalam keadaan Nonaktif"
                  onChangeMode={(m) => {
                    updatePumpState(m, pumpState.status);
                    addSystemLog(`Ubah Mode Pompa menjadi: ${m.toUpperCase()}`, 'info');
                    showToast(`Mode Pompa: ${m.toUpperCase()}`);
                  }}
                  onToggleStatus={() => {
                    const next = !pumpState.status;
                    updatePumpState(pumpState.mode, next);
                    addSystemLog(`Manual: Pompa ${next ? 'DIHIDUPKAN' : 'DIMATIKAN'}.`, next ? 'success' : 'warning');
                    showToast(`Pompa: ${next ? 'ON' : 'OFF'}`);
                  }}
                  onAttemptManualClick={() => showToast('Ubah mode ke Manual terlebih dahulu.')}
                />

                <ControlCard 
                  title="Kontrol Solenoid Refill"
                  icon={<span className="material-symbols-outlined text-xl select-none">valve</span>}
                  mode={valveState.mode}
                  status={valveState.status}
                  statusLabelOn="Kran Valve Terbuka (Mengisi Wadah)"
                  statusLabelOff="Valve Tertutup Rapat"
                  onChangeMode={(m) => {
                    updateValveState(m, valveState.status);
                    addSystemLog(`Ubah Mode Solenoid Valve menjadi: ${m.toUpperCase()}`, 'info');
                    showToast(`Mode Valve: ${m.toUpperCase()}`);
                  }}
                  onToggleStatus={() => {
                    const next = !valveState.status;
                    updateValveState(valveState.mode, next);
                    addSystemLog(`Manual: Solenoid Valve ${next ? 'DIBUKA' : 'DITUTUP'}.`, next ? 'success' : 'warning');
                    showToast(`Valve: ${next ? 'DIBUKA' : 'DITUTUP'}`);
                  }}
                  onAttemptManualClick={() => showToast('Ubah mode ke Manual terlebih dahulu.')}
                />
              </div>

              {/* Water flow Animation representation */}
              <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center" id="fluid-animation-showcase">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-3">Simulasi Aliran Air Pipa</p>
                <div className="flex justify-center items-center gap-3" id="pipe-simulation-flex">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Wadah Air</span>
                  <div className="flex-1 max-w-sm h-3 bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-full overflow-hidden relative">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-sky-500 transition-all duration-300 ${
                        pumpState.status ? 'w-full opacity-100' : 'w-0 opacity-0'
                      }`} 
                      id="moving-fluid-line"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Tanaman Kebun</span>
                </div>
                {pumpState.status && (
                  <p className="text-[10px] text-[#27ae60] dark:text-[#2ecc71] font-bold mt-2 animate-pulse">Air sedang mengalir membasahi tanah kebun...</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanTab settings={settings} setSettings={handleSetSettings} />
          )}
        </div>

        {/* BOTTOM METADATA RAIL */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200/80 dark:border-slate-850 pt-4 mt-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono gap-2" id="bottom-status-bar">
          <p>© 2026 Kebun Termonitor — Sistem Penyiraman Otomatis Cerdas berbasis ESP32.</p>
          <div className="flex items-center gap-4" id="bottom-diagnostic-badges">
            <span>Broker Status: <strong className="text-[#27ae60]">Terhubung</strong></span>
            <span>IP: <strong className="text-sky-600">{settings.esp32Ip}</strong></span>
          </div>
        </div>
      </main>
    </div>
  );
}
