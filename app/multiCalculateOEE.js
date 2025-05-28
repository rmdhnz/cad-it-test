import { DateTime, Interval } from "luxon";
import parseTime from "./utils/parseTime.js";
import avgOfEquipmentMap from "./utils/avgOfEquipmentMap.js";
import splitStatusAcrossMidnight from "./utils/splitStatusAcrossMidnight.js";
import totalActualQuantity from "./utils/totalActualQuantity.js";
import totalDefectQuantity from "./utils/totalDefectQuantity.js";
import totalPlannedQuantity from "./utils/totalPlannedQuantity.js";
export default function multiCalculateOEE(status, production) {
  status = splitStatusAcrossMidnight(status);

  const prodMap = {};

  for (const p of production) {
    const eid = p.equipment_id;
    const date = parseTime(p.start_production).toISODate();
    if (!prodMap[eid]) prodMap[eid] = {};
    if (!prodMap[eid][date]) prodMap[eid][date] = [];
    prodMap[eid][date].push(p);
  }

  const result = [];
  const availabilitySummary = {};
  const performanceSummary = {};
  const qualitySummary = {};

  for (const eid in prodMap) {
    availabilitySummary[eid] = [];
    performanceSummary[eid] = [];
    qualitySummary[eid] = [];

    for (const date in prodMap[eid]) {
      const dayInterval = Interval.fromDateTimes(
        DateTime.fromISO(date).startOf("day"),
        DateTime.fromISO(date).endOf("day")
      );

      const prodList = prodMap[eid][date];
      let plannedQty = totalPlannedQuantity(prodList),
        actualQty = totalActualQuantity(prodList),
        defectQty = totalDefectQuantity(prodList);

      let running = 0,
        idle = 0,
        down = 0;

      for (const s of status) {
        if (s.equipment_id != eid) continue;
        const sStart = parseTime(s.start_time);
        const sEnd = parseTime(s.end_time);
        const sInterval = Interval.fromDateTimes(sStart, sEnd);
        const overlap = sInterval.intersection(dayInterval);
        if (!overlap) continue;

        const duration = overlap.toDuration().as("seconds");
        if (s.status === "RUNNING") running += duration;
        else if (s.status === "IDLE") idle += duration;
        else if (s.status === "DOWN") down += duration;
      }

      const totalTime = running + idle + down;
      const availability = totalTime > 0 ? (running + idle) / totalTime : 0;
      const performance =
        plannedQty > 0 && actualQty > 0
          ? Math.min(actualQty / plannedQty, 1)
          : 0;
      const quality = actualQty > 0 ? (actualQty - defectQty) / actualQty : 0;
      const oee = availability * performance * quality;

      availabilitySummary[eid].push(availability);
      performanceSummary[eid].push(performance);
      qualitySummary[eid].push(quality);

      result.push({
        equipment_id: eid,
        date,
        availability: availability.toFixed(4),
        performance: performance.toFixed(4),
        quality: quality.toFixed(4),
        oee: oee.toFixed(4),
      });
    }
  }

  const totalAvgAvailability =
    avgOfEquipmentMap(availabilitySummary).toFixed(4);
  const totalAvgPerformance = avgOfEquipmentMap(performanceSummary).toFixed(4);
  const totalAvgQuality = avgOfEquipmentMap(qualitySummary).toFixed(4);

  return {
    result,
    totalAvgAvailability,
    totalAvgPerformance,
    totalAvgQuality,
  };
}
