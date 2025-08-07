import { FlightOffer, AirportsData } from "@/types/flight-data";
import { getAirportName } from "@/utils/airport-utils";
import { formatFlightTime, formatFlightDate } from "@/utils/date-utils";
import styles from "./FlightResults.module.css";

interface FlightResultsProps {
  flights: FlightOffer[];
  airports: AirportsData;
  isLoading?: boolean;
}

interface FlightCardProps {
  flight: FlightOffer;
  airports: AirportsData;
}

function FlightCard({ flight, airports }: FlightCardProps) {
  const { outboundFlight, pricingInfoSum, deeplink } = flight;

  const originName = getAirportName(
    airports,
    outboundFlight.departureAirport.locationCode,
  );
  const hasOriginName =
    originName !== outboundFlight.departureAirport.locationCode;
  const destinationName = getAirportName(
    airports,
    outboundFlight.arrivalAirport.locationCode,
  );
  const hasDestinationName =
    destinationName !== outboundFlight.arrivalAirport.locationCode;

  const departureTime = formatFlightTime(outboundFlight.departureDateTime);
  const arrivalTime = formatFlightTime(outboundFlight.arrivalDateTime);
  const flightDate = formatFlightDate(outboundFlight.departureDateTime);

  return (
    <div className={styles.flightCard}>
      <div className={styles.flightHeader}>
        <div className={styles.flightInfo}>
          <div className={styles.route}>
            <span className={styles.airport}>
              <span className={styles.airportCode}>
                {outboundFlight.departureAirport.locationCode}
              </span>
              {hasOriginName && (
                <span className={styles.airportName}>{originName}</span>
              )}
            </span>
            <div className={styles.arrow}>→</div>
            <span className={styles.airport}>
              <span className={styles.airportCode}>
                {outboundFlight.arrivalAirport.locationCode}
              </span>
              {hasDestinationName && (
                <span className={styles.airportName}>{destinationName}</span>
              )}
            </span>
          </div>
          <div className={styles.dateInfo}>{flightDate}</div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.price}>
            €{pricingInfoSum.totalPriceAllPassengers.toFixed(2)}
          </div>
          <div className={styles.priceClass}>{pricingInfoSum.productClass}</div>
        </div>
      </div>

      <div className={styles.flightDetails}>
        <div className={styles.timeInfo}>
          <div className={styles.timeSlot}>
            <span className={styles.time}>{departureTime}</span>
            <span className={styles.timeLabel}>Departure</span>
          </div>
          <div className={styles.flightMeta}>
            <span className={styles.flightNumber}>
              {outboundFlight.marketingAirline.companyShortName}{" "}
              {outboundFlight.flightNumber}
            </span>
          </div>
          <div className={styles.timeSlot}>
            <span className={styles.time}>{arrivalTime}</span>
            <span className={styles.timeLabel}>Arrival</span>
          </div>
        </div>

        <div className={styles.priceBreakdown}>
          <div className={styles.fareDetails}>
            <span>Base fare: €{pricingInfoSum.baseFare.toFixed(2)}</span>
            <span>Taxes & fees: €{pricingInfoSum.taxSurcharge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <a
          href={deeplink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bookButton}
        >
          Book Flight
        </a>
      </div>
    </div>
  );
}

export default function FlightResults({
  flights,
  airports,
  isLoading = false,
}: FlightResultsProps) {
  if (isLoading) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Searching for flights...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✈️</div>
          <h3>No flights found</h3>
          <p>
            We couldn&apos;t find any flights matching your search criteria.
            Please try adjusting your destination or departure date.
          </p>
          <div className={styles.suggestionBox}>
            <strong>Available flights are limited to:</strong>
            <ul>
              <li>Origin: Amsterdam (AMS)</li>
              <li>Dates: November 10-30, 2022</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2>Available Flights</h2>
        <div className={styles.resultsCount}>
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </div>
      </div>

      <div className={styles.flightsList}>
        {flights.map((flight) => (
          <FlightCard
            key={flight.outboundFlight.id}
            flight={flight}
            airports={airports}
          />
        ))}
      </div>
    </div>
  );
}
