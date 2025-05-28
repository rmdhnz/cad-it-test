import express from "express";
import fs from "fs";
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/allocations", (req, res) => {
  fs.readFile("./all_allocation.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.get("/oee", (req, res) => {
  fs.readFile("./rev-oee_results.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.get("/multiple-oee", (req, res) => {
  fs.readFile("./rev-oee_results.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
  console.log(`✅ Endpoint Nomor 2: http://localhost:${PORT}/allocations`);
  console.log(`✅ Endpoint Nomor 3: http://localhost:${PORT}/oee`);
  console.log(
    `✅ Endpoint Nomor 3 (Multiple): http://localhost:${PORT}/multiple-oee`
  );
  console.log(`✅ Cek di Postman atau browser`);
});
