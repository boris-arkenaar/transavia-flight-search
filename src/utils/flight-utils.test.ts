import {
  filterFlightsByDestination,
  filterFlightsByDate,
  searchFlights,
  sortFlightsByDepartureTime,
} from "@/utils/flight-utils";
import { FlightsData, FlightOffer } from "@/types/flight-data";

const mockFlightsData: FlightsData = {
  resultSet: {
    count: 3,
  },
  flightOffer: [
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
        href: "https://www.transavia.com/booking-link",
      },
    },
    {
      outboundFlight: {
        id: "AMSFNC20221115HV5678",
        departureDateTime: "2022-11-15T08:15:00",
        arrivalDateTime: "2022-11-15T11:25:00",
        marketingAirline: {
          companyShortName: "HV",
        },
        flightNumber: 5678,
        departureAirport: {
          locationCode: "AMS",
        },
        arrivalAirport: {
          locationCode: "FNC",
        },
      },
      pricingInfoSum: {
        totalPriceAllPassengers: 62.3,
        totalPriceOnePassenger: 62.3,
        baseFare: 31.15,
        taxSurcharge: 31.15,
        currencyCode: "EUR",
        productClass: "Basic",
      },
      deeplink: {
        href: "https://www.transavia.com/booking-link-3",
      },
    },
  ],
};

describe("Flight Utilities", () => {
  describe("filterFlightsByDestination", () => {
    it("returns flights matching the destination airport code", () => {
      const result = filterFlightsByDestination(
        mockFlightsData.flightOffer,
        "FNC",
      );

      expect(result).toHaveLength(2);
      expect(result[0].outboundFlight.arrivalAirport.locationCode).toBe("FNC");
      expect(result[1].outboundFlight.arrivalAirport.locationCode).toBe("FNC");
    });

    it("returns flights matching destination case-insensitively", () => {
      const result = filterFlightsByDestination(
        mockFlightsData.flightOffer,
        "fnc",
      );

      expect(result).toHaveLength(2);
      expect(result[0].outboundFlight.arrivalAirport.locationCode).toBe("FNC");
    });

    it("returns empty array when no flights match destination", () => {
      const result = filterFlightsByDestination(
        mockFlightsData.flightOffer,
        "LHR",
      );

      expect(result).toHaveLength(0);
    });

    it("returns single flight when only one matches destination", () => {
      const result = filterFlightsByDestination(
        mockFlightsData.flightOffer,
        "CDG",
      );

      expect(result).toHaveLength(1);
      expect(result[0].outboundFlight.arrivalAirport.locationCode).toBe("CDG");
    });
  });

  describe("filterFlightsByDate", () => {
    const nov10Date = new Date("2022-11-10");
    const nov15Date = new Date("2022-11-15");
    const nov20Date = new Date("2022-11-20");

    it("returns flights departing on the specified date", () => {
      const allFlights = mockFlightsData.flightOffer;
      const result = filterFlightsByDate(allFlights, nov10Date);

      expect(result).toHaveLength(2);
      result.forEach((flight) => {
        const flightDate = new Date(flight.outboundFlight.departureDateTime);
        expect(flightDate.toDateString()).toBe(nov10Date.toDateString());
      });
    });

    it("returns flights departing on different specified date", () => {
      const allFlights = mockFlightsData.flightOffer;
      const result = filterFlightsByDate(allFlights, nov15Date);

      expect(result).toHaveLength(1);
      expect(result[0].outboundFlight.id).toBe("AMSFNC20221115HV5678");
    });

    it("returns empty array when no flights match the date", () => {
      const allFlights = mockFlightsData.flightOffer;
      const result = filterFlightsByDate(allFlights, nov20Date);

      expect(result).toHaveLength(0);
    });

    it("matches date regardless of time", () => {
      const allFlights = mockFlightsData.flightOffer;
      const lateInDay = new Date("2022-11-10T23:59:59");
      const result = filterFlightsByDate(allFlights, lateInDay);

      expect(result).toHaveLength(2); // Both flights on Nov 10
    });
  });

  describe("searchFlights", () => {
    it("returns flights matching both destination and date", () => {
      const searchDate = new Date("2022-11-10");
      const result = searchFlights(mockFlightsData, "FNC", searchDate);

      expect(result).toHaveLength(1);
      expect(result[0].outboundFlight.arrivalAirport.locationCode).toBe("FNC");
      expect(result[0].outboundFlight.departureDateTime).toBe(
        "2022-11-10T06:25:00",
      );
    });

    it("returns empty array when destination matches but date does not", () => {
      const searchDate = new Date("2022-11-20");
      const result = searchFlights(mockFlightsData, "FNC", searchDate);

      expect(result).toHaveLength(0);
    });

    it("returns empty array when date matches but destination does not", () => {
      const searchDate = new Date("2022-11-10");
      const result = searchFlights(mockFlightsData, "LHR", searchDate);

      expect(result).toHaveLength(0);
    });

    it("handles case-insensitive destination matching", () => {
      const searchDate = new Date("2022-11-15");
      const result = searchFlights(mockFlightsData, "fnc", searchDate);

      expect(result).toHaveLength(1);
      expect(result[0].outboundFlight.arrivalAirport.locationCode).toBe("FNC");
    });
  });

  describe("sortFlightsByDepartureTime", () => {
    it("sorts flights by departure time in ascending order", () => {
      const unsortedFlights: FlightOffer[] = [
        mockFlightsData.flightOffer[1], // 14:30
        mockFlightsData.flightOffer[0], // 06:25
        mockFlightsData.flightOffer[2], // 08:15 (later day)
      ];

      const result = sortFlightsByDepartureTime(unsortedFlights);

      expect(result[0].outboundFlight.departureDateTime).toBe(
        "2022-11-10T06:25:00",
      );
      expect(result[1].outboundFlight.departureDateTime).toBe(
        "2022-11-10T14:30:00",
      );
      expect(result[2].outboundFlight.departureDateTime).toBe(
        "2022-11-15T08:15:00",
      );
    });

    it("does not mutate the original array", () => {
      const originalFlights = [...mockFlightsData.flightOffer];
      const sorted = sortFlightsByDepartureTime(originalFlights);

      // Original array should remain unchanged
      expect(originalFlights).toEqual(mockFlightsData.flightOffer);

      // But sorted should be different
      expect(sorted).not.toEqual(originalFlights);
    });

    it("handles empty array", () => {
      const result = sortFlightsByDepartureTime([]);

      expect(result).toEqual([]);
    });

    it("handles single flight", () => {
      const singleFlight = [mockFlightsData.flightOffer[0]];
      const result = sortFlightsByDepartureTime(singleFlight);

      expect(result).toEqual(singleFlight);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty flight data", () => {
      const emptyFlightsData: FlightsData = {
        resultSet: { count: 0 },
        flightOffer: [],
      };

      const result = searchFlights(
        emptyFlightsData,
        "FNC",
        new Date("2022-11-10"),
      );
      expect(result).toEqual([]);
    });

    it("handles malformed dates gracefully", () => {
      const flightsWithBadDate: FlightsData = {
        resultSet: { count: 1 },
        flightOffer: [
          {
            ...mockFlightsData.flightOffer[0],
            outboundFlight: {
              ...mockFlightsData.flightOffer[0].outboundFlight,
              departureDateTime: "invalid-date",
            },
          },
        ],
      };

      // Should not throw error, but return empty results
      expect(() => {
        filterFlightsByDate(
          flightsWithBadDate.flightOffer,
          new Date("2022-11-10"),
        );
      }).not.toThrow();
    });
  });
});
