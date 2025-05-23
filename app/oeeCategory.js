export default function oeeCategory(oee) {
  if (oee > 0.85) return "Excellent";
  else if (oee > 0.75) return "Recommended";
  else if (oee > 0.6) return "Good";
  else if (oee > 0.5) return "Minimum";
  else return "Bad";
}
