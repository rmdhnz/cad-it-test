// const fs = require("fs");
import fs from "fs";
const allocations = JSON.parse(fs.readFileSync("all_allocation.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));

let total_remaining = [];

allocations.forEach((allocation) => {
  let total = 0;
  regions.forEach((region) => {
    total += allocation[region.name].remaining_quota;
  });
  total_remaining.push(total);
  console.table(allocation);
});

console.log(total_remaining);
