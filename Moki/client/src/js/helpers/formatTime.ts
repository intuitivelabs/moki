import { timeFormat } from "d3";
import { formatValueISO } from "./formatValue";

function formatDuration(duration: number, unit = true) {
  const secDuration = Math.floor(duration);
  const minutes = Math.floor(secDuration / 60);
  if (isNaN(minutes)) return `0${unit ? " min" : ""}`;
  const formattedMin = formatValueISO(minutes);
  if (!unit) return formattedMin;
  return `${formattedMin} min`;
}

function formatDate(timestamp: number) {
  if (isNaN(timestamp)) return "";
  return timeFormat("%e %B, %Y %H:%M:%S")(new Date(timestamp));
}

export { formatDate, formatDuration };
