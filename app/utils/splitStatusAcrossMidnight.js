// Membagi status yang melewati tengah malam menjadi dua periode
import parseTime from "./parseTime.js";

export default function splitStatusAcrossMidnight(status) {
  const splitStatuses = [];

  for (const s of status) {
    const start = parseTime(s.start_time);
    const end = parseTime(s.end_time);

    if (start.toISODate() === end.toISODate()) {
      splitStatuses.push(s);
    } else {
      let currentStart = start;
      while (currentStart < end) {
        const endOfDay = currentStart.endOf("day");
        const currentEnd = end < endOfDay ? end : endOfDay;

        splitStatuses.push({
          equipment_id: s.equipment_id,
          start_time: currentStart.toFormat("yyyy/M/d HH:mm:ss"),
          end_time: currentEnd.toFormat("yyyy/M/d HH:mm:ss"),
          status: s.status,
        });

        currentStart = currentEnd.plus({ seconds: 1 });
      }
    }
  }

  return splitStatuses;
}
