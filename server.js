const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware biar bisa parsing JSON body (kalau perlu POST/PUT)
app.use(express.json());

// Endpoint GET: Ambil semua data dari allocation.json
app.get("/allocations", (req, res) => {
  fs.readFile("./all_allocation.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Gagal membaca file " });
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
  console.log(`✅ Endpoint: http://localhost:${PORT}/allocations`);
  console.log(`✅ Cek di Postman atau browser`);
});
