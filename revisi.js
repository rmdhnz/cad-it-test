import fs from "fs";
import createEmptyAllocation from "./app/utils/createEmptyAllocation.js";
import { exit } from "process";
const teams = JSON.parse(fs.readFileSync("teams.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));

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
function assignMonthlyAllocation(month, previousAllocation = null) {
  const allocation = createEmptyAllocation(regions);
  const teamSizeLeft = { ...teamSizeMap };

  rules.fixed_team_in_region.forEach((rule) => {
    const region = allocation[rule.region];
    rule.teams.forEach((teamName) => {
      const size = teamSizeLeft[teamName] || 0;
      region.teams.push(teamName);
      region.used += size;
      region.remaining_quota -= size;
      delete teamSizeLeft[teamName];
    });
  });

  const groupedTeams = rules.team_need_work_together.map(
    (group) => group.teams
  );
  groupedTeams.forEach((group) => {
    const groupSize = group.reduce(
      (sum, team) => sum + (teamSizeLeft[team] || 0),
      0
    );
    const shuffledRegions = [...Object.keys(allocation)].sort(
      () => Math.random() - 0.5
    );
    for (const regionName of shuffledRegions) {
      const region = allocation[regionName];
      if (region.used + groupSize <= region.quota) {
        group.forEach((team) => {
          region.teams.push(team);
          region.used += teamSizeLeft[team] || 0;
          region.remaining_quota -= teamSizeLeft[team] || 0;
          delete teamSizeLeft[team];
        });
        break;
      }
    }
  });

  const remainingTeams = Object.keys(teamSizeLeft);
  remainingTeams.sort(() => Math.random() - 0.5);
  remainingTeams.forEach((team) => {
    const teamSize = teamSizeLeft[team];
    for (const regionName in allocation) {
      const region = allocation[regionName];
      if (region.used + teamSize <= region.quota) {
        region.teams.push(team);
        region.used += teamSize;
        delete teamSizeLeft[team];
        break;
      }
    }
  });

  // Check all teams are allocated
  if (Object.keys(teamSizeLeft).length > 0) {
    throw new Error(
      `❌ Tidak semua tim teralokasi pada bulan ${month}: ${Object.keys(
        teamSizeLeft
      ).join(", ")}`
    );
  }

  // Check remaining quota constraint
  for (const regionName in allocation) {
    const region = allocation[regionName];
    const remaining = region.quota - region.used;
    if (remaining > 2) {
      throw new Error(
        `❌ Remaining quota lebih dari 2 di region ${regionName} untuk bulan ${month}`
      );
    }
  }

  // If previous allocation exists, check for same combinations
  if (previousAllocation) {
    for (const region in allocation) {
      const currentTeams = [...allocation[region].teams].sort().join(",");
      const previousTeams = previousAllocation[region]
        ? [...previousAllocation[region].teams].sort().join(",")
        : "";
      if (currentTeams === previousTeams) {
        throw new Error(
          `❌ Kombinasi tim di region ${region} sama dengan bulan sebelumnya (${month})`
        );
      }
    }
  }

  return allocation;
}
let full_allocation = [];
let lastMonthAllocation = null;
MONTHS.forEach((month) => {
  let monthlyAllocation;
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    try {
      monthlyAllocation = assignMonthlyAllocation(month, lastMonthAllocation);
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
