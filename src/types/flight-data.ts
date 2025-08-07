export interface Airport {
  ItemName: string; // Airport code (e.g., "AMS", "FNC")
  AirportName: string; // User-friendly name (e.g., "Amsterdam (Schiphol)")
  Description: string; // Full description with country info
}

export interface AirportsData {
  Airports: Airport[];
}

export interface FlightAirport {
  locationCode: string; // Three-letter airport code
}

export interface MarketingAirline {
  companyShortName: string; // Airline code (e.g., "HV" for Transavia)
}

export interface OutboundFlight {
  id: string;
  departureDateTime: string;
  arrivalDateTime: string;
  marketingAirline: MarketingAirline;
  flightNumber: number;
  departureAirport: FlightAirport;
  arrivalAirport: FlightAirport;
}

export interface PricingInfoSum {
  totalPriceAllPassengers: number;
  totalPriceOnePassenger: number;
  baseFare: number;
  taxSurcharge: number;
  currencyCode: string;
  productClass: string;
}

export interface FlightOffer {
  outboundFlight: OutboundFlight;
  pricingInfoSum: PricingInfoSum;
  deeplink: {
    href: string;
  };
}

export interface FlightsData {
  resultSet: {
    count: number;
  };
  flightOffer: FlightOffer[];
}
