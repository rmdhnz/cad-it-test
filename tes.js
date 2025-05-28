import fs from "fs";
const teams = JSON.parse(fs.readFileSync("teams.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));
import assignMonthlyAllocation from "./app/assignMonthlyAllocation.js";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const teamSizeMap = {};
teams.forEach((team) => {
  teamSizeMap[team.name] = team.total_member;
});
let full_allocation = [];
let lastMonthAllocation = null;
MONTHS.forEach((month) => {
  let monthlyAllocation;
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    try {
      monthlyAllocation = assignMonthlyAllocation(
        month,
        regions,
        rules,
        teamSizeMap
      );
      break;
    } catch (e) {
      attempts++;
      if (attempts === maxAttempts) throw e;
    }
  }

  lastMonthAllocation = monthlyAllocation;
  const result = {};
  for (const region in monthlyAllocation) {
    result[region] = {
      teams: monthlyAllocation[region].teams,
      remaining_quota:
        monthlyAllocation[region].quota - monthlyAllocation[region].used,
    };
  }
  fs.writeFileSync(
    `rev-allocation/allocation_${month}.json`,
    JSON.stringify(result, null, 2)
  );
  full_allocation.push(result);
  console.log(`✅ Allocation saved: allocation_${month}.json`);
});

fs.writeFileSync(
  "rev-all_allocation.json",
  JSON.stringify(full_allocation, null, 2)
);
console.log(`✅ All Allocation saved: all_allocation.json`);
