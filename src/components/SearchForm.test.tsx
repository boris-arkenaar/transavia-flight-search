import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchForm from "@/components/SearchForm";
import { AirportsData } from "@/types/flight-data";

const mockAirportsData: AirportsData = {
  Airports: [
    {
      ItemName: "AMS",
      AirportName: "Amsterdam (Schiphol)",
      Description: "Amsterdam (Schiphol), Netherlands",
    },
    {
      ItemName: "CDG",
      AirportName: "Paris Charles de Gaulle",
      Description: "Paris Charles de Gaulle, France",
    },
    {
      ItemName: "LHR",
      AirportName: "London Heathrow",
      Description: "London Heathrow, United Kingdom",
    },
    {
      ItemName: "FNC",
      AirportName: "Funchal",
      Description: "Funchal, Portugal",
    },
  ],
};

const text = {
  selectDestination: "Please select a destination airport",
};

describe("SearchForm Component", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  describe("Rendering", () => {
    it("renders all form elements correctly", () => {
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      expect(screen.getByText("Find Your Flight")).toBeInTheDocument();

      expect(screen.getByLabelText(/origin airport/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/destination airport/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /search flights/i }),
      ).toBeInTheDocument();
    });

    it("populates origin and destination dropdowns with airport options", () => {
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const originSelect = screen.getByLabelText(/origin airport/i);

      expect(originSelect).toHaveDisplayValue("AMS - Amsterdam (Schiphol)");

      expect(screen.getAllByText("AMS - Amsterdam (Schiphol)")).toHaveLength(2);
      expect(screen.getAllByText("CDG - Paris Charles de Gaulle")).toHaveLength(
        2,
      );
      expect(screen.getAllByText("LHR - London Heathrow")).toHaveLength(2);
    });

    it("sets default origin to AMS", () => {
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const originSelect = screen.getByLabelText(/origin airport/i);
      expect(originSelect).toHaveDisplayValue("AMS - Amsterdam (Schiphol)");
    });

    it("sets correct date range constraints on date input", () => {
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const dateInput = screen.getByLabelText(/departure date/i);
      expect(dateInput).toHaveAttribute("min", "2022-11-10");
      expect(dateInput).toHaveAttribute("max", "2022-11-30");
    });
  });

  describe("Form Interactions", () => {
    it("updates origin when user selects different option", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const originSelect = screen.getByLabelText(/origin airport/i);

      await user.selectOptions(originSelect, "CDG");
      expect(originSelect).toHaveDisplayValue("CDG - Paris Charles de Gaulle");
    });

    it("updates destination when user selects option", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);

      await user.selectOptions(destinationSelect, "LHR");
      expect(destinationSelect).toHaveDisplayValue("LHR - London Heathrow");
    });

    it("updates departure date when user selects date", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const dateInput = screen.getByLabelText(/departure date/i);

      await user.type(dateInput, "2022-11-15");
      expect(dateInput).toHaveDisplayValue("2022-11-15");
    });
  });

  describe("Form validation", () => {
    it("shows error when no destination is selected", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.click(submitButton);

      expect(screen.getByText(text.selectDestination)).toBeInTheDocument();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("shows error when no departure date is selected", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.selectOptions(destinationSelect, "CDG");
      await user.click(submitButton);

      expect(
        screen.getByText("Please select a departure date"),
      ).toBeInTheDocument();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("shows error when origin and destination are the same", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      // Origin is already AMS by default
      await user.selectOptions(destinationSelect, "AMS");
      await user.type(dateInput, "2022-11-15");
      await user.click(submitButton);

      expect(
        screen.getByText("Destination must be different from origin"),
      ).toBeInTheDocument();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("shows error when date is outside available range", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.selectOptions(destinationSelect, "CDG");
      await user.type(dateInput, "2022-12-01"); // Outside range
      await user.click(submitButton);

      expect(
        screen.getByText(/Selected date is outside available range/),
      ).toBeInTheDocument();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it("clears previous errors when form is corrected", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      // First trigger validation errors
      await user.click(submitButton);
      expect(screen.getByText(text.selectDestination)).toBeInTheDocument();

      // Then fix the form
      await user.selectOptions(destinationSelect, "CDG");
      await user.type(dateInput, "2022-11-15");
      await user.click(submitButton);

      // Errors should be cleared
      expect(
        screen.queryByText(text.selectDestination),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onSearch with correct data when form is valid", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      const dateInput = screen.getByLabelText(/departure date/i);
      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.selectOptions(destinationSelect, "CDG");
      await user.type(dateInput, "2022-11-15");
      await user.click(submitButton);

      expect(mockOnSearch).toHaveBeenCalledWith({
        origin: "AMS",
        destination: "CDG",
        departureDate: new Date("2022-11-15T00:00:00.000Z"),
      });
    });
  });

  describe("Accessibility", () => {
    it("associates error messages with form fields using aria-describedby", async () => {
      const user = userEvent.setup();
      render(
        <SearchForm airports={mockAirportsData} onSearch={mockOnSearch} />,
      );

      const submitButton = screen.getByRole("button", {
        name: /search flights/i,
      });

      await user.click(submitButton);

      const destinationSelect = screen.getByLabelText(/destination airport/i);
      expect(destinationSelect).toHaveAttribute(
        "aria-describedby",
        "destination-error",
      );

      const dateInput = screen.getByLabelText(/departure date/i);
      expect(dateInput).toHaveAttribute("aria-describedby", "date-error");
    });
  });
});
