// Fungsi bantu untuk parsing waktu custom format
import { DateTime } from "luxon";
export default function parseTime(str) {
  return DateTime.fromFormat(str.trim(), "yyyy/M/d HH:mm:ss");
}
