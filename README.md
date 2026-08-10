# 🌿 Kebun Termonitor - Smart Garden IoT Monitoring System

Sistem antarmuka web monitoring dan kontrol penyiraman tanaman berbasis **Internet of Things (IoT)** yang terintegrasi dengan mikrokontroler **ESP32** menggunakan protokol transmisi data real-time **MQTT**.

---

## 📋 Deskripsi, Kegunaan, dan Tujuan

### 1. Deskripsi
**Kebun Termonitor** adalah aplikasi dashboard berbasis web modern yang dirancang untuk memantau kondisi lingkungan pertanian/perkebunan di area terbuka (*open field*) secara real-time. Aplikasi ini menyajikan visualisasi parameter tanah, kondisi atmosfer, serta status tangki air dan aktuator penyiraman secara interaktif dan intuitif.

### 2. Kegunaan
* **Monitoring Real-Time:** Memantau tingkat kelembapan tanah, suhu udara, kelembapan udara (AM2301/DHT21), serta ketersediaan air pada wadah/penampungan secara jarak jauh.
* **Kontrol Aktuator:** Memungkinkan pengguna untuk menyalakan/mematikan pompa air dan membuka/menutup *solenoid valve* secara manual dari mana saja melalui koneksi internet.
* **Otomatisasi Penyiraman:** Mendukung penjadwalan penyiraman otomatis (misalnya sesi pagi dan sore) untuk menjaga kelembapan ideal tanaman pada musim kemarau.
* **Logging Data & Histori:** Merekam jejak data pengujian dan riwayat sensor dalam bentuk grafik dan tabel pengujian.

### 3. Tujuan
* **Efisiensi Penggunaan Air:** Menghindari pemborosan air penyiraman dengan memastikan penyiraman hanya dilakukan saat kelembapan tanah membutuhkan atau sesuai jadwal yang telah ditentukan.
* **Kemudahan Aksesibilitas:** Memudahkan pengelola kebun dalam mengawasi sistem tanpa harus berada di lokasi fisik kebun secara terus-menerus.
* **Akurasi Data:** Memberikan data kondisi fisik kebun yang tepat dan cepat untuk mendukung pengambilan keputusan perawatan tanaman.

---

## 🛠️ Fundamental & Teknologi yang Digunakan

### 1. Frontend & Web Technologies
* **React 19:** Library UI JavaScript deklaratif berbasis komponen.
* **TypeScript:** Bahasa pemrograman bertipe ketat (*strongly typed*) untuk keandalan dan keamanan kode.
* **Tailwind CSS v4:** Framework CSS utilitas untuk desain antarmuka yang responsif, rapi, dan modern.
* **Vite:** Build tool dan bundler generasi baru yang cepat untuk pengembangan aplikasi web modern.
* **Lucide React:** Koleksi ikon vektor SVG yang konsisten dan elegan.
* **Motion (Framer Motion):** Library animasi untuk transisi antarmuka yang halus.

### 2. Protokol Komunikasi & IoT
* **MQTT (Message Queuing Telemetry Transport):** Protokol komunikasi data ringan bertipe *publish-subscribe* berbasis WebSocket over TLS (`wss://`) melalui library `mqtt.js`.

### 3. Perangkat Keras (Hardware Integration)
* **Mikrokontroler:** ESP32 (Wi-Fi & Bluetooth)
* **Sensor Kelembapan Tanah:** Soil Moisture Sensor (Analog/Digital)
* **Sensor Level Air:** Sensor Ultrasonik HC-SR04
* **Sensor Suhu & Kelembapan Udara:** Sensor DHT21 / AM2301
* **Aktuator:** Pompa Air DC / AC via Modul Relay & Solenoid Valve
* **Display Lokal:** Modul LCD 16x2 dengan Interface I2C

### 4. Publikasi & Hosting
* **Vercel:** Platform cloud deployment untuk mempublikasikan antarmuka website frontend secara cepat, efisien, dan responsif global.

---

## 🚀 Cara Pemakaian Website

1. **Membuka Aplikasi Web**
   * Akses URL website yang telah dipublikasikan di Vercel (atau server lokal di port 3000).

2. **Memeriksa Status Koneksi IoT**
   * Perhatikan indikator status koneksi di pojok kanan atas atau sidebar. Pastikan indikator menunjukkan status **Online** yang menandakan website terhubung dengan broker MQTT dan perangkat ESP32.

