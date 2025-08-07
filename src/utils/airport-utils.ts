import { Airport, AirportsData } from "@/types/flight-data";

/**
 * Find airport information by airport code
 * @param airports - Complete airports data from airports.json
 * @param code - Three-letter airport code (e.g., "AMS", "FNC")
 * @returns Airport object if found, undefined otherwise
 */
export function findAirportByCode(
  airports: AirportsData,
  code: string,
): Airport | undefined {
  return airports.Airports.find(
    (airport) => airport.ItemName.toLowerCase() === code.toLowerCase(),
  );
}

/**
 * Get a user-friendly airport display name
 * @param airports - Complete airports data from airports.json
 * @param code - Three-letter airport code
 * @returns Formatted display name or fallback to code if not found
 */
export function getAirportName(airports: AirportsData, code: string): string {
  const airport = findAirportByCode(airports, code);
  return airport ? airport.AirportName : code.toUpperCase();
}

/**
 * Get all available airport codes from the airports data
 * @param airports - Complete airports data from airports.json
 * @returns Array of airport codes
 */
export function getAllAirportCodes(airports: AirportsData): string[] {
  return airports.Airports.map((airport) => airport.ItemName);
}
