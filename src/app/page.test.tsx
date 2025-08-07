import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlightSearchPage from "@/app/page";

const mockAirportsData = {
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
  ],
};

const mockFlightsData = {
  resultSet: { count: 1 },
  flightOffer: [
    {
      outboundFlight: {
        id: "AMSFNC20221110HV6629",
        departureDateTime: "2022-11-10T06:25:00",
        arrivalDateTime: "2022-11-10T09:35:00",
        marketingAirline: { companyShortName: "HV" },
        flightNumber: 6629,
        departureAirport: { locationCode: "AMS" },
        arrivalAirport: { locationCode: "FNC" },
      },
      pricingInfoSum: {
        totalPriceAllPassengers: 58.7,
        totalPriceOnePassenger: 58.7,
        baseFare: 29.51,
        taxSurcharge: 29.19,
        currencyCode: "EUR",
        productClass: "Basic",
      },
      deeplink: { href: "https://www.transavia.com/booking" },
    },
  ],
};

const text = {
  loading: "Loading flight search...",
};

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("Flight Search Page Integration", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Application Loading", () => {
    it("shows loading state while data is being fetched", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      // Should show loading state initially
      expect(screen.getByText(text.loading)).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please wait while we prepare your flight search experience.",
        ),
      ).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(text.loading)).not.toBeInTheDocument();
      });
    });

    it("renders header and form after data loads successfully", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Transavia Flight Search")).toBeInTheDocument();
      });

      // Check that main elements are rendered
      expect(
        screen.getByText("Find your perfect flight with ease"),
      ).toBeInTheDocument();
      expect(screen.getByText("Find Your Flight")).toBeInTheDocument();
      expect(screen.getByLabelText(/origin airport/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/destination airport/i)).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("shows error state when data loading fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Failed to load"));

      render(<FlightSearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Unable to Load Flight Data"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Failed to load")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });

    it("shows error when airports data fails to load", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Failed to load airports data"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Unable to Load Flight Data"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Happy Path Integration", () => {
    it("completes full search flow successfully", async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Find Your Flight")).toBeInTheDocument();
      });

      // Fill out the form
      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const searchButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.selectOptions(destinationSelect, "FNC");
      await user.type(dateInput, "2022-11-10");

      // Submit the form
      await user.click(searchButton);

      // Should show loading state briefly
      await waitFor(() => {
        expect(
          screen.getByText("Searching for flights..."),
        ).toBeInTheDocument();
      });

      // Then show results
      await waitFor(() => {
        expect(screen.getByText("Available Flights")).toBeInTheDocument();
      });

      // Verify flight results are displayed
      expect(screen.getByText("1 flight found")).toBeInTheDocument();
      expect(screen.getByText("FNC")).toBeInTheDocument();
      expect(screen.getByText("Funchal")).toBeInTheDocument();
      expect(screen.getByText("€58.70")).toBeInTheDocument();
      expect(screen.getByText("Book Flight")).toBeInTheDocument();
    });

    it("handles no results scenario", async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Find Your Flight")).toBeInTheDocument();
      });

      // Search for a date with no flights
      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const searchButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.selectOptions(destinationSelect, "FNC");
      await user.type(dateInput, "2022-11-15"); // Different date, no results
      await user.click(searchButton);

      // Should show no results
      await waitFor(() => {
        expect(screen.getByText("No flights found")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /We couldn't find any flights matching your search criteria/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Footer and Header", () => {
    it("renders header with branding and footer with context", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Transavia Flight Search")).toBeInTheDocument();
      });

      // Check header elements
      expect(
        screen.getByText("Find your perfect flight with ease"),
      ).toBeInTheDocument();

      // Check footer elements
      expect(
        screen.getByText(
          /This is a technical demonstration built for Transavia's front-end developer assessment/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Flight data available for Amsterdam \(AMS\) departures from November 10-30, 2022/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("makes correct API calls for data loading", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAirportsData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFlightsData,
        } as Response);

      render(<FlightSearchPage />);

      await waitFor(() => {
        expect(screen.getByText("Find Your Flight")).toBeInTheDocument();
      });

      // Verify correct endpoints were called
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith("/data/airports.json");
      expect(mockFetch).toHaveBeenCalledWith("/data/flights-from-AMS.json");
    });
  });
});