3. **Melihat Dashboard Monitoring Utama**
   * **Kelembapan Tanah:** Dilihat pada *Soil Moisture Gauge* dalam persen (%).
   * **Level Air Wadah:** Dilihat pada visualisasi *Water Tank 3D* dalam persen (%) dan cm.
   * **Suhu & Kelembapan Udara:** Memantau temperatur (°C) dan *Relative Humidity* (%RH) lingkungan dari sensor DHT21.

4. **Pengontrolan Manual (Pompa & Valve)**
   * Masuk ke kartu kontrol pada Dashboard atau Tab **Pengontrolan**.
   * Tekan tombol toggle **Pompa Air** untuk menyalakan atau mematikan pompa secara langsung.
   * Tekan tombol toggle **Solenoid Valve** untuk membuka atau menutup katup air.

5. **Pengaturan Jadwal Penyiraman Otomatis**
   * Akses Tab **Jadwal** atau **Pengaturan**.
   * Aktifkan sakelar jadwal dan atur jam penyiraman (misalnya Jadwal Pagi pukul 08:45 WIB dan Jadwal Sore pukul 16:30 WIB).
   * Sistem akan mengirim sinyal instruksi ke ESP32 secara otomatis pada jam yang telah ditentukan.

6. **Melihat Grafik Riwayat & Data**
   * Buka Tab **Riwayat Data** untuk mengamati tren perubahan kondisi tanah dan cuaca lingkungan dari waktu ke waktu.

7. **Beralih Mode Tampilan (Dark / Light Mode)**
   * Gunakan sakelar tema pada bagian bawah sidebar untuk menyesuaikan tampilan visual sesuai kenyamanan mata (terang atau gelap).

---

## 📊 Hasil Data Pengujian & Analisis Sensor

### 1. Tabel 4.1 Hasil Data Pengujian Sensor Soil Moisture
| Percobaan | Nilai Soil (%) | Perhitungan Alat | Perhitungan Manual | Nilai Error (%) |
|:---------:|:--------------:|:----------------:|:------------------:|:---------------:|
| 1 | 36% | 9213.56 | 9193.60 | 0.0022% |
| 2 | 74% | 2727.29 | 3000.00 | 9.0900% |
| 3 | 69% | 5796.93 | 5850.00 | 0.9100% |
| 4 | 37% | 8543.51 | 9000.00 | 5.0700% |
| 5 | 41% | 5796.93 | 5850.00 | 0.9100% |
| 6 | 64% | 5829.48 | 5875.00 | 0.7700% |
| 7 | 0%  | 10333.33 | 10000.00 | 3.3300% |
| 8 | 80% | 2200.00 | 2250.00 | 2.2200% |
| 9 | 66% | 5817.39 | 5875.00 | 0.9800% |
| 10 | 26% | 10333.33 | 10000.00 | 3.3300% |

> **Analisis & Kesimpulan Sensor Soil:**
> Terdapat kenaikan nilai error pada beberapa titik akibat range data pembacaan analog ADC yang mengalami fluktuasi. Pada percobaan 7 dan 10 menghasilkan pembacaan raw yang mirip dikarenakan terjadinya *overlaps* data sehingga mempengaruhi konsistensi perhitungan logika fuzzy.

---

### 2. Tabel 4.2 Hasil Data Pengamatan Sensor DHT21 (Lahan Terbuka Musim Kemarau)
| No | Waktu Pengujian (WIB) | Suhu Udara Terukur DHT21 (°C) | Kelembapan Udara Terukur DHT21 (%RH) |
|:--:|:---------------------:|:----------------------------:|:-----------------------------------:|
| 1 | 06.00 WIB | 24,2 °C | 78 %RH |
| 2 | 08.00 WIB | 27,8 °C | 66 %RH |
| 3 | 10.00 WIB | 31,4 °C | 53 %RH |
| 4 | 12.00 WIB | 34,6 °C | 41 %RH |
| 5 | 13.30 WIB | 35,8 °C | 37 %RH |
| 6 | 15.00 WIB | 33,9 °C | 44 %RH |
| 7 | 16.30 WIB | 30,5 °C | 54 %RH |
| 8 | 18.00 WIB | 27,9 °C | 65 %RH |
| 9 | 20.00 WIB | 26,1 °C | 72 %RH |
| 10 | 22.00 WIB | 25,0 °C | 76 %RH |

