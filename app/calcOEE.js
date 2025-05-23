import parseTime from "./parseTime.js";
import calculateOEEPerDay from "./calculateOEEPerDay.js";
import fs from "fs";
import getDataFromMongo from "./getDataFromMongo.js";
import multiCalculateOEE from "./multiCalculateOEE.js";

export default async function run(multiple = false) {
  const status = await getDataFromMongo("status_data");
  const production = await getDataFromMongo("production");
  if (multiple) {
    const result = multiCalculateOEE(status, production);
    console.table(result);
  } else {
    // Group produksi berdasarkan tanggal
    const productionByDate = {};
    for (const p of production) {
      const date = parseTime(p.start_production).toISODate();
      if (!productionByDate[date]) productionByDate[date] = [];
      productionByDate[date].push(p);
    }

    // Hitung OEE untuk setiap tanggal
    const results = [];
    for (const date in productionByDate) {
      results.push(calculateOEEPerDay(date, productionByDate[date], status));
    }

    // Tampilkan hasil
    console.table(results);
    fs.writeFileSync("oee_results.json", JSON.stringify(results, null, 2));
    console.log("✅ OEE results saved to oee_results.json");
  }
}
