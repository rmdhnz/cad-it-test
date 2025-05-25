# CAD-IT-TEST

## Cloning

Siapkan satu folder untuk tempat cloning repository dan pastikan terminal kita berada di folder tersebut

```shell
    > git clone https://github.com/rmdhnz/cad-it-test.git
```

## 🧠 Struktur Folder

```
allocation/
app/
├──utils/
  ├ createEmptyAllocation.js
  ├ getDataFromMongo.js
  ├ oeeCategory.js
  ├ parseTime.js
  ├ totalActualQuantity.js
  ├ totalDefectQuantity.js
  ├ totalPLannedDuration.js
  ├ totaPlannedQuantity.js
├── app.js
├── assignMonthlyAllocation.js
├── calcOEE.js
├── multiCalculateOEE.js

─.gitignore
─all_allocation.json
─index.js
─manual_status.json
─multiple_oee_results.json
─oee_results.json
─package-lock.json
─package.json
─production.json
─quality_control.json
─README.md
─regions.json
─server.js
─status.json
─teams.json
```

Didalam folder `utils` berisi kumpulan fungsi helper yang dirancang untuk menyederhanakan dan mempercepat proses pengembangan program.

## ⚙️ Cara Menjalankan

1. Pastikan Node.js sudah terinstal
2. Setelah dilakukan cloning repository, masuk ke cloningan tersebut
3. Jalankan

   ```shell
   npm install
   ```

4. Pada file index.js, silahkan uncomment salah satu fungsi berikut

   ```shell
   import app from "./app/app.js"; // Nomor 2
   import run from "./app/calcOEE.js"; //Nomor 3

   // run one of them
   // app(); // Nomor 2
   // run(); // Nomor 3
   ```

   jika fungsi `app` yang dijalankan/uncomment, maka akan melakukan fungsi alokasi tim sesuai soal nomor 2, tetapi jika `run` maka akan melakukan perhitungan OEE

5. Pada terminal, jalankan

   ```shell
   npm run start
   ```

6. Untuk melihat hasil di REST API Endpoint, jalankan
   ```shell
   npm run serve
   ```

## 📦 Team Allocation

Program ini digunakan untuk melakukan alokasi otomatis tim ke region setiap bulannya, berdasarkan kapasitas region dan aturan kerja sama antar tim.

### Fitur

✅ Alokasi otomatis tim berdasarkan kuota region.

✅ Penempatan tim tetap di region tertentu (fixed team rules).

✅ Penempatan grup tim yang harus selalu bekerja bersama (grouped teams).

✅ Output alokasi disimpan sebagai file JSON per bulan.

✅ Mencatat sisa kuota di tiap region setelah alokasi.

### Algoritma

Berikut penjelasan algoritma yang digunakan

1. Loading data
   ```shell
    const regions = await getDataFromMongo("regions")
    const teams = await getDataFromMongo("teams")
    const rules = await getDataFromMongo("rules_region_and_team.json")
   ```

## OEE Calculation

Program ini menghitung Overall Equipment Effectiveness (OEE) berdasarkan data status mesin dan data produksi. Perhitungan dilakukan untuk setiap peralatan (equipment) dan setiap hari (multi-day)

$$
OEE = Availability * Performance * Quality
$$

$$
A =\frac{(∑Running + ∑IDLE)}{(∑Time)}
$$

$$
P = \frac{Ideal Cycle Time}{Actual Cycle Time}
$$

$$
Q = \frac{∑Actual Quantity - ∑Total Defect Quantity}{∑Actual Quantity}
$$