> **Analisis & Kesimpulan Sensor DHT21:**
> Sensor DHT21 berhasil merespons perubahan cuaca lingkungan outdoor secara real-time pada kondisi musim kemarau. Suhu udara terendah tercatat sebesar **24,2 °C** pada pukul 06.00 WIB (kelembapan 78 %RH), sedangkan suhu puncak tertinggi mencapai **35,8 °C** pada pukul 13.30 WIB (kelembapan terendah 37 %RH).

---

### 3. Tabel 4.3 Hasil Data Pengujian Sensor Ultrasonik Toren Air (Tinggi Wadah = 17,5 cm)
*Parameter: `TINGGI_WADAH = 17.5 cm`*

| Percobaan | Keterisian Toren (%) | Ketinggian Air / Jarak (cm) | Kondisi Solenoid Valve | Status Pengujian |
|:---------:|:--------------------:|:--------------------------:|:---------------------:|:----------------:|
| 1 | 90% | 1,75 cm (Jarak Sensor) / 15,75 cm (Air) | Kondisi Tertutup | Sukses |
| 2 | 30% | 12,25 cm (Jarak Sensor) / 5,25 cm (Air) | Kondisi Tertutup | Sukses |
| 3 | 10% | 15,75 cm (Jarak Sensor) / 1,75 cm (Air) | Kondisi Terbuka | Sukses |
| 4 | 85% | 2,63 cm (Jarak Sensor) / 14,88 cm (Air) | Kondisi Tertutup | Sukses |
| 5 | 40% | 10,50 cm (Jarak Sensor) / 7,00 cm (Air) | Kondisi Terbuka | Sukses |
| 6 | 60% | 7,00 cm (Jarak Sensor) / 10,50 cm (Air) | Kondisi Tertutup | Sukses |
| 7 | 5%  | 16,63 cm (Jarak Sensor) / 0,88 cm (Air) | Kondisi Terbuka | Sukses |
| 8 | 80% | 3,50 cm (Jarak Sensor) / 14,00 cm (Air) | Kondisi Tertutup | Sukses |
| 9 | 40% | 10,50 cm (Jarak Sensor) / 7,00 cm (Air) | Kondisi Tertutup | Sukses |
| 10 | 55% | 7,88 cm (Jarak Sensor) / 9,63 cm (Air) | Kondisi Tertutup | Sukses |

**Persentase Keberhasilan: 100%**

> **Kesimpulan Pengujian Sensor Ultrasonik:**
> Tingkat keberhasilan dari uji coba sensor ultrasonik (HC-SR04) untuk mendeteksi kapasitas air pada toren dengan tinggi wadah 17,5 cm mencapai **100%**. Seluruh 10 percobaan sukses mendeteksi tingkat keterisian air dan jarak sensor secara presisi serta mengontrol respon solenoid valve secara akurat tanpa hambatan transmisi atau kegagalan perangkat.

---

### 4. Tabel 4.5 Hasil Pengujian Aplikasi (Black Box Testing)
Pengujian aplikasi dilakukan menggunakan metode **Black Box Testing** untuk memastikan seluruh fungsi dan fitur antarmuka pada aplikasi monitoring dan kontrol Smart Garden IoT dapat berjalan dengan baik sesuai rancangan tanpa mengalami kesalahan (*error*).

