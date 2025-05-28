import fs from "fs";
import multiCalculateOEE from "./multiCalculateOEE.js";
import oeeCategory from "./utils/oeeCategory.js";
const status = JSON.parse(fs.readFileSync("status.json"));
const production = JSON.parse(fs.readFileSync("production.json"));

export default function run() {
  const { result, totalAvgAvailability, totalAvgPerformance, totalAvgQuality } =
    multiCalculateOEE(status, production);

  console.table(result);

  console.log("\n📈 Rata-Rata Total:");
  console.log("Availability:", totalAvgAvailability);
  console.log("Performance :", totalAvgPerformance);
  console.log("Quality     :", totalAvgQuality);
  let oee = totalAvgAvailability * totalAvgQuality * totalAvgPerformance;
  console.log("OEE Gabungan : " + oee);
  console.log("Klasifikasi OEE: " + oeeCategory(oee));
  fs.writeFileSync("oee_results.json", JSON.stringify(result, null, 2));
}
