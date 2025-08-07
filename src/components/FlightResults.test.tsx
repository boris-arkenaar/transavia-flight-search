import { render, screen } from "@testing-library/react";
import FlightResults from "@/components/FlightResults";
import { FlightOffer, AirportsData } from "@/types/flight-data";

const mockAirportsData: AirportsData = {
  Airports: [
    {
      ItemName: "AMS",
      AirportName: "Amsterdam (Schiphol)",
      Description: "Amsterdam (Schiphol), Netherlands",
    },
    {
      ItemName: "FNC",
      AirportName: "Funchal",
      Description: "Funchal, Portugal",
    },
    {
      ItemName: "CDG",
      AirportName: "Paris Charles de Gaulle",
      Description: "Paris Charles de Gaulle, France",
    },
  ],
};

const mockFlightOffers: FlightOffer[] = [
  {
    outboundFlight: {
      id: "AMSFNC20221110HV6629",
      departureDateTime: "2022-11-10T06:25:00",
      arrivalDateTime: "2022-11-10T09:35:00",
      marketingAirline: {
        companyShortName: "HV",
      },
      flightNumber: 6629,
      departureAirport: {
        locationCode: "AMS",
      },
      arrivalAirport: {
        locationCode: "FNC",
      },
    },
    pricingInfoSum: {
      totalPriceAllPassengers: 58.7,
      totalPriceOnePassenger: 58.7,
      baseFare: 29.51,
      taxSurcharge: 29.19,
      currencyCode: "EUR",
      productClass: "Basic",
    },
    deeplink: {
      href: "https://www.transavia.com/booking-link-1",
    },
  },
  {
    outboundFlight: {
      id: "AMSCDG20221110HV1234",
      departureDateTime: "2022-11-10T14:30:00",
      arrivalDateTime: "2022-11-10T16:45:00",
      marketingAirline: {
        companyShortName: "HV",
      },
      flightNumber: 1234,
      departureAirport: {
        locationCode: "AMS",
      },
      arrivalAirport: {
        locationCode: "CDG",
      },
    },
    pricingInfoSum: {
      totalPriceAllPassengers: 89.5,
      totalPriceOnePassenger: 89.5,
      baseFare: 45.25,
      taxSurcharge: 44.25,
      currencyCode: "EUR",
      productClass: "Basic",
    },
    deeplink: {
      href: "https://www.transavia.com/booking-link-2",
    },
  },
];

const text = {
  availableFlights: "Available Flights",
  noFlightsFound: "No flights found",
  searchingForFlights: "Searching for flights...",
};

