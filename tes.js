import fs from "fs";
import createEmptyAllocation from "./app/utils/createEmptyAllocation.js";
import { exit } from "process";
const teams = JSON.parse(fs.readFileSync("teams.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));

// let grup = ["Ansys", "Country Manager", "HRD", "Ansys", "Sales"];
// grup = new Set(grup); // Menggunakan Set untuk menghapus duplikat
// console.log(grup);
// console.log(typeof grup);
// exit();
const teamSizeMap = {};

teams.forEach((team) => {
  teamSizeMap[team.name] = team.total_member;
});

const allocation = createEmptyAllocation(regions);
console.log("Alokasi awal: ");
console.log(allocation);
// Exit early for testing purposes
const teamSizeLeft = { ...teamSizeMap };
rules.fixed_team_in_region.forEach((rule) => {
  const region = allocation[rule.region];
  rule.teams.forEach((team) => {
    const size = teamSizeLeft[team] || 0;
    region.teams.push(team);
    region.used += size;
    region.quota -= size;
    delete teamSizeLeft[team];
  });
});

console.log("Allocation : ");
console.log(allocation);

console.log(`Sisa tim yang belum dialokasikan: `);
console.log(teamSizeLeft);

// lanjut ke proses grouping
console.log("Lanjut ke proses Grouping");

const groupedTeams = rules.team_need_work_together.map((group) => group.teams);
console.log("Group yang harus bekerja sama:");
console.log(groupedTeams);
console.log("Team Size Left:");
console.log(teamSizeLeft);
groupedTeams.forEach((group) => {
  const groupSize = group.reduce(
    (sum, team) => sum + (teamSizeLeft[team] || 0),
    0
  );
  // console.log(groupSize);
  const shuffledRegions = [...Object.keys(allocation)].sort(
    () => Math.random() - 0.5
  );
  for (const regionName of shuffledRegions) {
    const region = allocation[regionName];
    if (region.used + groupSize <= region.quota) {
      group.forEach((team) => {
        region.teams.push(team);
        region.used += teamSizeLeft[team] || 0;
        region.quota -= teamSizeLeft[team] || 0;
        delete teamSizeLeft[team];
      });
      break;
    }
  }
});

console.log("Allocation setelah grouping:");
console.log(allocation);

console.log("Tim yangg belum dialokasikan:");
console.log(teamSizeLeft);

const remainingTeams = Object.keys(teamSizeLeft);

remainingTeams.sort(() => Math.random() - 0.5); // Shuffle
remainingTeams.forEach((team) => {
  const teamSize = teamSizeLeft[team];
  for (const regionName in allocation) {
    const region = allocation[regionName];
    if (region.used + teamSize <= region.quota) {
      region.teams.push(team);
      region.used += teamSize;
      region.quota -= teamSize;
      delete teamSizeLeft[team];
    }
  }
});
console.log("Alokasi Akhir: ");
console.log(allocation);
console.log("Tim yang belum dialokasikan:");
console.log(teamSizeLeft);
