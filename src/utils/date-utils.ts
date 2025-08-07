/**
 * Format a Date object to YYYY-MM-DD string for HTML date inputs
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD string from HTML date input to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateFromInput(dateString: string): Date {
  return new Date(dateString + "T00:00:00.000Z");
}

/**
 * Format flight departure/arrival time for display
 * @param dateTimeString - ISO 8601 date string from flight data
 * @returns Formatted time string (e.g., "06:25")
 */
export function formatFlightTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format flight date for display
 * @param dateTimeString - ISO 8601 date string from flight data
 * @returns Formatted date string (e.g., "November 10, 2022")
 */
export function formatFlightDate(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Check if a date falls within the available flight data range
 * Data is available from 2022-11-10 to 2022-11-30
 * @param date - Date to validate
 * @returns true if date is within available range
 */
export function isDateInAvailableRange(date: Date): boolean {
  const minDate = new Date("2022-11-10");
  const maxDate = new Date("2022-12-01");

  return date >= minDate && date < maxDate;
}

/**
 * Get the minimum selectable date for the date picker
 * @returns Date object for 2022-11-10
 */
export function getMinSelectableDate(): Date {
  return new Date("2022-11-10");
}

/**
 * Get the maximum selectable date for the date picker
 * @returns Date object for 2022-11-30
 */
export function getMaxSelectableDate(): Date {
  return new Date("2022-11-30");
}
