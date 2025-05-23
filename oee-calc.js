import fs, { stat } from "fs";
import getDataFromMongo from "./app/getDataFromMongo.js";
import totalPlannedQuantity from "./app/totalPlannedQuantity.js";
import totalPlannedDuration from "./app/totalPlannedDuration.js";
import totalDefectQuantity from "./app/totalDefectQuantity.js";
const production = JSON.parse(fs.readFileSync("production.json"));

async function run() {
  console.log("Total Planned Quantity: ", totalPlannedQuantity(production));

  console.log(
    `Total Planned Duration: ${parseInt(totalPlannedDuration(production))}`
  );

  console.log(
    `Total Defect Quantity: ${parseInt(totalDefectQuantity(production))}`
  );

  const status = await getDataFromMongo("status_data");
  const statusForOEE = [];
  status.forEach((st) => {
    if (st.status == "RUNNING") {
      statusForOEE.push(st);
    }
  });
  // let performance =
  // (totalPlannedDuration(statusForOEE) / totalPlannedQuantity(statusForOEE))/();
}

run();
