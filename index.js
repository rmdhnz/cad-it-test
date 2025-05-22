const getDataFromMongo = require("./app/getDataFromMongo");
const createEmptyAllocation = require("./app/createEmptyAllocation");
// const assignMonthlyAllocation = require("./app/assignMonthlyAllocation");
const fs = require("fs");
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

async function main() {
  const regions = await getDataFromMongo("regions");
  const teams = await getDataFromMongo("teams");
  const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));
  const teamSizeMap = {};
  teams.forEach((team) => {
    teamSizeMap[team.name] = team.total_member;
  });

  // Function to create fresh allocation

  function assignMonthlyAllocation(month) {
    const allocation = createEmptyAllocation(regions);
    const teamSizeLeft = { ...teamSizeMap };

    // Fixed teams assignment
    rules.fixed_team_in_region.forEach((rule) => {
      const region = allocation[rule.region];
      rule.teams.forEach((teamName) => {
        const size = teamSizeLeft[teamName] || 0;
        region.teams.push(teamName);
        region.used += size;
        delete teamSizeLeft[teamName];
      });
    });

    // Grouped teams
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
            delete teamSizeLeft[team];
          });
          break;
        }
      }
    });

    // Remaining teams
    const remainingTeams = Object.keys(teamSizeLeft);
    remainingTeams.sort(() => Math.random() - 0.5); // Shuffle
    remainingTeams.forEach((team) => {
      const teamSize = teamSizeLeft[team];
      for (const regionName in allocation) {
        const region = allocation[regionName];
        if (region.used + teamSize <= region.quota) {
          region.teams.push(team);
          region.used += teamSize;
          break;
        }
      }
    });

    return allocation;
  }

  // Generate allocations per month and write to JSON file
  const file_allocation = [];
  MONTHS.forEach((month) => {
    const monthlyAllocation = assignMonthlyAllocation(month);
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
    // file_allocation.push(JSON.stringify(result, null, 2));
    file_allocation.push(result);
    console.log(`✅ Allocation saved: allocation_${month}.json`);
  });
  fs.writeFileSync(
    "all_allocation.json",
    JSON.stringify(file_allocation, null, 2)
  );
  console.log(`✅ All Allocation saved: all_alocation.json`);
}

main();
