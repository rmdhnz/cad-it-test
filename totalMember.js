export default function totalMembers(teamNames) {
  return teamNames.reduce((sum, t) => sum + (teamMap[t] || 0), 0);
}
