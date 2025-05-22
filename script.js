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

const teams = JSON.parse(fs.readFileSync("teams.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));
const teamSizeMap = {};
teams.forEach((team) => {
  teamSizeMap[team.name] = team.total_member;
});

// console.log(teamSizeMap);

//  -- next --

// Inisialisasi alokasi
const allocation = {};
regions.forEach((region) => {
  allocation[region.name] = {
    quota: region.quota,
    teams: [],
    used: 0,
  };
});
// console.log(allocation);

// -- next --

// Pasangkan tim tetap langsung ke regionnya
console.log(rules.fixed_team_in_region);
rules.fixed_team_in_region.forEach((rule) => {
  const regionName = rule.region;
  rule.teams.forEach((teamName) => {
    const teamSize = teamSizeMap[teamName];
    allocation[regionName].teams.push(teamName);
    allocation[regionName].used += teamSize;
    delete teamSizeMap[teamName]; // Remove dari list tim yang belum dialokasikan
  });
});

// Gabungkan tim yang harus kerja bersama menjadi grup
const groupedTeams = [];
rules.team_need_work_together.forEach((group) => {
  groupedTeams.push(group.teams);
  group.teams.forEach((teamName) => delete teamSizeMap[teamName]);
});

// Buat daftar tim tersisa (yang tidak grouped dan tidak fixed)
const unallocatedTeams = Object.keys(teamSizeMap);

// Gabungkan semua grup dan tim individual
const allGroups = groupedTeams.concat(unallocatedTeams.map((t) => [t]));

// Fungsi untuk cari alokasi mungkin
function assignGroupsToRegions(groups, allocation) {
  const result = JSON.parse(JSON.stringify(allocation)); // deep copy
  for (const group of groups) {
    const groupSize = group.reduce(
      (sum, team) => sum + (teamSizeMap[team] || 0),
      0
    );
    let assigned = false;

    for (const regionName in result) {
      const region = result[regionName];
      if (region.used + groupSize <= region.quota) {
        region.teams.push(...group);
        region.used += groupSize;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      console.log(
        `⚠️ Group [${group.join(
          ", "
        )}] tidak dapat dialokasikan (melebihi kuota region).`
      );
    }
  }
  return result;
}

const finalAllocation = assignGroupsToRegions(allGroups, allocation);

console.log("🗺️ Alokasi Tim per Region:");
for (const region in finalAllocation) {
  console.log(
    `\n📍 ${region} (Total: ${finalAllocation[region].used}/${finalAllocation[region].quota})`
  );
  console.log(`Teams: ${finalAllocation[region].teams.join(", ")}`);
}