| No | Fitur / Fungsi | Skenario Pengujian | Hasil yang Diharapkan | Hasil Pengujian |
|:--:|:--------------|:-------------------|:----------------------|:---------------:|
| 1 | Monitoring Kelembaban Tanah | Membaca data kelembaban tanah dari sensor Soil Moisture / ADC. | Aplikasi menampilkan nilai persen kelembaban tanah dan status indikator secara real-time. | **Sesuai** |
| 2 | Monitoring Level Air Tangki | Membaca data kapasitas air dari sensor ultrasonik. | Aplikasi menampilkan volume air dalam persen (%) dan jarak ultrasonik (cm) secara akurat. | **Sesuai** |
| 3 | Monitoring Suhu & Kelembapan Udara | Membaca data lingkungan dari sensor DHT (DHT21/22). | Aplikasi menampilkan suhu (°C) dan kelembapan udara (% RH) beserta indikator kriteria lingkungan. | **Sesuai** |
| 4 | Kontrol Pompa (Mode Manual) | Mematikan atau menghidupkan sakelar pompa siram pada aplikasi. | Modul relay pompa air merespons status ON/OFF sesuai tombol yang ditekan pada aplikasi. | **Sesuai** |
| 5 | Kontrol Valve (Mode Manual) | Mematikan atau menghidupkan sakelar solenoid valve pengisi tangki. | Modul relay solenoid valve membuka atau menutup alir air sesuai perintah aplikasi. | **Sesuai** |
| 6 | Beralih Mode (Auto / Manual) | Mengubah toggle mode kontrol antara Otomatis (Fuzzy Logic) dan Manual. | Sistem memperbarui mode operasi dan menolak/menerima perintah manual sesuai mode aktif. | **Sesuai** |
| 7 | Pengaturan Jadwal Penyiraman | Mengatur jam penyiraman pagi/sore dan menekan tombol simpan jadwal. | Jadwal tersimpan ke memori ESP32 (Preferences Flash) dan penyiraman otomatis terpicu tepat waktu. | **Sesuai** |
| 8 | Grafik Riwayat Data (History) | Membuka tab grafik riwayat pemantauan sensor. | Grafik menampilkan riwayat data kelembaban tanah dan level air secara temporal (tiap 15 menit). | **Sesuai** |
| 9 | Status Koneksi & Indikator IoT | Memutus atau menghubungkan kembali koneksi jaringan Wi-Fi/MQTT ESP32. | Aplikasi menampilkan status Online / Offline serta indikator responsivitas jaringan secara tepat. | **Sesuai** |
| 10 | Simulasi Slider & Diagnosis | Mengubah nilai slider simulasi sensor pada tab pengujian/monitoring. | Nilai variabel sensor pada antarmuka berubah secara dinamis untuk pengujian ambang batas relay. | **Sesuai** |

**Tingkat Keberhasilan Fungsionalitas Aplikasi: 100% Valid (10/10 Skenario Sesuai)**

> **Kesimpulan Pengujian Aplikasi:**
> Berdasarkan hasil pengujian pada Tabel 4.5, seluruh 10 skenario pengujian fungsionalitas aplikasi memperoleh status **Sesuai (100% Valid)**. Dengan demikian, dapat disimpulkan bahwa aplikasi *Smart Garden IoT Monitoring* telah memenuhi spesifikasi fungsional yang diharapkan dan siap digunakan untuk pemantauan serta pengendalian penyiraman tanaman secara otomatis maupun manual.

---

## 5. Kesimpulan Sistem (Bab 5.1)

Berdasarkan hasil implementasi dan pengujian pada sistem penyiraman tanaman otomatis menggunakan **Fuzzy Logic Mamdani** berbasis **IoT**, dapat ditarik kesimpulan sebagai berikut:

* **1. Pembuatan Alat & Akurasi Sensor Soil Moisture:**
  Alat penyiraman otomatis berhasil dibuat dengan memanfaatkan parameter *soil moisture* sebagai input utama. Pengujian sensor *soil moisture* terhadap 10 data percobaan menunjukkan nilai error yang relatif kecil (berkisar **0,0022% – 9,09%**), meskipun ditemukan dua data (data ke-7 dan ke-10) dengan nilai identik akibat *overlap* pada rentang keanggotaan fuzzy, sehingga masih diperlukan optimalisasi lebih lanjut pada penentuan rentang *membership function*.

* **2. Akurasi Penentuan Durasi Penyiraman (Fuzzy Logic Mamdani):**
  Lama waktu penyiraman berhasil ditentukan secara otomatis melalui proses defuzzifikasi metode *centroid* pada logika fuzzy Mamdani. Sebagai contoh, pada nilai soil 36% dihasilkan durasi penyiraman sebesar **9.193,6 ms** dari perhitungan manual dan **9.213,56 ms** dari perhitungan alat, dengan tingkat kesesuaian yang sangat baik pada mayoritas data uji.

* **3. Ketepatan Eksekusi Penjadwalan Otomatis:**
  Sistem mampu menjalankan penyiraman sesuai jadwal yang telah ditentukan, yaitu **pagi pukul 08.45 WIB** dan **sore pukul 16.30 WIB**. Hal ini dibuktikan pada pengujian alat, di mana pompa aktif secara otomatis tepat pada kedua waktu tersebut (data percobaan ke-4 dan ke-9).

---

## 📄 ABSTRAK PENELITIAN / ABSTRACT

