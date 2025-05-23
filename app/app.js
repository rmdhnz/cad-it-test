import getDataFromMongo from "./utils/getDataFromMongo.js";
import assignMonthlyAllocation from "./assignMonthlyAllocation.js";
import fs from "fs";
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

export default async function app() {
  const regions = await getDataFromMongo("regions");
  const teams = await getDataFromMongo("teams");
  const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));
  const teamSizeMap = {};
  teams.forEach((team) => {
    teamSizeMap[team.name] = team.total_member;
  });

  // Generate allocations per month and write to JSON file
  const file_allocation = [];
  MONTHS.forEach((month) => {
    const monthlyAllocation = assignMonthlyAllocation(
      month,
      regions,
      rules,
      teamSizeMap
    );
    const result = {};
    for (const region in monthlyAllocation) {
      result[region] = {
        teams: monthlyAllocation[region].teams,
        remaining_quota:
          monthlyAllocation[region].quota - monthlyAllocation[region].used,
      };
    }
    fs.writeFileSync(
      `allocation/allocation_${month}.json`,
      JSON.stringify(result, null, 2)
    );
    file_allocation.push(result);
    console.log(`✅ Allocation saved: allocation_${month}.json`);
  });
  fs.writeFileSync(
    "all_allocation.json",
    JSON.stringify(file_allocation, null, 2)
  );
  console.log(`✅ All Allocation saved: all_alocation.json`);
}