describe("FlightResults Component", () => {
  describe("Loading State", () => {
    it("renders message when isLoading is true", () => {
      render(
        <FlightResults
          flights={[]}
          airports={mockAirportsData}
          isLoading={true}
        />,
      );

      expect(screen.getByText(text.searchingForFlights)).toBeInTheDocument();
    });

    it("does not render results or empty state when loading", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={true}
        />,
      );

      expect(screen.queryByText(text.availableFlights)).not.toBeInTheDocument();
      expect(screen.queryByText(text.noFlightsFound)).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no flights are provided", () => {
      render(
        <FlightResults
          flights={[]}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(screen.getByText(text.noFlightsFound)).toBeInTheDocument();
      expect(
        screen.getByText(
          /We couldn't find any flights matching your search criteria/,
        ),
      ).toBeInTheDocument();
    });

    it("renders helpful suggestions in empty state", () => {
      render(
        <FlightResults
          flights={[]}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(
        screen.getByText("Available flights are limited to:"),
      ).toBeInTheDocument();
      expect(screen.getByText("Origin: Amsterdam (AMS)")).toBeInTheDocument();
      expect(
        screen.getByText("Dates: November 10-30, 2022"),
      ).toBeInTheDocument();
    });
  });

  describe("Results Display", () => {
    it("renders results header with correct flight count", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(screen.getByText(text.availableFlights)).toBeInTheDocument();
      expect(screen.getByText("2 flights found")).toBeInTheDocument();
    });

    it("uses singular form for single flight", () => {
      const singleFlight = [mockFlightOffers[0]];
      render(
        <FlightResults
          flights={singleFlight}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(screen.getByText("1 flight found")).toBeInTheDocument();
    });

    it("renders all provided flights", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(screen.getByText("HV 6629")).toBeInTheDocument();
      expect(screen.getByText("HV 1234")).toBeInTheDocument();
    });
  });

  describe("Flight Card Rendering", () => {
    beforeEach(() => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );
    });

    it("displays airport codes and names correctly", () => {
      // Check origin airports
      expect(screen.getAllByText("AMS")).toHaveLength(2);
      expect(screen.getAllByText("Amsterdam (Schiphol)")).toHaveLength(2);

      // Check destination airports
      expect(screen.getByText("FNC")).toBeInTheDocument();
      expect(screen.getByText("Funchal")).toBeInTheDocument();
      expect(screen.getByText("CDG")).toBeInTheDocument();
      expect(screen.getByText("Paris Charles de Gaulle")).toBeInTheDocument();
    });

    it("displays flight times correctly", () => {
      // Check departure times
      expect(screen.getByText("06:25")).toBeInTheDocument();
      expect(screen.getByText("14:30")).toBeInTheDocument();

      // Check arrival times
      expect(screen.getByText("09:35")).toBeInTheDocument();
      expect(screen.getByText("16:45")).toBeInTheDocument();
    });

    it("displays flight numbers correctly", () => {
      expect(screen.getByText("HV 6629")).toBeInTheDocument();
      expect(screen.getByText("HV 1234")).toBeInTheDocument();
    });

    it("displays prices correctly formatted", () => {
      expect(screen.getByText("€58.70")).toBeInTheDocument();
      expect(screen.getByText("€89.50")).toBeInTheDocument();
    });

    it("displays fare class information", () => {
      const basicElements = screen.getAllByText("Basic");
      expect(basicElements).toHaveLength(2);
    });

    it("displays fare breakdown", () => {
      expect(screen.getByText("Base fare: €29.51")).toBeInTheDocument();
      expect(screen.getByText("Taxes & fees: €29.19")).toBeInTheDocument();
      expect(screen.getByText("Base fare: €45.25")).toBeInTheDocument();
      expect(screen.getByText("Taxes & fees: €44.25")).toBeInTheDocument();
    });

    it("displays formatted flight dates", () => {
      // Both flights are on November 10, 2022
      const dateElements = screen.getAllByText("November 10, 2022");
      expect(dateElements).toHaveLength(2);
    });
  });

  describe("Booking Links", () => {
    beforeEach(() => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );
    });

    it("renders booking buttons for all flights", () => {
      const bookingButtons = screen.getAllByText("Book Flight");
      expect(bookingButtons).toHaveLength(2);
    });

    it("booking buttons have correct href attributes", () => {
      const bookingButtons = screen.getAllByText("Book Flight");

      expect(bookingButtons[0]).toHaveAttribute(
        "href",
        "https://www.transavia.com/booking-link-1",
      );
      expect(bookingButtons[1]).toHaveAttribute(
        "href",
        "https://www.transavia.com/booking-link-2",
      );
    });

    it("booking buttons open in new tab", () => {
      const bookingButtons = screen.getAllByText("Book Flight");

      bookingButtons.forEach((button) => {
        expect(button).toHaveAttribute("target", "_blank");
        expect(button).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Airport Display Fallback", () => {
    it("handles unknown airport codes gracefully", () => {
      const flightWithUnknownAirport: FlightOffer[] = [
        {
          ...mockFlightOffers[0],
          outboundFlight: {
            ...mockFlightOffers[0].outboundFlight,
            arrivalAirport: {
              locationCode: "XYZ", // Unknown airport
            },
          },
        },
      ];

      render(
        <FlightResults
          flights={flightWithUnknownAirport}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      // Should show the airport code when name is not found
      expect(screen.getByText("XYZ")).toBeInTheDocument();
    });
  });

  describe("Component Props", () => {
    it("handles isLoading prop defaulting to false", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          // isLoading not provided, should default to false
        />,
      );

      // Should show results, not loading state
      expect(screen.getByText(text.availableFlights)).toBeInTheDocument();
      expect(
        screen.queryByText(text.searchingForFlights),
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses proper heading hierarchy", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      const heading = screen.getByRole("heading", {
        name: text.availableFlights,
      });
      expect(heading).toBeInTheDocument();
    });

    it("uses proper heading in empty state", () => {
      render(
        <FlightResults
          flights={[]}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      const heading = screen.getByRole("heading", {
        name: text.noFlightsFound,
      });
      expect(heading).toBeInTheDocument();
    });

    it("booking links are properly labeled", () => {
      render(
        <FlightResults
          flights={mockFlightOffers}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      const bookingLinks = screen.getAllByRole("link", { name: "Book Flight" });
      expect(bookingLinks).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles flights with missing pricing information", () => {
      const flightWithoutPricing: FlightOffer[] = [
        {
          ...mockFlightOffers[0],
          pricingInfoSum: {
            ...mockFlightOffers[0].pricingInfoSum,
            totalPriceAllPassengers: 0,
            baseFare: 0,
            taxSurcharge: 0,
          },
        },
      ];

      render(
        <FlightResults
          flights={flightWithoutPricing}
          airports={mockAirportsData}
          isLoading={false}
        />,
      );

      expect(screen.getByText("€0.00")).toBeInTheDocument();
      expect(screen.getByText("Base fare: €0.00")).toBeInTheDocument();
    });
  });
});
