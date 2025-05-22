const fs = require("fs");

const teams = JSON.parse(fs.readFileSync("teams.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));

const teamMap = Object.fromEntries(teams.map((t) => [t.name, t.total_member]));
const regionMap = Object.fromEntries(regions.map((r) => [r.name, r.quota]));

// Rules
const fixedAssignments = new Map(); // region -> [teams]
for (const { region, teams } of rules.fixed_team_in_region) {
  fixedAssignments.set(region, teams);
}

const togetherGroups = rules.team_need_work_together.map(
  (group) => group.teams
);
// Hitung total anggota dalam satu grup tim
function totalMembers(teamNames) {
  return teamNames.reduce((sum, t) => sum + (teamMap[t] || 0), 0);
}

// Buat semua kombinasi penempatan region, per bulan
function generateMonthlyAssignment(teamsLeft, regionQuotas, monthHistory = []) {
  // Base case: jika semua tim sudah dialokasikan
  if (teamsLeft.length === 0) return [];

  let result = [];

  for (const [region, quota] of Object.entries(regionQuotas)) {
    const fixed = fixedAssignments.get(region) || [];

    // Skip jika tim tetap tidak cukup quota
    if (totalMembers(fixed) > quota) continue;

    let assigned = [...fixed];
    let remainingQuota = quota - totalMembers(fixed);
    let remainingTeams = teamsLeft.filter((t) => !assigned.includes(t));

    // Pilih grup bersama
    for (const group of togetherGroups) {
      if (group.every((t) => remainingTeams.includes(t))) {
        const groupSize = totalMembers(group);
        if (groupSize <= remainingQuota) {
          assigned.push(...group);
          remainingQuota -= groupSize;
          remainingTeams = remainingTeams.filter((t) => !group.includes(t));
        }
      }
    }

    // Assign tim tersisa selama masih ada quota
    for (const t of [...remainingTeams]) {
      const size = teamMap[t];
      if (size <= remainingQuota) {
        assigned.push(t);
        remainingQuota -= size;
        remainingTeams = remainingTeams.filter((tm) => tm !== t);
      }
    }

    const current = { region, assigned };

    const restAssignment = generateMonthlyAssignment(
      remainingTeams,
      { ...regionQuotas, [region]: 0 },
      monthHistory.concat([current])
    );

    if (restAssignment) {
      return [current, ...restAssignment];
    }
  }

  return null;
}

let allTeams = teams.map((t) => t.name);
let regionQuotas = Object.fromEntries(regions.map((r) => [r.name, r.quota]));

let allMonths = [];
let prevRegionAssignments = new Set();

for (let month = 1; month <= 12; month++) {
  let monthAssignment = generateMonthlyAssignment([...allTeams], {
    ...regionQuotas,
  });

  // Validasi tidak duplikat dari bulan sebelumnya
  const hash = monthAssignment
    .map((x) => `${x.region}:${x.assigned.sort().join(",")}`)
    .join("|");
  if (prevRegionAssignments.has(hash)) {
    console.log(`❌ Gagal membuat penjadwalan unik di bulan ${month}`);
    break;
  }

  prevRegionAssignments.add(hash);
  allMonths.push({
    month,
    regions: Object.fromEntries(
      monthAssignment.map((x) => [x.region, { teams: x.assigned }])
    ),
  });
}

fs.writeFileSync("monthly_schedule.json", JSON.stringify(allMonths, null, 2));
