import { FlightOffer, FlightsData } from "@/types/flight-data";

/**
 * Parse ISO date string to Date object for comparison
 * @param dateString - ISO 8601 date string from flight data
 * @returns Date object
 */
function parseFlightDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Check if two dates are on the same calendar day
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns true if dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Filter flights by destination airport
 * @param flights - Complete flights data from flights-from-AMS.json
 * @param destinationCode - Three-letter destination airport code
 * @returns Array of matching flight offers
 */
export function filterFlightsByDestination(
  flights: FlightOffer[],
  destinationCode: string,
): FlightOffer[] {
  return flights.filter(
    (offer) =>
      offer.outboundFlight.arrivalAirport.locationCode.toLowerCase() ===
      destinationCode.toLowerCase(),
  );
}

/**
 * Filter flights by departure date
 * @param flights - Array of flight offers to filter
 * @param departureDate - Target departure date
 * @returns Array of flights departing on the specified date
 */
export function filterFlightsByDate(
  flights: FlightOffer[],
  departureDate: Date,
): FlightOffer[] {
  return flights.filter((offer) => {
    const flightDate = parseFlightDate(offer.outboundFlight.departureDateTime);
    return isSameDay(flightDate, departureDate);
  });
}

/**
 * Combined search function that filters by both destination and date
 * @param flights - Complete flights data from flights-from-AMS.json
 * @param destinationCode - Three-letter destination airport code
 * @param departureDate - Target departure date
 * @returns Array of matching flight offers
 */
export function searchFlights(
  flights: FlightsData,
  destinationCode: string,
  departureDate: Date,
): FlightOffer[] {
  const offers = flights.flightOffer;
  const destinationMatches = filterFlightsByDestination(
    offers,
    destinationCode,
  );
  return filterFlightsByDate(destinationMatches, departureDate);
}

/**
 * Sort flights by departure time (earliest first)
 * @param flights - Array of flight offers to sort
 * @returns Sorted array of flight offers
 */
export function sortFlightsByDepartureTime(
  flights: FlightOffer[],
): FlightOffer[] {
  return [...flights].sort((a, b) => {
    const dateA = parseFlightDate(a.outboundFlight.departureDateTime);
    const dateB = parseFlightDate(b.outboundFlight.departureDateTime);
    return dateA.getTime() - dateB.getTime();
  });
}
