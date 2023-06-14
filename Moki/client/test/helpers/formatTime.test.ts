import { describe, expect, it } from "vitest";
import { formatDate, formatDuration } from "@/js/helpers/formatTime";

describe("formatDuration", () => {
  const testCases: [number, boolean, string][] = [
    [123456789, true, "2.06M min"],
    [9876543210, true, "164.61M min"],
    [1234567.89, true, "20.58k min"],
    [1234.56, true, "20 min"],
    [1200, false, "20"],
    [121, false, "2"],
    [0.192381, false, "0"],
    [0, false, "0"],
    [0, true, "0 min"],
    [NaN, false, "0"],
    [NaN, true, "0 min"],
  ];

  testCases.forEach(([value, unit, expected]) => {
    it(`should format ${value} as ${expected}`, () => {
      let formattedValue;
      if (!unit) {
        formattedValue = formatDuration(value, unit);
      } else {
        formattedValue = formatDuration(value);
      }
      expect(formattedValue).toBe(expected);
    });
  });
});

describe("formatDate", () => {
  const testCases: [number, string][] = [
    [1686578400011, "12 June, 2023 16:00:00"],
    [0, " 1 January, 1970 02:00:00"],
    [NaN, ""],
  ];

  testCases.forEach(([value, expected]) => {
    it(`should format ${value} as ${expected}`, () => {
      const formattedValue = formatDate(value);
      expect(formattedValue).toBe(expected);
    });
  });
});
