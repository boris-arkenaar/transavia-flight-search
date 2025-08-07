import {
  formatDateForInput,
  parseDateFromInput,
  formatFlightTime,
  formatFlightDate,
  isDateInAvailableRange,
  getMinSelectableDate,
  getMaxSelectableDate,
} from "@/utils/date-utils";

describe("Date Utilities", () => {
  describe("formatDateForInput", () => {
    it("formats date correctly for HTML input", () => {
      const date = new Date("2022-11-15T10:30:00.000Z");
      const result = formatDateForInput(date);

      expect(result).toBe("2022-11-15");
    });

    it("pads single digit months and days with zeros", () => {
      const date = new Date("2022-01-05T10:30:00.000Z");
      const result = formatDateForInput(date);

      expect(result).toBe("2022-01-05");
    });

    it("handles end of year dates", () => {
      const date = new Date("2022-12-31T23:59:59.000Z");
      const result = formatDateForInput(date);

      expect(result).toBe("2022-12-31");
    });

    it("handles beginning of year dates", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      const result = formatDateForInput(date);

      expect(result).toBe("2023-01-01");
    });
  });

  describe("parseDateFromInput", () => {
    it("parses HTML date input format correctly", () => {
      const result = parseDateFromInput("2022-11-15");

      expect(result.getUTCFullYear()).toBe(2022);
      expect(result.getUTCMonth()).toBe(10); // November is month 10 (0-indexed)
      expect(result.getUTCDate()).toBe(15);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
    });

    it("sets time to start of day", () => {
      const result = parseDateFromInput("2022-11-15");

      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it("is compatible with formatDateForInput", () => {
      const originalDate = new Date("2022-11-15T14:30:00.000Z");
      const formatted = formatDateForInput(originalDate);
      const parsed = parseDateFromInput(formatted);

      expect(parsed.getUTCFullYear()).toBe(originalDate.getUTCFullYear());
      expect(parsed.getUTCMonth()).toBe(originalDate.getUTCMonth());
      expect(parsed.getUTCDate()).toBe(originalDate.getUTCDate());
    });
  });

  describe("formatFlightTime", () => {
    it("formats flight time in 24-hour format", () => {
      const result = formatFlightTime("2022-11-10T06:25:00");

      expect(result).toBe("06:25");
    });

    it("handles afternoon times correctly", () => {
      const result = formatFlightTime("2022-11-10T14:30:00");

      expect(result).toBe("14:30");
    });

    it("handles midnight correctly", () => {
      const result = formatFlightTime("2022-11-10T00:00:00");

      expect(result).toBe("00:00");
    });

    it("handles near midnight correctly", () => {
      const result = formatFlightTime("2022-11-10T23:59:00");

      expect(result).toBe("23:59");
    });

    it("pads single digit hours and minutes", () => {
      const result = formatFlightTime("2022-11-10T09:05:00");

      expect(result).toBe("09:05");
    });
  });

  describe("formatFlightDate", () => {
    it("formats flight date in readable format", () => {
      const result = formatFlightDate("2022-11-10T06:25:00");

      expect(result).toBe("November 10, 2022");
    });

    it("handles different months correctly", () => {
      const result = formatFlightDate("2022-12-01T10:00:00");

      expect(result).toBe("December 1, 2022");
    });

    it("handles single digit days", () => {
      const result = formatFlightDate("2022-11-05T10:00:00");

      expect(result).toBe("November 5, 2022");
    });

    it("ignores time component", () => {
      const morning = formatFlightDate("2022-11-10T06:00:00");
      const evening = formatFlightDate("2022-11-10T18:00:00");

      expect(morning).toBe(evening);
      expect(morning).toBe("November 10, 2022");
    });
  });

  describe("isDateInAvailableRange", () => {
    it("returns true for dates within range", () => {
      const date = new Date("2022-11-15");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(true);
    });

    it("returns true for minimum date", () => {
      const date = new Date("2022-11-10");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(true);
    });

    it("returns true for maximum date", () => {
      const date = new Date("2022-11-30");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(true);
    });

    it("returns false for the moment after maximum date", () => {
      const date = new Date("2022-12-01T00:00:00.000Z");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(false);
    });

    it("returns false for the moment before minimun date", () => {
      const date = new Date("2022-11-09T23:59:59.999Z");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(false);
    });

    it("returns false for dates before range", () => {
      const date = new Date("2022-11-09");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(false);
    });

    it("returns false for dates after range", () => {
      const date = new Date("2022-12-01");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(false);
    });

    it("returns false for dates in different year", () => {
      const date = new Date("2023-11-15");
      const result = isDateInAvailableRange(date);

      expect(result).toBe(false);
    });

    it("ignores time component when checking range", () => {
      const earlyMorning = new Date("2022-11-10T00:00:00.000Z");
      const lateNight = new Date("2022-11-30T23:59:59.999Z");

      expect(isDateInAvailableRange(earlyMorning)).toBe(true);
      expect(isDateInAvailableRange(lateNight)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("min and max dates work with isDateInAvailableRange", () => {
      const minDate = getMinSelectableDate();
      const maxDate = getMaxSelectableDate();

      expect(isDateInAvailableRange(minDate)).toBe(true);
      expect(isDateInAvailableRange(maxDate)).toBe(true);
    });

    it("date range functions work together", () => {
      const minDate = getMinSelectableDate();
      const maxDate = getMaxSelectableDate();

      // Min should be before max
      expect(minDate.getTime()).toBeLessThan(maxDate.getTime());

      // Both should format correctly for inputs
      const minFormatted = formatDateForInput(minDate);
      const maxFormatted = formatDateForInput(maxDate);

      expect(minFormatted).toBe("2022-11-10");
      expect(maxFormatted).toBe("2022-11-30");
    });

    it("parsing and formatting are reciprocal operations", () => {
      const originalDateString = "2022-11-15";
      const parsed = parseDateFromInput(originalDateString);
      const formatted = formatDateForInput(parsed);

      expect(formatted).toBe(originalDateString);
    });
  });

  describe("Edge Cases", () => {
    it("handles leap year dates", () => {
      const leapYearDate = new Date("2024-02-29T12:00:00.000Z");
      const formatted = formatDateForInput(leapYearDate);

      expect(formatted).toBe("2024-02-29");
    });

    it("handles invalid ISO date strings", () => {
      expect(() => {
        formatFlightTime("invalid-date");
      }).not.toThrow(); // Should handle gracefully, not crash
    });
  });
});
