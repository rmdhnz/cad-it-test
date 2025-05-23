import fs from "fs";
import getDataFromMongo from "./app/getDataFromMongo.js";
import multiCalculateOEE from "./app/multiCalculateOEE.js";

export default async function run() {
  const status = await getDataFromMongo("status_data");
  const production = await getDataFromMongo("production");

  const result = multiCalculateOEE(status, production);

  console.table(result);
}

run();
