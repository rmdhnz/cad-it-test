export default // Buat semua kombinasi penempatan region, per bulan
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
