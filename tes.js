// fetch("https://dummyjson.com/user/login", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     username: "emilys",
//     password: "emilyspass",
//     expiresInMins: 30, // optional, defaults to 60
//   }),
// })
//   .then((res) => res.json())
//   .then(console.log);

// $.ajax({
//   url: "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers",
//   success: (mv) => console.log(mv),
// });

// fetch("http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers")
//   .then((res) => res.json())
//   .then((mv) => console.log(mv.Search));

// const xhr = new XMLHttpRequest();
// xhr.onreadystatechange = function () {
//   if (xhr.status === 200) {
//     if (xhr.readyState === 4) {
//       console.log(JSON.parse(xhr.responseText));
//     }
//   } else {
//     console.log(xhr.responseText.Search);
//     return xhr.responseText.Search;
//   }
// };

// xhr.open("GET", "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers");
// xhr.send();

// $.ajax({
//   url: "http://www.omdbapi.com/?apikey=2c1ddfdf&s=avengers",
//   success: (res) => {
//     console.log(res.Search);
//   },
//   err,
// });

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
console.log(regions);
return;

// Convert team list to map
const teamSizeMap = {};
teams.forEach((team) => {
  teamSizeMap[team.name] = team.total_member;
});

// Function to create fresh allocation
function createEmptyAllocation() {
  const allocation = {};
  regions.forEach((region) => {
    allocation[region.name] = {
      quota: region.quota,
      teams: [],
      used: 0,
    };
  });
  return allocation;
}

function assignMonthlyAllocation(month) {
  const allocation = createEmptyAllocation();
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

// Generate allocations per month and write to JSON files
MONTHS.forEach((month) => {
  const monthlyAllocation = assignMonthlyAllocation(month);
  const result = {};
  for (const region in monthlyAllocation) {
    result[region] = monthlyAllocation[region].teams;
  }
  fs.writeFileSync(`allocation_${month}.json`, JSON.stringify(result, null, 2));
  console.log(`✅ Allocation saved: allocation_${month}.json`);
});
