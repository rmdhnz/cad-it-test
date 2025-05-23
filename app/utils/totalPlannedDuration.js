export default function totalPlannedDuration(collections) {
  let planned_duration = 0;
  collections.forEach((collection) => {
    planned_duration += collection.planned_duration_in_second;
  });
  return planned_duration;
}
