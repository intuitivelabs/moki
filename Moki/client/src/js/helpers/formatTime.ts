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

function formatSmallDuration(duration: number) {
  if (duration < 1000) return `+ ${Math.round(duration)}ms`;
  else return `+ ${Math.round(duration / 1000)}s`;
}

function formatDate(timestamp: number, millisecond = false) {
  if (isNaN(timestamp)) return "";
  if (millisecond) {
    return timeFormat("%e %B, %Y %H:%M:%S.%L")(new Date(timestamp));
  }
  return timeFormat("%e %B, %Y %H:%M:%S")(new Date(timestamp));
}

export { formatDate, formatDuration, formatSmallDuration };