### **ABSTRAK (Bahasa Indonesia)**
Penelitian ini bertujuan merancang dan mengimplementasikan sistem penyiraman otomatis berbasis mikrokontroler ESP32 menggunakan metode **Logika Fuzzy Mamdani**. Sistem dirancang untuk melakukan penyiraman tanaman secara otomatis berdasarkan dua parameter utama, yaitu waktu real-time (*Real-Time Clock* / RTC) dan tingkat kelembapan tanah melalui sensor *soil moisture*. Module RTC dimanfaatkan untuk mengeksekusi penjadwalan penyiraman presisi sesuai Waktu Indonesia Barat (WIB), sedangkan data kelembapan tanah diproses menggunakan logika fuzzy Mamdani dengan metode defuzzifikasi *centroid* untuk menentukan durasi aktif pompa air. Selain itu, sensor ultrasonik (HC-SR04) diintegrasikan untuk memantau kapasitas ketinggian air pada toren penampungan (tinggi wadah 17,5 cm) guna memicu otomatisasi pengisian air via *solenoid valve*. Sensor **DHT21** juga diterapkan untuk memantau perubahan suhu udara (24,2°C – 35,8°C) dan kelembapan udara relatif (37% – 78% RH) di lingkungan terbuka pada musim kemarau. Seluruh data sensor dan status aktuator disinkronisasikan ke antarmuka aplikasi berbasis web secara *real-time*. Perangkat lunak mikrokontroler dikembangkan menggunakan Arduino IDE. Pengujian dilakukan sebanyak 10 kali untuk setiap parameter sensor maupun fungsionalitas antarmuka. Hasil pengujian alat dan sensor ultrasonik menunjukkan tingkat keberhasilan sebesar **100%**. Pengujian fungsionalitas aplikasi menggunakan metode *Black Box Testing* juga menghasilkan tingkat keberhasilan **100% Valid (10/10 skenario sesuai)**. Kebaruan (*novelty*) dan pengembangan dari penelitian terdahulu terletak pada penambahan integrasi sensor RTC, DHT21, dan *soil moisture*, perubahan pendekatan metode fuzzy dari Sugeno menjadi Mamdani, serta pengembangan fitur kontrol dan penyiraman otomatis terjadwal berbasis IoT. Penelitian ini diharapkan dapat memberikan kontribusi nyata dalam pengembangan teknologi pertanian presisi (*precision agriculture*) dan perawatan tanaman hias secara efisien dan hemat air.

**Kata Kunci:** *ESP32, Logika Fuzzy Mamdani, IoT, Penyiraman Otomatis, Sensor Soil Moisture, DHT21, Black Box Testing.*

---

### **ABSTRACT (English)**
This research aims to design and implement an ESP32-based automatic plant watering system utilizing the **Mamdani Fuzzy Logic** method. The system is engineered to automatically irrigate plants based on two core parameters: real-time scheduling (*Real-Time Clock* / RTC) and soil moisture levels measured by a capacitive soil sensor. The RTC module executes scheduled watering sessions adjusted to local Western Indonesia Time (WIB), while soil moisture data is computed through Mamdani fuzzy logic using the centroid defuzzification method to accurately determine pump duration. Additionally, an ultrasonic sensor (HC-SR04) is integrated to monitor water tank levels (container height 17.5 cm) to trigger automated tank refilling via a solenoid valve. A **DHT21** sensor is deployed to monitor ambient temperature dynamics (24.2°C – 35.8°C) and relative air humidity (37% – 78% RH) in open-field environments during the dry season. All sensor metrics and actuator statuses are synchronized to a web-based dashboard in real-time. Firmware was developed using the Arduino IDE, and empirical testing was conducted across 10 iterations per sensor parameter and interface feature. Hardware evaluation and ultrasonic detection yielded a **100% success rate**. Application testing via *Black Box Testing* also achieved a **100% Valid success rate (10/10 scenarios passed)**. The novelty and improvement over prior research reside in the added multi-sensor integration (RTC, DHT21, Soil Moisture), the transition from Sugeno to Mamdani fuzzy inference, and the implementation of scheduled IoT-based irrigation control. This research is expected to contribute to precision agriculture and efficient water-saving plant care systems.

**Keywords:** *ESP32, Mamdani Fuzzy Logic, IoT, Automatic Irrigation, Soil Moisture Sensor, DHT21, Black Box Testing.*



