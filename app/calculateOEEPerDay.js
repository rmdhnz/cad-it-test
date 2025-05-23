import { DateTime, Interval } from "luxon";
import parseTime from "./parseTime.js";

export default function calculateOEEPerDay(date, productions, status) {
  const startDay = DateTime.fromISO(date).startOf("day");
  const endDay = DateTime.fromISO(date).endOf("day");
  const dayInterval = Interval.fromDateTimes(startDay, endDay);

  let running = 0,
    idle = 0,
    down = 0;
  let totalPlanned = 0,
    totalActual = 0,
    totalDefect = 0;
  let totalPlannedTime = 0;

  // Hitung komponen Quality dan Performance dari produksi
  for (const p of productions) {
    const start = parseTime(p.start_production);
    const end = parseTime(p.finish_production);

    totalPlannedTime += p.planned_duration_in_second;
    totalPlanned += p.planned_quantity;
    totalActual += p.actual_quantity;
    totalDefect += p.defect_quantity;
  }

  // Filter status yang terjadi pada tanggal itu dan overlap dengan produksi
  const relevantStatuses = status.filter((s) => {
    const start = parseTime(s.start_time);
    const end = parseTime(s.end_time);
    const interval = Interval.fromDateTimes(start, end);
    return interval.overlaps(dayInterval);
  });

  // Hitung total waktu status dalam hari itu
  for (const s of relevantStatuses) {
    const start = parseTime(s.start_time);
    const end = parseTime(s.end_time);
    const interval = Interval.fromDateTimes(start, end);
    const overlap = interval.intersection(dayInterval);
    if (!overlap) continue;

    const dur = overlap.toDuration().as("seconds");
    if (s.status === "RUNNING") running += dur;
    else if (s.status === "IDLE") idle += dur;
    else if (s.status === "DOWN") down += dur;
    // OFFLINE tidak dihitung
  }

  const totalTime = running + idle + down;
  const availability = totalTime > 0 ? (running + idle) / totalTime : 0;
  const performance =
    totalActual > 0 && totalPlanned > 0
      ? Math.min(totalActual / totalPlanned, 1)
      : 0;
  const quality =
    totalActual > 0 ? (totalActual - totalDefect) / totalActual : 0;
  const oee = availability * performance * quality;

  return {
    date,
    availability: availability.toFixed(4),
    performance: performance.toFixed(4),
    quality: quality.toFixed(4),
    oee: oee.toFixed(4),
  };
}
