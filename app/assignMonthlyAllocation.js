const createEmptyAllocation = require("./app/createEmptyAllocation");
function assignMonthlyAllocation(month, regions, rules) {
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

module.exports = assignMonthlyAllocation;
