const fs = require("fs");
const allocations = JSON.parse(fs.readFileSync("all_allocation.json"));
const regions = JSON.parse(fs.readFileSync("regions.json"));
const rules = JSON.parse(fs.readFileSync("rules_region_and_team.json"));

// cek fixed timm tiap region

const checkFixedTeamEachRegion = {};
rules.fixed_team_in_region.forEach((region) => {
  checkFixedTeamEachRegion[region.region] = false;
  // console.log(region);
});

// console.log(checkFixedTeamEachRegion);

let i = 0;
allocations.forEach((allocation) => {
  i++;
  for (let region in allocation) {
    const teams = allocation[region].teams;
    const used = allocation[region].used;
    const quota = allocation[region].quota;

    // cek fixed team
    rules.fixed_team_in_region.forEach((rule) => {
      if (region === rule.region) {
        rule.teams.forEach((teamName) => {
          if (teams.includes(teamName)) {
            checkFixedTeamEachRegion[region] = true;
          }
        });
      }
    });

    // cek total tim
    if (teams.length > quota) {
      console.log("Tim lebih dari quota");
      console.log("Bulan ke " + (i + 1));
      console.log("Region " + region);
      console.log("Tim " + teams);
      console.log("Quota " + quota);
      console.log("Total Tim " + teams.length);
    }

    // cek total member
    if (used > quota) {
      console.log("Total member lebih dari quota");
      console.log("Bulan ke " + (i + 1));
      console.log("Region " + region);
      console.log("Tim " + teams);
      console.log("Quota " + quota);
      console.log("Total Member " + used);
    }
  }
  if (Object.values(checkFixedTeamEachRegion).every((val) => val === true)) {
    console.log("Bulan ke " + i + " (Terpenuhi)");
  }
  // console.log(checkFixedTeamEachRegion);
  console.table(allocation);
});

//  cek team_need_work_together

const checkTeamNeedWorkTogether = {};
console.log(rules.team_need_work_together);
return;
rules.team_need_work_together.forEach((group) => {
  // checkTeamNeedWorkTogether[group.group_name] = false;
  console.log(group);
});
// console.log(checkTeamNeedWorkTogether);
